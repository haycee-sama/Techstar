"use client";

import { sanitizeHtml } from "@/lib/utils";

interface CustomHtmlSectionData {
  html?: string;
}

/**
 * Raw HTML block. Sanitized before render (script, iframe, style,
 * inline event handlers, and javascript: URLs are all stripped).
 *
 * The editor can edit arbitrary HTML in the inspector — but
 * anything unsafe is dropped before it reaches the DOM.
 */
export function CustomHtmlSection({ data }: { data: CustomHtmlSectionData }) {
  const html = sanitizeHtml(data.html ?? "");
  if (!html.trim()) {
    return (
      <section
        className="py-12"
        style={{ backgroundColor: "var(--bg-deep)" }}
        aria-label="Custom HTML — empty"
      >
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-lg border border-dashed p-8 text-center text-xs"
            style={{
              borderColor: "var(--border-strong)",
              color: "var(--text-muted)",
            }}
          >
            Empty custom HTML block — add markup in the inspector.
          </div>
        </div>
      </section>
    );
  }
  return (
    <section aria-label="Custom HTML">
      <div
        className="custom-html-block"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
