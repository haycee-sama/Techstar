import {
  Newspaper as Article,
  Building2,
  Cookie,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  Link2,
  ListChecks,
  Mail,
  Megaphone,
  MessageSquareQuote,
  PencilRuler,
  Search,
  Settings,
  Shapes,
  Tags,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  /** Hash-route path under /admin, e.g. `/admin/pages`. */
  to: string;
  /** Plain-text label shown in the sidebar. */
  label: string;
  /** Lucide icon. */
  icon: LucideIcon;
  /** When true, render the item as disabled with a "coming in Phase 3b/4" badge. */
  disabled?: boolean;
  /** Phase hint shown on hover. */
  hint?: string;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_GROUPS: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/pages", label: "Pages", icon: FileText },
      { to: "/admin/services", label: "Services", icon: Wrench },
      { to: "/admin/projects", label: "Projects", icon: Building2 },
      { to: "/admin/articles", label: "Articles", icon: Article },
      { to: "/admin/team", label: "Team", icon: Users },
      { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
      { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
      { to: "/admin/navigation", label: "Navigation", icon: ListChecks },
      { to: "/admin/ctas", label: "CTAs", icon: Tags },
    ],
  },
  {
    label: "Communication",
    items: [
      { to: "/admin/inquiries", label: "Inquiries", icon: Mail },
      { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    ],
  },
  {
    label: "Configuration",
    items: [
      { to: "/admin/seo", label: "SEO", icon: Search },
      { to: "/admin/social", label: "Social", icon: Link2 },
      { to: "/admin/legal", label: "Legal", icon: FileText },
      { to: "/admin/cookie", label: "Cookie", icon: Cookie },
      { to: "/admin/forms", label: "Forms", icon: Shapes },
    ],
  },
  {
    label: "System",
    items: [
      // Phase 4a — Visual builder live.
      // Phase 4b — Media library + Settings both live.
      { to: "/admin/builder", label: "Visual builder", icon: PencilRuler },
      { to: "/admin/media", label: "Media", icon: ImageIcon },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export type { LucideIcon };
