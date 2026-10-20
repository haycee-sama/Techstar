"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ChevronRight, Menu, Search, X } from "lucide-react";
import { Link, useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import { useContent } from "@/lib/content-store";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";

export function Header() {
  const { navigation } = useContent();
  const { parsed, navigate } = useRouter();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [parsed.path]);

  // ESC closes mega menu
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onHome = parsed.name === "home";
  // When transparent-over-hero (onHome && !scrolled), the header overlays
  // the hero section. The hero section's `backgroundColor` is `var(--bg-deep)`
  // which is theme-aware — deep navy in dark mode, off-white in light mode.
  // So overlay text uses the theme-aware `--text-secondary` / `--accent-bright`
  // tokens, NOT a forced white. (The original `--text-secondary` value is
  // already correct: light gray on dark navy in dark mode, dark gray on
  // off-white in light mode — both pass WCAG AA.)
  const overlayMode = onHome && !scrolled;

  // In overlay mode the header has no background, so we still want the
  // theme-aware text color. In solid mode, same colors work because the
  // solid header bg is `var(--bg-navy)` which is the same hue family as
  // the hero bg.
  const navText = "var(--text-secondary)";
  const navTextHover = "var(--accent-bright)";
  const navTextActive = "var(--accent-bright)";
  const iconColor = "var(--text-secondary)";

  return (
    <>
      <header
        className={cn(
          "transition-colors duration-300",
          overlayMode ? "bg-transparent" : "backdrop-blur-md border-b"
        )}
        style={{
          backgroundColor: overlayMode
            ? "transparent"
            : "color-mix(in srgb, var(--bg-navy) 78%, transparent)",
          borderColor: overlayMode ? "transparent" : "var(--border-subtle)",
        }}
        role="banner"
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            aria-label="Techstar home"
            className="focus-visible:outline-offset-4 rounded-md"
          >
            <Logo size="md" />
          </Link>

          {isDesktop ? (
            <nav aria-label="Primary" className="flex items-center gap-1">
              {navigation.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    to={item.href}
                    className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
                    style={{
                      color: isActiveTopLevel(parsed.path, item.href)
                        ? navTextActive
                        : navText,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color = navTextHover;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        isActiveTopLevel(parsed.path, item.href)
                          ? navTextActive
                          : navText;
                    }}
                    onFocus={() => item.children && setOpenMenu(item.label)}
                  >
                    {item.label}
                    {item.children && (
                      <ChevronRight
                        className="size-3.5 rotate-90 transition-transform"
                        style={{
                          transform: openMenu === item.label ? "rotate(180deg)" : "rotate(90deg)",
                          color: isActiveTopLevel(parsed.path, item.href)
                            ? navTextActive
                            : navText,
                        }}
                        aria-hidden
                      />
                    )}
                  </Link>

                  {item.children && openMenu === item.label && (
                    <MegaMenu
                      item={item}
                      onNavigate={(href) => navigate(href)}
                    />
                  )}
                </div>
              ))}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Open search (Cmd+K)"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("techstar:open-command"));
              }}
              className="hidden sm:inline-flex"
              style={{ color: iconColor }}
            >
              <Search className="size-4" aria-hidden />
            </Button>
            <ThemeToggle forceOverlayColor={overlayMode} />
            <Button
              asChild
              size="sm"
              className="hidden sm:inline-flex"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/contact">Request a consultation</Link>
            </Button>
            {!isDesktop && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                onClick={() => setMobileOpen(true)}
                style={{ color: iconColor }}
              >
                <Menu className="size-5" aria-hidden />
              </Button>
            )}
          </div>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88%] max-w-md p-0" aria-label="Mobile navigation">
          <SheetTitle className="sr-only">Techstar navigation</SheetTitle>
          <div className="flex h-16 items-center justify-between border-b px-5" style={{ borderColor: "var(--border-subtle)" }}>
            <Logo size="md" />
            <Button variant="ghost" size="icon" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
              <X className="size-5" aria-hidden />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 overflow-y-auto p-4 scrollbar-thin" aria-label="Mobile primary">
            <Accordion type="multiple" className="w-full">
              {navigation.map((item) =>
                item.children ? (
                  <AccordionItem key={item.label} value={item.label} className="border-b" style={{ borderColor: "var(--border-subtle)" }}>
                    <AccordionTrigger className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                      {item.label}
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="flex flex-col gap-1">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              to={child.href}
                              className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--surface-2)]"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              <div className="font-medium" style={{ color: "var(--text-primary)" }}>
                                {child.label}
                              </div>
                              {child.description && (
                                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                                  {child.description}
                                </div>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="block border-b px-3 py-4 text-base font-medium"
                    style={{
                      borderColor: "var(--border-subtle)",
                      color: isActiveTopLevel(parsed.path, item.href)
                        ? "var(--accent-bright)"
                        : "var(--text-primary)",
                    }}
                  >
                    {item.label}
                  </Link>
                )
              )}
            </Accordion>
          </nav>
          <div className="mt-auto border-t p-4" style={{ borderColor: "var(--border-subtle)" }}>
            <Button
              asChild
              className="w-full"
              style={{ backgroundColor: "var(--accent)", color: "#fff" }}
            >
              <Link to="/contact">Request a consultation</Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function isActiveTopLevel(current: string, href: string): boolean {
  const cur = current.replace(/^\//, "").split("/")[0] || "";
  const tgt = href.replace(/^#\/?/, "").split("/")[0] || "";
  return cur === tgt;
}

interface MegaMenuProps {
  item: { label: string; href: string; children?: { label: string; href: string; description?: string; group?: string }[] };
  onNavigate: (href: string) => void;
}

function MegaMenu({ item, onNavigate }: MegaMenuProps) {
  if (!item.children) return null;
  // Group children by `group` if present
  const grouped: Record<string, typeof item.children> = {};
  for (const child of item.children) {
    const key = child.group || "All";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(child);
  }
  const groupKeys = Object.keys(grouped);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.18 }}
        className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
        style={{ width: "min(640px, 92vw)" }}
      >
        <div
          className="grid grid-cols-2 gap-6 rounded-xl border p-5 shadow-2xl"
          style={{
            backgroundColor: "color-mix(in srgb, var(--bg-navy) 96%, transparent)",
            backdropFilter: "blur(12px)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {groupKeys.map((g) => (
            <div key={g}>
              <div className="eyebrow mb-3">{g}</div>
              <ul className="flex flex-col gap-0.5">
                {grouped[g].map((child) => (
                  <li key={child.href}>
                    <Link
                      to={child.href}
                      onClick={() => onNavigate(child.href)}
                      className="group block rounded-md px-3 py-2 transition-colors hover:bg-[var(--surface-2)]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                          {child.label}
                        </span>
                        <ChevronRight
                          className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                          style={{ color: "var(--accent-bright)" }}
                          aria-hidden
                        />
                      </div>
                      {child.description && (
                        <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {child.description}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col-span-2 mt-1 border-t pt-3" style={{ borderColor: "var(--border-subtle)" }}>
            <Link
              to={item.href}
              className="inline-flex items-center gap-1 text-sm font-medium"
              style={{ color: "var(--accent-bright)" }}
            >
              View all {item.label.toLowerCase()}
              <ChevronRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
