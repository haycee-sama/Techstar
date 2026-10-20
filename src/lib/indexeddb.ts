"use client";

// ============================================================
// IndexedDB helper — media uploads (Phase 4b)
// Browser-local persistence for user-uploaded media blobs.
//
// Demo-grade by design:
//  - Uploads are NOT hosted and may be cleared when the user clears
//    their browser data. Suitable for preview only — not production.
//  - When IndexedDB is unavailable (private mode / legacy browser),
//    falls back transparently to an in-memory Map so the UI keeps
//    working for the session. Callers should surface a toast so the
//    user knows uploads won't persist.
// ============================================================

const DB_NAME = "techstar-media";
const STORE_NAME = "assets";
const DB_VERSION = 1;

/**
 * Metadata persisted alongside each blob. The blob itself is stored
 * as a separate property on the same record so the read path can
 * return just the Blob (per the brief) while still listing metadata
 * for the library's initial mount.
 */
export interface StoredMediaBlob {
  id: string;
  blob: Blob;
  fileName: string;
  type: string; // MIME type
  size: number;
  createdAt: string;
}

export interface PutMediaMeta {
  fileName: string;
  type: string;
  size: number;
  createdAt: string;
}

/**
 * Thrown when an IndexedDB write exceeds the browser's storage quota.
 * Callers should catch this and surface a toast like
 * "Storage limit reached — remove older uploads to free space".
 */
export class MediaQuotaError extends Error {
  constructor(message = "Storage limit reached — remove older uploads to free space") {
    super(message);
    this.name = "MediaQuotaError";
  }
}

/**
 * Thrown by `openMediaDB` (and re-thrown by the public write/read API
 * when fallback is explicitly bypassed) when IndexedDB is unavailable —
 * e.g. private mode on some browsers, legacy engines, or SSR.
 *
 * Callers should catch this, toast "IndexedDB unavailable — upload
 * will not persist after refresh", and fall back to the in-memory Map.
 *
 * Note: the public API (`putMediaBlob` / `getMediaBlob` / `deleteMediaBlob`
 * / `listMediaBlobs`) wraps `openMediaDB` in `withFallback`, so callers
 * using those helpers will never see this error escape — they get the
 * graceful in-memory fallback plus the `takeMemoryUnavailableFlag()`
 * signal to surface a one-shot toast. The class is exported for callers
 * that want to `instanceof`-check it explicitly or call `openMediaDB`
 * directly.
 */
export class IndexedDBUnavailableError extends Error {
  constructor(message = "IndexedDB is unavailable in this environment") {
    super(message);
    this.name = "IndexedDBUnavailableError";
  }
}

/**
 * True when the browser exposes the IndexedDB API. False in private
 * mode on some browsers, in legacy engines, and during SSR.
 */
export function isIndexedDBAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

// ============================================================
// In-memory fallback (private mode / disabled IndexedDB)
// ============================================================
// The Map stores the same shape as StoredMediaBlob so the public API
// can stay uniform. The Map is module-scoped — it survives React
// re-mounts but not page reloads (which is the correct semantic for
// "uploads won't persist" in private mode).

const memoryStore = new Map<string, StoredMediaBlob>();
let memoryUnavailableNotified = false;

/**
 * Mark that the caller has been notified about the unavailable
 * IndexedDB. Useful for one-shot toasting in the MediaLibrary.
 */
export function takeMemoryUnavailableFlag(): boolean {
  const v = memoryUnavailableNotified;
  memoryUnavailableNotified = false;
  return v;
}

/**
 * Set the unavailable flag (called by openMediaDB when it falls back
 * to the in-memory store). Idempotent.
 */
function markMemoryFallback() {
  memoryUnavailableNotified = true;
}

// ============================================================
// OPEN
// ============================================================

/**
 * Open the `techstar-media` IndexedDB database. Returns a Promise
 * that resolves to a live IDBDatabase, or rejects with a fallback
 * signal so callers can fall back to the in-memory Map.
 */
export function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      markMemoryFallback();
      reject(new IndexedDBUnavailableError());
      return;
    }
    let db: IDBDatabase;
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
      req.onsuccess = () => {
        const opened = req.result;
        // Some browsers (Firefox private mode) succeed opening but
        // fail on the first transaction. Probe with a read.
        try {
          const probe = opened.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
          probe.onsuccess = () => resolve(opened);
          probe.onerror = () => {
            opened.close();
            markMemoryFallback();
            reject(new IndexedDBUnavailableError("IndexedDB probe failed — falling back to memory"));
          };
        } catch (err) {
          opened.close();
          markMemoryFallback();
          reject(new IndexedDBUnavailableError(err instanceof Error ? err.message : "IndexedDB probe threw"));
        }
      };
      req.onerror = () => {
        markMemoryFallback();
        reject(new IndexedDBUnavailableError(req.error?.message ?? "Failed to open IndexedDB"));
      };
      req.onblocked = () => {
        // Older version still open — fall back rather than hang.
        markMemoryFallback();
        reject(new IndexedDBUnavailableError("IndexedDB open blocked — falling back to memory"));
      };
    } catch (err) {
      markMemoryFallback();
      reject(
        err instanceof IndexedDBUnavailableError
          ? err
          : new IndexedDBUnavailableError(err instanceof Error ? err.message : "IndexedDB open threw")
      );
    }
  });
}

function awaitRequest<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}

/**
 * Try IndexedDB first; on failure, fall back to the in-memory Map.
 * Never throws — callers check `takeMemoryUnavailableFlag()` to know
 * whether to surface a "won't persist" toast.
 */
async function withFallback<T>(fn: (db: IDBDatabase) => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  if (!isIndexedDBAvailable()) {
    return fallback();
  }
  let db: IDBDatabase;
  try {
    db = await openMediaDB();
  } catch {
    return fallback();
  }
  try {
    return await fn(db);
  } catch (err) {
    if (err instanceof MediaQuotaError) throw err;
    // Any other failure should also fall back so the UI keeps working.
    return fallback();
  } finally {
    try {
      db.close();
    } catch {
      // ignore
    }
  }
}

function isQuotaError(err: unknown): boolean {
  if (err instanceof DOMException) {
    return (
      err.name === "QuotaExceededError" ||
      err.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
      err.code === DOMException.QUOTA_EXCEEDED_ERR
    );
  }
  return false;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Persist a media blob to IndexedDB under the given id. Throws a
 * MediaQuotaError when storage is exhausted. Falls back to the
 * in-memory Map if IndexedDB is unavailable.
 */
export async function putMediaBlob(
  id: string,
  blob: Blob,
  meta: PutMediaMeta
): Promise<void> {
  const entry: StoredMediaBlob = {
    id,
    blob,
    ...meta,
  };

  await withFallback(
    async (db) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      try {
        await awaitRequest(tx.objectStore(STORE_NAME).put(entry));
      } catch (err) {
        if (isQuotaError(err)) {
          throw new MediaQuotaError();
        }
        throw err;
      }
    },
    async () => {
      memoryStore.set(id, entry);
    }
  );
}

/**
 * Read a single stored blob by id. Returns just the Blob (no
 * metadata) per the brief. Returns undefined if the id is unknown.
 */
export async function getMediaBlob(id: string): Promise<Blob | undefined> {
  return withFallback(
    async (db) => {
      const result = await awaitRequest<StoredMediaBlob | undefined>(
        db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(id)
      );
      return result?.blob;
    },
    async () => memoryStore.get(id)?.blob
  );
}

/**
 * Delete a stored blob by id.
 */
export async function deleteMediaBlob(id: string): Promise<void> {
  await withFallback(
    async (db) => {
      await awaitRequest(
        db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id)
      );
    },
    async () => {
      memoryStore.delete(id);
    }
  );
}

/**
 * List all stored blobs (oldest first). Used by the Media Library on
 * initial mount to surface user uploads alongside seed media.
 */
export async function listMediaBlobs(): Promise<StoredMediaBlob[]> {
  const all = await withFallback<StoredMediaBlob[]>(
    async (db) => {
      const result = await awaitRequest<StoredMediaBlob[]>(
        db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll()
      );
      return result ?? [];
    },
    async () => Array.from(memoryStore.values())
  );
  return all.sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

/**
 * Clear every stored blob. Used by the "Reset only media" action in
 * the danger zone.
 */
export async function clearAllMediaBlobs(): Promise<void> {
  await withFallback(
    async (db) => {
      await awaitRequest(
        db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear()
      );
    },
    async () => {
      memoryStore.clear();
    }
  );
}

/**
 * Convert a stored blob to an object URL that the browser can render.
 * The caller is responsible for revoking the URL when the asset is
 * removed from the DOM (or just accept that it lives for the session).
 */
export function blobToObjectUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Detect image vs video vs document/audio from a MIME type string.
 */
export function mediaKindFromMime(
  mime: string
): "image" | "video" | "document" | "audio" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}
