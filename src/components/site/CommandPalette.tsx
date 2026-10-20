"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useRouter } from "@/lib/router";
import { useContentStore, useContent } from "@/lib/content-store";
import { clearAdminSession, getAdminSession } from "@/components/admin/AdminGuard";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  FileText,
  HelpCircle,
  Home,
  LayoutDashboard,
  Layers,
  LogOut,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Sun,
  Wrench,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const { navigate } = useRouter();
  const { services, projects, articles, faqs, pages } = useContent();
  const { resetToSeed } = useContentStore();
  const { setTheme, resolvedTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  useEffect(() => {
    const check = () => {
      setIsAdmin(window.location.hash.startsWith("#/admin"));
      setHasSession(!!getAdminSession());
    };
    check();
    window.addEventListener("hashchange", check);
    window.addEventListener("techstar:admin:session-change", check);
    return () => {
      window.removeEventListener("hashchange", check);
      window.removeEventListener("techstar:admin:session-change", check);
    };
  }, []);

  const go = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  const run = (fn: () => void) => {
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search services, projects, insights, or jump to..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Quick actions">
          <CommandItem onSelect={() => go("/contact")}>
            <Palette className="size-4" aria-hidden />
            <span>Request a consultation</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              )
            }
          >
            {resolvedTheme === "dark" ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <Moon className="size-4" aria-hidden />
            )}
            <span>Toggle theme</span>
          </CommandItem>
          <CommandItem onSelect={() => go("/admin")}>
            <Settings className="size-4" aria-hidden />
            <span>Go to admin</span>
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                resetToSeed();
                import("sonner").then(({ toast }) =>
                  toast.success("Demo content reset to seed")
                );
              })
            }
          >
            <RotateCcw className="size-4" aria-hidden />
            <span>Reset demo content to seed</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              onOpenChange(false);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <Home className="size-4" aria-hidden />
            <span>Back to top</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        {isAdmin && hasSession ? (
          <>
            <CommandGroup heading="Admin">
              <CommandItem onSelect={() => go("/admin")}>
                <LayoutDashboard className="size-4" aria-hidden />
                <span>Admin dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/pages")}>
                <FileText className="size-4" aria-hidden />
                <span>Manage pages</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/services")}>
                <Wrench className="size-4" aria-hidden />
                <span>Manage services</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/projects")}>
                <Building2 className="size-4" aria-hidden />
                <span>Manage projects</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/articles")}>
                <Layers className="size-4" aria-hidden />
                <span>Manage articles</span>
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/inquiries")}>
                <Layers className="size-4" aria-hidden />
                <span>View inquiries</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  run(() => {
                    clearAdminSession();
                    navigate("/admin/login", { replace: true });
                  })
                }
              >
                <LogOut className="size-4" aria-hidden />
                <span>Sign out of admin</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
          </>
        ) : null}

        <CommandGroup heading="Pages">
          {pages.slice(0, 6).map((p) => (
            <CommandItem key={p.slug} onSelect={() => go(`/${p.slug === "home" ? "" : p.slug}`)}>
              <FileText className="size-4" aria-hidden />
              <span>{p.title}</span>
            </CommandItem>
          ))}
          <CommandItem onSelect={() => go("/services")}>
            <Layers className="size-4" aria-hidden />
            <span>View all services</span>
            <ChevronRight className="ml-auto size-3 opacity-50" aria-hidden />
          </CommandItem>
        </CommandGroup>

        {services.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Services">
              {services.slice(0, 6).map((s) => (
                <CommandItem key={s.slug} onSelect={() => go(`/services/${s.slug}`)}>
                  <Wrench className="size-4" aria-hidden />
                  <span>{s.title}</span>
                </CommandItem>
              ))}
              <CommandItem onSelect={() => go("/services")}>
                <ArrowRight className="size-4" aria-hidden />
                <span>See all services</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {projects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Projects">
              {projects.slice(0, 6).map((p) => (
                <CommandItem key={p.slug} onSelect={() => go(`/projects/${p.slug}`)}>
                  <Building2 className="size-4" aria-hidden />
                  <span>{p.title}</span>
                </CommandItem>
              ))}
              <CommandItem onSelect={() => go("/projects")}>
                <ArrowRight className="size-4" aria-hidden />
                <span>See all projects</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {articles.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Insights">
              {articles.slice(0, 6).map((a) => (
                <CommandItem key={a.slug} onSelect={() => go(`/insights/${a.slug}`)}>
                  <FileText className="size-4" aria-hidden />
                  <span>{a.title}</span>
                </CommandItem>
              ))}
              <CommandItem onSelect={() => go("/insights")}>
                <ArrowRight className="size-4" aria-hidden />
                <span>See all insights</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        {faqs.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="FAQs">
              {faqs.slice(0, 6).map((f) => (
                <CommandItem
                  key={f.id}
                  onSelect={() => {
                    onOpenChange(false);
                    navigate("/faq");
                  }}
                >
                  <HelpCircle className="size-4" aria-hidden />
                  <span className="truncate">{f.question}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

/**
 * Mounts the command palette globally and wires ⌘K / Ctrl+K.
 */
export function CommandPaletteMount() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onCustom = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("techstar:open-command", onCustom);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("techstar:open-command", onCustom);
    };
  }, []);

  return <CommandPalette open={open} onOpenChange={setOpen} />;
}
