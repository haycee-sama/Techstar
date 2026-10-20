"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Building2,
  ChevronDown,
  CheckCircle2,
  Circle,
  FileText,
  Inbox,
  LayoutDashboard,
  Megaphone,
  Newspaper,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Link, useRouter } from "@/lib/router";
import { useArticles, useContentStore, useInquiries, usePages, useProjects } from "@/lib/content-store";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";
import type { LucideIcon } from "lucide-react";

const ONBOARDING_KEY = "techstar:admin:onboarding";

const ONBOARDING_ITEMS = [
  { id: "brand", label: "Set brand colors" },
  { id: "contact", label: "Add a real contact email" },
  { id: "logo", label: "Replace the sample logo" },
  { id: "seed", label: "Replace sample copy with your own" },
  { id: "nav", label: "Review and edit navigation" },
  { id: "media", label: "Upload a hero image" },
  { id: "first-page", label: "Open and edit your first page" },
  { id: "first-publish", label: "Publish a page" },
];

/**
 * Admin dashboard home — `#/admin`. Overview stats, sample analytics
 * (clearly labeled illustrative), recent activity tables, quick actions,
 * per-page completion indicators, and a collapsible onboarding checklist
 * persisted to localStorage.
 */
export function DashboardHome() {
  const pages = usePages();
  const articles = useArticles();
  const projects = useProjects();
  const inquiries = useInquiries();

  const pagesByStatus = useMemo(() => {
    const out = { published: 0, draft: 0, archived: 0 };
    for (const p of pages) out[p.status] += 1;
    return out;
  }, [pages]);
  const articlesByStatus = useMemo(() => {
    const out = { published: 0, draft: 0 };
    for (const a of articles) out[a.status] += 1;
    return out;
  }, [articles]);
  const inquiriesByStatus = useMemo(() => {
    const out = { new: 0, pending: 0, resolved: 0 };
    for (const i of inquiries) {
      if (i.status === "new") out.new += 1;
      else if (i.status === "in-review" || i.status === "qualified")
        out.pending += 1;
      else out.resolved += 1;
    }
    return out;
  }, [inquiries]);

  const recentInquiries = useMemo(
    () =>
      [...inquiries]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        .slice(0, 5),
    [inquiries]
  );

  const recentPages = useMemo(
    () =>
      [...pages]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 5),
    [pages]
  );

  return (
    <div className="space-y-6">
      <DashboardHeader />

      {/* Stat row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Pages"
          total={pages.length}
          breakdown={[
            { label: "Published", value: pagesByStatus.published, tone: "emerald" },
            { label: "Draft", value: pagesByStatus.draft, tone: "amber" },
            { label: "Archived", value: pagesByStatus.archived, tone: "zinc" },
          ]}
          to="/admin/pages"
        />
        <StatCard
          icon={Newspaper}
          label="Articles"
          total={articles.length}
          breakdown={[
            { label: "Published", value: articlesByStatus.published, tone: "emerald" },
            { label: "Draft", value: articlesByStatus.draft, tone: "amber" },
          ]}
          to="/admin/articles"
        />
        <StatCard
          icon={Building2}
          label="Projects"
          total={projects.length}
          breakdown={[
            { label: "Illustrative", value: projects.length, tone: "blue" },
          ]}
          to="/admin/projects"
        />
        <StatCard
          icon={Inbox}
          label="Inquiries"
          total={inquiries.length}
          breakdown={[
            { label: "New", value: inquiriesByStatus.new, tone: "blue" },
            { label: "Pending", value: inquiriesByStatus.pending, tone: "amber" },
            { label: "Resolved", value: inquiriesByStatus.resolved, tone: "emerald" },
          ]}
          to="/admin/inquiries"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Visits — last 30 days</CardTitle>
            <CardDescription>Sample data — for demonstration only.</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Illustrative
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <VisitsChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Traffic sources</CardTitle>
            <CardDescription>Sample — not real analytics.</CardDescription>
            <CardAction>
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Illustrative
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <TrafficSourcesChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Conversion events — last 7 days</CardTitle>
          <CardDescription>Sample data — for demonstration only.</CardDescription>
          <CardAction>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              Illustrative
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ConversionChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Recent inquiries</CardTitle>
            <CardDescription>Latest consultation requests (illustrative).</CardDescription>
            <CardAction>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/inquiries">View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {recentInquiries.length === 0 ? (
                <li className="py-6 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                  No inquiries yet — submit one from the public contact page.
                </li>
              ) : (
                recentInquiries.map((i) => (
                  <li
                    key={i.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {i.name}
                      </p>
                      <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                        {i.company ?? "—"} · {formatDate(i.createdAt, "short")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={i.status} />
                      <Button asChild size="sm" variant="ghost" className="h-7">
                        <Link to="/admin/inquiries">View</Link>
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recently edited pages</CardTitle>
            <CardDescription>Sorted by `updatedAt`.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
              {recentPages.map((p) => (
                <li
                  key={p.slug}
                  className="flex items-center justify-between gap-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      {p.title}
                    </p>
                    <p className="truncate text-[11px]" style={{ color: "var(--text-muted)" }}>
                      /{p.slug} · {formatDate(p.updatedAt, "short")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={p.status} />
                    <Button asChild size="sm" variant="ghost" className="h-7">
                      <Link to={`/admin/pages/${p.slug}`}>Edit</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Content completion</CardTitle>
            <CardDescription>
              Heuristic — % of expected fields filled per page. For guidance only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {pages.map((p) => (
                <CompletionRow key={p.slug} slug={p.slug} title={p.title} percent={completionPercent(p)} status={p.status} />
              ))}
            </div>
          </CardContent>
        </Card>

        <OnboardingPanel />
      </div>

      <QuickActionsPanel />
    </div>
  );
}

function DashboardHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div
          className="flex items-center gap-2 text-[11px] uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          <LayoutDashboard className="size-3.5" style={{ color: "var(--accent-bright)" }} />
          Dashboard
        </div>
        <h1
          className="mt-1 font-display text-2xl font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Welcome to the Techstar admin
        </h1>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Demo console — content is persisted to your browser only.
        </p>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  total: number;
  breakdown: { label: string; value: number; tone: "emerald" | "amber" | "zinc" | "blue" }[];
  to: string;
}

function StatCard({ icon: Icon, label, total, breakdown, to }: StatCardProps) {
  const toneColor: Record<StatCardProps["breakdown"][number]["tone"], string> = {
    emerald: "var(--success)",
    amber: "var(--warning)",
    zinc: "var(--text-muted)",
    blue: "var(--accent-bright)",
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
            {label}
          </CardTitle>
          <div
            className="flex size-7 items-center justify-center rounded-md"
            style={{
              backgroundColor: "var(--surface-2)",
              color: "var(--accent-bright)",
            }}
            aria-hidden
          >
            <Icon className="size-3.5" />
          </div>
        </div>
        <CardDescription>
          <span className="font-display text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
            {total}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {breakdown.map((b) => (
            <span
              key={b.label}
              className="inline-flex items-center gap-1.5 text-[11px]"
              style={{ color: "var(--text-secondary)" }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: toneColor[b.tone] }}
                aria-hidden
              />
              {b.label}: {b.value}
            </span>
          ))}
        </div>
        <Button asChild size="sm" variant="ghost" className="mt-2 h-7 px-2 text-xs">
          <Link to={to}>Open {label.toLowerCase()} →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

const VISITS_DATA = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  // Deterministic illustrative data.
  const visits = Math.round(800 + Math.sin(i / 3) * 240 + (i % 7 === 0 ? 360 : 0) + i * 8);
  const unique = Math.round(visits * (0.6 + (i % 5) * 0.04));
  return { day: `D${day}`, visits, unique };
});

const VISITS_CONFIG = {
  visits: { label: "Visits", color: "var(--accent-bright)" },
  unique: { label: "Unique visitors", color: "var(--accent-cyan)" },
};

function VisitsChart() {
  return (
    <ChartContainer config={VISITS_CONFIG} className="h-[220px] w-full">
      <LineChart data={VISITS_DATA} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
        <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" width={32} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="visits"
          stroke="var(--accent-bright)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="unique"
          stroke="var(--accent-cyan)"
          strokeWidth={2}
          dot={false}
          strokeDasharray="4 4"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  );
}

const TRAFFIC_DATA = [
  { name: "Direct", value: 38, color: "var(--accent-bright)" },
  { name: "Organic", value: 28, color: "var(--accent-cyan)" },
  { name: "Referral", value: 22, color: "var(--success)" },
  { name: "Social", value: 12, color: "var(--warning)" },
];
const TRAFFIC_CONFIG = TRAFFIC_DATA.reduce<Record<string, { label: string; color: string }>>(
  (acc, item) => {
    acc[item.name.toLowerCase()] = { label: item.name, color: item.color };
    return acc;
  },
  {}
);

function TrafficSourcesChart() {
  return (
    <ChartContainer config={TRAFFIC_CONFIG} className="h-[220px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={TRAFFIC_DATA}
          dataKey="value"
          nameKey="name"
          innerRadius={48}
          outerRadius={80}
          paddingAngle={2}
        >
          {TRAFFIC_DATA.map((entry) => (
            <Cell key={entry.name} fill={entry.color} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}

const CONVERSION_DATA = [
  { day: "Mon", consultations: 6, downloads: 12, newsletter: 18, subscriptions: 2 },
  { day: "Tue", consultations: 4, downloads: 9, newsletter: 14, subscriptions: 1 },
  { day: "Wed", consultations: 8, downloads: 16, newsletter: 22, subscriptions: 3 },
  { day: "Thu", consultations: 5, downloads: 11, newsletter: 16, subscriptions: 2 },
  { day: "Fri", consultations: 9, downloads: 14, newsletter: 20, subscriptions: 4 },
  { day: "Sat", consultations: 3, downloads: 6, newsletter: 9, subscriptions: 1 },
  { day: "Sun", consultations: 2, downloads: 5, newsletter: 7, subscriptions: 0 },
];
const CONVERSION_CONFIG = {
  consultations: { label: "Consultations", color: "var(--accent-bright)" },
  downloads: { label: "Downloads", color: "var(--accent-cyan)" },
  newsletter: { label: "Newsletter", color: "var(--success)" },
  subscriptions: { label: "Subscriptions", color: "var(--warning)" },
};

function ConversionChart() {
  return (
    <ChartContainer config={CONVERSION_CONFIG} className="h-[240px] w-full">
      <BarChart data={CONVERSION_DATA} barCategoryGap="20%" margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
        <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
        <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" width={28} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="consultations" fill="var(--accent-bright)" radius={2} />
        <Bar dataKey="downloads" fill="var(--accent-cyan)" radius={2} />
        <Bar dataKey="newsletter" fill="var(--success)" radius={2} />
        <Bar dataKey="subscriptions" fill="var(--warning)" radius={2} />
      </BarChart>
    </ChartContainer>
  );
}

interface PageLikeForCompletion {
  title?: string;
  excerpt?: string;
  bodyHtml?: string;
  featuredImage?: string;
  seo?: { title?: string; description?: string };
}

function completionPercent(page: PageLikeForCompletion): number {
  const checks = [
    !!page.title && page.title.length >= 3,
    !!page.excerpt && page.excerpt.length >= 8,
    !!page.bodyHtml && page.bodyHtml.length >= 30,
    !!page.featuredImage,
    !!page.seo?.title,
    !!page.seo?.description && page.seo.description.length >= 20,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

function CompletionRow({
  slug,
  title,
  percent,
  status,
}: {
  slug: string;
  title: string;
  percent: number;
  status: "draft" | "published" | "archived";
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <Link
            to={`/admin/pages/${slug}`}
            className="truncate text-sm font-medium hover:underline"
            style={{ color: "var(--text-primary)" }}
          >
            {title}
          </Link>
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{
              color:
                percent >= 80
                  ? "var(--success)"
                  : percent >= 40
                  ? "var(--warning)"
                  : "var(--text-muted)",
            }}
          >
            {percent}%
          </span>
        </div>
        <Progress
          value={percent}
          className="mt-1 h-1.5"
        />
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function OnboardingPanel() {
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(ONBOARDING_KEY);
      if (raw) setDone(JSON.parse(raw) as Record<string, boolean>);
    } catch {
      // ignore
    }
  }, []);

  function toggle(id: string) {
    const next = { ...done, [id]: !done[id] };
    setDone(next);
    try {
      window.localStorage.setItem(ONBOARDING_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  const completedCount = ONBOARDING_ITEMS.filter((i) => done[i.id]).length;

  return (
    <Card>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm">Onboarding checklist</CardTitle>
              <CardDescription>
                {completedCount}/{ONBOARDING_ITEMS.length} complete
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7" aria-label="Toggle checklist">
                <ChevronDown className={`size-4 transition-transform ${open ? "" : "rotate-180"}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <ul className="space-y-1.5">
              {ONBOARDING_ITEMS.map((item) => {
                const checked = !!done[item.id];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm transition-colors hover:bg-[var(--surface-2)]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {checked ? (
                        <CheckCircle2
                          className="size-4 shrink-0"
                          style={{ color: "var(--success)" }}
                        />
                      ) : (
                        <Circle
                          className="size-4 shrink-0"
                          style={{ color: "var(--text-muted)" }}
                        />
                      )}
                      <span className={checked ? "line-through opacity-60" : ""}>
                        {item.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-[10px]" style={{ color: "var(--text-muted)" }}>
              Persisted to local storage. Clears if you reset demo content.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

interface QuickAction {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
}

function QuickActionsPanel() {
  const { navigate } = useRouter();
  const { resetToSeed } = useContentStore();

  const actions: QuickAction[] = [
    {
      label: "New page",
      icon: FileText,
      onClick: () => {
        // Phase 3b lands the new-page wizard; Phase 3a-ii lands the editor.
        // For now, take the user to the page-editor stub so the route is
        // explorable end-to-end.
        toast.info("Page editor lands in Phase 3a-ii — opening the About page stub for now.");
        navigate("/admin/pages/about");
      },
    },
    {
      label: "New article",
      icon: Newspaper,
      onClick: () => toast.info("Article composer lands in Phase 3b."),
    },
    {
      label: "New project",
      icon: Building2,
      onClick: () => toast.info("Project composer lands in Phase 3b."),
    },
    {
      label: "New service",
      icon: Wrench,
      onClick: () => toast.info("Service composer lands in Phase 3b."),
    },
    {
      label: "New announcement",
      icon: Megaphone,
      onClick: () => toast.info("Announcement composer lands in Phase 3b."),
    },
    {
      label: "Reset demo data",
      icon: Inbox,
      onClick: () => {
        resetToSeed();
        toast.success("Demo content reset to seed.");
      },
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick actions</CardTitle>
        <CardDescription>
          Composers are stubbed in Phase 3a — full CRUD tables land in Phase 3b.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button
              key={a.label}
              size="sm"
              variant="outline"
              onClick={a.onClick}
              disabled={a.disabled}
            >
              <a.icon className="size-3.5" />
              {a.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
