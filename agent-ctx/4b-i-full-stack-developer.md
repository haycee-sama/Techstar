# Phase 4b-i — Media Library + IndexedDB

Task ID: 4b-i
Agent: full-stack-developer
Files touched:
  - `src/lib/indexeddb.ts` (added `IndexedDBUnavailableError` class; rewrote `openMediaDB` to throw it from every unavailable branch)
  - `src/components/admin/MediaLibrary.tsx` (replaced `Select` type filter with `ToggleGroup` segmented control; added `useDebouncedValue` to search; added `group-focus-within:opacity-100` to grid-tile hover overlay for keyboard accessibility; aligned IndexedDB-unavailable toast wording with brief; re-exported `IndexedDBUnavailableError`; dropped unused `formatBytes` import)
  - `src/components/admin/MediaDetailDialog.tsx` (changed alt-text field from `<Input>` to `<Textarea rows={3}>` per brief)
  - `src/components/admin/MediaUploadDialog.tsx` (explicitly catches `IndexedDBUnavailableError` and `MediaQuotaError` separately; aligned unavailable toast wording with brief — "IndexedDB unavailable — upload will not persist after refresh")
  - `src/components/admin/AdminBreadcrumbs.tsx` (pre-existing bug: breadcrumb lookup matched the `/admin` (Dashboard) nav item before more-specific items like `/admin/media` — fixed with two-pass lookup: exact-match first, then longest-prefix-match)
Pre-existing files already in spec compliance from prior parallel pass (verified, no changes):
  - `src/lib/router.tsx` (already had `adminMedia` route entry + breadcrumbs + `noindex: true`)
  - `src/components/admin/nav-config.ts` (Media sidebar item already live — no `disabled` flag)
  - `src/app/page.tsx` (`case "/admin/media": return <MediaLibrary />;` already wired in `dispatchAdminRoute`)
  - `src/components/admin/MediaPickerDialog.tsx` (already supports the "Upload new (demo)" flow)
  - `src/components/admin/ConfirmDialog.tsx` (already exists; used by MediaLibrary for delete confirmation)

Verification:
- `bun run lint` → exit code 0, 0 errors, 0 warnings.
- `npx tsc --noEmit` → 0 errors in any Phase 4b-i file (`indexeddb.ts`, `MediaLibrary.tsx`, `MediaDetailDialog.tsx`, `MediaUploadDialog.tsx`, `AdminBreadcrumbs.tsx`, `router.tsx`, `nav-config.ts`, `page.tsx`). Pre-existing Phase 2b errors (`ConsultationWizard`, `SolutionConfigurator`, `inquiry-schema`) are out of scope.
- Dev server: started detached via `bun run dev`, returns HTTP 200 on `/`. No runtime errors in `dev.log`.
- End-to-end browser test via `agent-browser`:
  1. Logged into `#/admin/login` (admin@techstar.example / demo)
  2. Navigated to `#/admin/media` — page title "Media library — Techstar" confirmed; toolbar rendered (search box, ToggleGroup segmented filter with All/Image/Video/Embed, view toggle, Upload button); honest-scope alert rendered.
  3. Breadcrumb previously said "Dashboard" for every admin sub-route — fixed and verified it now correctly says "Media" on `/admin/media`.
  4. Clicked Upload → dialog opened with file picker (accept `image/*,video/*`), drag-and-drop region, and IndexedDB-persistence note.
  5. Uploaded a 67-byte test PNG — asset appeared in grid with `test.png` filename + `IMAGE` chip. Toast "Asset uploaded (demo — local storage only)" fired.
  6. Refreshed the page — `test.png` still present (IndexedDB persistence verified).
  7. Clicked Edit on the tile → Media detail dialog opened with title, alt-text **Textarea**, description, read-only metadata, and Copy/Copy markdown/Use as featured/Delete buttons.
  8. Clicked Delete → ConfirmDialog "Delete media asset?" appeared. Cancel preserved the asset.
  9. Clicked Delete from grid → ConfirmDialog → confirmed → asset removed from grid and IndexedDB. Other seed assets (control-room.jpg, harborview.jpg, etc.) still present.

Stage summary:
- Phase 4b-i is complete and verified end-to-end. The Media Library at `#/admin/media` is fully live: search (debounced 150ms), segmented type filter, grid/list toggle, upload (validates type + 10MB max + IndexedDB persistence with quota/unavailable error handling), edit (title/description/alt-text textarea with required warning, read-only filename/type/dimensions/created), copy URL, copy markdown, delete (with ConfirmDialog).
- IndexedDB wrapper exposes `openMediaDB`, `putMediaBlob`, `getMediaBlob`, `deleteMediaBlob`, `listMediaBlobs`, `clearAllMediaBlobs`, `blobToObjectUrl`, `mediaKindFromMime`, plus the `StoredMediaBlob`/`PutMediaMeta` interfaces and the `MediaQuotaError`/`IndexedDBUnavailableError` classes. The public API (`putMediaBlob`/`getMediaBlob`/`deleteMediaBlob`/`listMediaBlobs`) wraps `openMediaDB` in `withFallback` so callers get the in-memory Map fallback transparently + a one-shot `takeMemoryUnavailableFlag()` signal for toasting.
- Bug fixed along the way: `AdminBreadcrumbs` was matching `/admin` (Dashboard) before more specific items like `/admin/media`, so every admin sub-route showed "Dashboard" as the final crumb. Rewrote the lookup to two-pass: exact equality first, then longest-prefix-match.

What Phase 4b-ii needs to know:
1. **The Media Library is the single source of truth for `MediaAsset` records** — `useMedia()` (from `@/lib/content-store`) returns the union of seed media + any IndexedDB-persisted uploads the Media Library mounted on first paint. The MediaPickerDialog in the page editor + section editors should continue to use `useMedia()` + `upsertMedia()` — no changes needed.
2. **IndexedDB persistence is opt-in via the MediaLibrary's mount effect** — when the Media Library first mounts, it calls `listMediaBlobs()` and re-creates object URLs for every persisted upload. If a different component (e.g. the page editor) is mounted first and the user never visited the Media Library, IndexedDB uploads won't be visible there. The MediaPickerDialog's "Upload new (demo)" flow creates an in-memory-only asset via `upsertMedia` — it does NOT persist to IndexedDB. If Phase 4b-ii needs persistence from the picker, it should call `putMediaBlob` directly (and ideally reuse the MediaUploadDialog code path).
3. **The `IndexedDBUnavailableError` class is exported from `@/lib/indexeddb`** and re-exported from `@/components/admin/MediaLibrary`. The public API (`putMediaBlob` etc.) swallows it via `withFallback` and surfaces the unavailability via `takeMemoryUnavailableFlag()` instead — so callers that use the public API will never see this throw escape. Callers that need to `instanceof`-check it (e.g. an explicit catch) can import it from either location.
4. **The `MediaQuotaError` is the only error the public API can throw** — `putMediaBlob` re-throws it when IDB write hits the quota. `MediaUploadDialog` catches it explicitly and toasts "Storage limit reached — remove older uploads to free space" then aborts the upload for that file.
5. **`window.__techstarClearMediaBlobs()` is exposed by the MediaLibrary** — a best-effort helper that clears every uploaded blob from IndexedDB (used by the danger-zone reset path if Phase 4b-ii adds one). Phase 4b-ii should prefer calling this over re-implementing the loop.
6. **`StoredMediaBlob` shape** — `{ id, blob, fileName, type, size, createdAt }`. The blob's MIME type drives the `mediaKindFromMime` classification. `MediaAsset.type` is set to `"image"` for image MIME and `"video"` for video MIME; audio/document are bucketed into `"embed"` for the type filter (though they aren't produced by the upload dialog since it rejects non-image/video).
7. **The ToggleGroup type filter** uses Radix ToggleGroup `type="single"` with a guarded `onValueChange` (Radix fires an empty string when the active item is clicked again — the guard prevents blanking the filter). If Phase 4b-ii adds more filter dimensions (e.g. tag chips), follow the same pattern.
8. **The breadcrumb fix is general** — it benefits every admin sub-route, not just `/admin/media`. Phase 4b-ii should not regress it (don't put `/admin` first in `ADMIN_NAV_GROUPS`'s flat list and assume `find` will pick a more-specific item — it won't, by default).
