"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SECTION_LIBRARY } from "@/lib/section-library";
import type { Section, SectionType } from "@/lib/types";
import { makeId } from "@/lib/utils";
import * as Icons from "lucide-react";

interface InsertSectionPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Called when the user picks a section type + variant. Receives the
   * fully-formed new Section (with id, type, variant, defaultData,
   * visible=true, default settings).
   */
  onInsert: (section: Section) => void;
  /**
   * Optional filter — when provided, the panel only shows sections whose
   * type or name contains the query (case-insensitive).
   */
}

function getIcon(name: string): Icons.LucideIcon {
  return (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Square;
}

/**
 * Modal listing every section library entry with variant chips. Click a
 * variant chip to insert the section (with that variant + default data)
 * at the end of the current page (or after the currently-selected row —
 * the parent decides via onInsert).
 */
export function InsertSectionPanel({
  open,
  onOpenChange,
  onInsert,
}: InsertSectionPanelProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTION_LIBRARY;
    return SECTION_LIBRARY.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
  }, [query]);

  function handlePick(type: SectionType, variant: string, defaultData: () => Record<string, unknown>) {
    const section: Section = {
      id: makeId("sec"),
      type,
      variant,
      data: defaultData(),
      visible: true,
      settings: { width: "default", spacing: "normal" },
    };
    onInsert(section);
    onOpenChange(false);
    setQuery("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>Insert section</DialogTitle>
          <DialogDescription>
            Pick a section type. Each variant ships a different default
            layout — click a chip to insert it at the end of the page.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 pb-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter sections by name or type…"
            aria-label="Filter sections"
            className="h-9 w-full rounded-md border px-3 text-sm outline-none focus:ring-2"
            style={{
              borderColor: "var(--border-strong)",
              backgroundColor: "var(--surface-1)",
              color: "var(--text-primary)",
            }}
          />
        </div>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="grid grid-cols-1 gap-3 p-1 sm:grid-cols-2">
            {filtered.length === 0 ? (
              <div
                className="col-span-full py-12 text-center text-xs"
                style={{ color: "var(--text-muted)" }}
              >
                No sections match &ldquo;{query}&rdquo;.
              </div>
            ) : (
              filtered.map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <div
                    key={item.type}
                    className="rounded-lg border p-3"
                    style={{
                      borderColor: "var(--border-subtle)",
                      backgroundColor: "var(--surface-1)",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-md"
                        style={{
                          backgroundColor: "var(--surface-2)",
                          color: "var(--accent-bright)",
                        }}
                        aria-hidden
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4
                          className="text-sm font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {item.name}
                        </h4>
                        <p
                          className="mt-1 line-clamp-2 text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.variants.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => handlePick(item.type, v, item.defaultData)}
                          className="rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-[var(--surface-2)]"
                          style={{
                            borderColor: "var(--border-strong)",
                            color: "var(--text-secondary)",
                          }}
                          aria-label={`Insert ${item.name} (${v} variant)`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
