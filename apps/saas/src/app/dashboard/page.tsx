import { Suspense } from "react";
import Link from "next/link";

import { getSession } from "~/auth/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="flex flex-1 flex-col gap-8 p-6 lg:p-10">
      {/* Page header */}
      <div className="reveal-up">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Overview
        </span>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight lg:text-4xl">
          Welcome back, {session.user.name?.split(" ")[0] ?? "there"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your loyalty program today.
        </p>
      </div>

      {/* Stat cards row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Customers"
          value="12,847"
          trend={{ value: "+18.2%", positive: true }}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          delay="delay-1"
        />
        <StatCard
          title="Points Earned"
          value="2.4M"
          trend={{ value: "+24.5%", positive: true }}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          }
          delay="delay-2"
        />
        <StatCard
          title="Reviews"
          value="3,291"
          trend={{ value: "+12.8%", positive: true }}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
          delay="delay-3"
        />
        <StatCard
          title="Avg. Rating"
          value="4.87"
          trend={{ value: "+0.12", positive: true }}
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
          }
          delay="delay-4"
        />
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent activity - wider column */}
        <div className="reveal-up delay-5 lg:col-span-3">
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold">Recent Activity</h2>
                <p className="text-xs text-muted-foreground">
                  Latest loyalty and review events
                </p>
              </div>
              <Link
                href="/dashboard/activity"
                className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                View all
              </Link>
            </div>
            <div className="divide-y">
              {[
                {
                  icon: "⭐",
                  iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                  title: "New 5-star review",
                  description:
                    'Sarah M. left a review: "Absolutely love the rewards program!"',
                  time: "2 min ago",
                },
                {
                  icon: "🎁",
                  iconBg:
                    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  title: "Points redeemed",
                  description:
                    "James T. redeemed 500 points for a $10 discount coupon",
                  time: "18 min ago",
                },
                {
                  icon: "👥",
                  iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                  title: "Referral completed",
                  description:
                    "Emily R. referred a new customer through their unique link",
                  time: "43 min ago",
                },
                {
                  icon: "🏆",
                  iconBg:
                    "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                  title: "Tier upgrade",
                  description:
                    "Marcus W. reached Gold tier after accumulating 5,000 points",
                  time: "1 hour ago",
                },
                {
                  icon: "💬",
                  iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                  title: "Review response",
                  description:
                    "You replied to Alex K.'s review on Premium Headphones",
                  time: "2 hours ago",
                },
                {
                  icon: "🛍️",
                  iconBg: "bg-primary/10 text-primary",
                  title: "Points earned",
                  description: "Lisa D. earned 120 points from a $60 purchase",
                  time: "3 hours ago",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-sm ${item.iconBg}`}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground/60">
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Quick actions */}
          <div className="reveal-up delay-6 rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold">Quick Actions</h2>
              <p className="text-xs text-muted-foreground">
                Frequently used shortcuts
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4">
              {[
                {
                  label: "Widget Settings",
                  href: "/dashboard/widgets",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  ),
                },
                {
                  label: "Add Reward",
                  href: "/dashboard/rewards",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 12h8" />
                      <path d="M12 8v8" />
                    </svg>
                  ),
                },
                {
                  label: "View Reviews",
                  href: "/dashboard/reviews",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                  ),
                },
                {
                  label: "Customers",
                  href: "/dashboard/customers",
                  icon: (
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  ),
                },
              ].map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  className="group flex flex-col items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-4 py-5 text-center transition-all duration-200 hover:border-primary/20 hover:bg-card hover:shadow-md"
                >
                  <div className="text-muted-foreground transition-colors group-hover:text-primary">
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Performers */}
          <div className="reveal-up delay-7 rounded-xl border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-sm font-semibold">Top Performers</h2>
                <p className="text-xs text-muted-foreground">
                  Most engaged customers
                </p>
              </div>
            </div>
            <div className="divide-y">
              {[
                {
                  name: "Sarah Mitchell",
                  points: "8,420",
                  tier: "Platinum",
                  tierColor:
                    "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
                },
                {
                  name: "James Thompson",
                  points: "6,150",
                  tier: "Gold",
                  tierColor:
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                },
                {
                  name: "Emily Rodriguez",
                  points: "5,890",
                  tier: "Gold",
                  tierColor:
                    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                },
                {
                  name: "Marcus Webb",
                  points: "4,200",
                  tier: "Silver",
                  tierColor:
                    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
                },
              ].map((customer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-muted/30"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.points} pts
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${customer.tierColor}`}
                  >
                    {customer.tier}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Health */}
          <div className="reveal-up delay-8 rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold">Program Health</h2>
              <p className="text-xs text-muted-foreground">
                Key metrics at a glance
              </p>
            </div>
            <div className="space-y-4 p-6">
              <ProgressMetric
                label="Customer Retention"
                value={87}
                color="bg-emerald-500"
              />
              <ProgressMetric
                label="Points Redemption Rate"
                value={62}
                color="bg-primary"
              />
              <ProgressMetric
                label="Review Response Rate"
                value={94}
                color="bg-sky-500"
              />
              <ProgressMetric
                label="Referral Conversion"
                value={38}
                color="bg-violet-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Stat Card Component ── */
function StatCard({
  title,
  value,
  trend,
  icon,
  delay,
}: {
  title: string;
  value: string;
  trend: { value: string; positive: boolean };
  icon: React.ReactNode;
  delay: string;
}) {
  return (
    <div
      className={`reveal-up ${delay} group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-shadow duration-300 hover:shadow-md`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          <span
            className={`mt-0.5 inline-flex items-center gap-1 text-xs font-medium ${
              trend.positive ? "text-emerald-500" : "text-red-400"
            }`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={!trend.positive ? "rotate-180" : ""}
            >
              <path d="M6 2.5L9.5 6.5H2.5L6 2.5Z" fill="currentColor" />
            </svg>
            {trend.value}
            <span className="text-muted-foreground">vs last month</span>
          </span>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
      {/* Subtle bottom glow on hover */}
      <div className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-primary/0 blur-xl transition-all duration-500 group-hover:bg-primary/5" />
    </div>
  );
}

/* ── Progress Metric Component ── */
function ProgressMetric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
