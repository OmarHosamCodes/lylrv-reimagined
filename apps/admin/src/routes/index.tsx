import type { RouterOutputs } from "@lylrv/api";
import { cn } from "@lylrv/ui";
import { Button } from "@lylrv/ui/button";
import { createFileRoute } from "@tanstack/react-router";

import { AuthShowcase } from "~/component/auth-showcase";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div
      className="bg-ambient
 noise relative min-h-screen overflow-hidden"
    >
      {/* Navigation */}
      <nav className="reveal-fade relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-primary-foreground"
            >
              <path
                d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold tracking-tight">
              Lylrv
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              Admin Console
            </span>
          </div>
        </div>

        <AuthShowcase />
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8">
        {/* Page Header */}
        <div className="reveal-up mb-10">
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Admin Dashboard
          </span>
          <h1 className="font-display text-4xl font-bold tracking-tight lg:text-5xl">
            System Overview
          </h1>
          <p className="mt-2 max-w-lg text-base text-muted-foreground">
            Monitor platform health, manage tenants, and review system-wide
            metrics from a single view.
          </p>
        </div>

        {/* Stats Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            title="Active Tenants"
            value="342"
            trend={{ value: "+12", positive: true }}
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
                <path d="M18 21a8 8 0 0 0-16 0" />
                <circle cx="10" cy="8" r="5" />
                <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
              </svg>
            }
            delay="delay-1"
          />
          <AdminStatCard
            title="Total API Calls"
            value="8.2M"
            trend={{ value: "+32%", positive: true }}
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
            delay="delay-2"
          />
          <AdminStatCard
            title="System Uptime"
            value="99.98%"
            trend={{ value: "+0.02%", positive: true }}
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
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            delay="delay-3"
          />
          <AdminStatCard
            title="Support Tickets"
            value="17"
            trend={{ value: "-5", positive: true }}
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
            delay="delay-4"
          />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* System Status */}
          <div className="reveal-up delay-5 lg:col-span-3">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-sm font-semibold">System Status</h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time service health
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-50" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </span>
                  All Systems Operational
                </span>
              </div>
              <div className="divide-y">
                {[
                  {
                    service: "API Gateway",
                    status: "operational",
                    latency: "12ms",
                    uptime: "99.99%",
                  },
                  {
                    service: "Database Cluster",
                    status: "operational",
                    latency: "3ms",
                    uptime: "99.98%",
                  },
                  {
                    service: "Auth Service",
                    status: "operational",
                    latency: "18ms",
                    uptime: "100%",
                  },
                  {
                    service: "Widget CDN",
                    status: "operational",
                    latency: "8ms",
                    uptime: "99.97%",
                  },
                  {
                    service: "Email Service",
                    status: "degraded",
                    latency: "240ms",
                    uptime: "98.5%",
                  },
                  {
                    service: "Background Jobs",
                    status: "operational",
                    latency: "45ms",
                    uptime: "99.95%",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-m
uted/20"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-2 rounded-full",
                          item.status === "operational"
                            ? "bg-emerald-500"
                            : item.status === "degraded"
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                      />
                      <span className="text-sm font-medium">
                        {item.service}
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xs text-muted-foreground">
                        {item.latency}
                      </span>
                      <span
                        className={cn(
                          "min-w-[52px] text-right text-xs font-medium",
                          item.status === "operational"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : item.status === "degraded"
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-red-600 dark:text-red-400",
                        )}
                      >
                        {item.uptime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Quick Admin Actions */}
            <div className="reveal-up delay-6 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-sm font-semibold">Quick Actions</h2>
                <p className="text-xs text-muted-foreground">
                  Common admin operations
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4">
                {[
                  {
                    label: "Manage Tenants",
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
                        <path d="M18 21a8 8 0 0 0-16 0" />
                        <circle cx="10" cy="8" r="5" />
                        <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
                      </svg>
                    ),
                  },
                  {
                    label: "Audit Logs",
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
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" x2="8" y1="13" y2="13" />
                        <line x1="16" x2="8" y1="17" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    ),
                  },
                  {
                    label: "Feature Flags",
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
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                        <line x1="4" x2="4" y1="22" y2="15" />
                      </svg>
                    ),
                  },
                  {
                    label: "Billing",
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
                        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                        <path d="M12 18V6" />
                      </svg>
                    ),
                  },
                ].map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    className="group flex flex-col items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 px-4 py-5 text-center transition-all duration-200 hover:border-primary/20 hover:bg-card hover:shadow-md"
                  >
                    <div className="text-muted-foreground transition-colors group-hover:text-primary">
                      {action.icon}
                    </div>
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="reveal-up delay-7 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div>
                  <h2 className="text-sm font-semibold">Recent Alerts</h2>
                  <p className="text-xs text-muted-foreground">
                    System notifications
                  </p>
                </div>
              </div>
              <div className="divide-y">
                {[
                  {
                    icon: "⚠️",
                    iconBg:
                      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    title: "Email service degraded",
                    description: "Latency increased to 240ms, monitoring",
                    time: "12 min ago",
                    severity: "warning",
                  },
                  {
                    icon: "🔄",
                    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
                    title: "Database migration complete",
                    description:
                      "Schema v42 applied successfully to all shards",
                    time: "2 hours ago",
                    severity: "info",
                  },
                  {
                    icon: "✅",
                    iconBg:
                      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    title: "SSL certificates renewed",
                    description:
                      "Auto-renewal completed for 12 domain certificates",
                    time: "6 hours ago",
                    severity: "success",
                  },
                  {
                    icon: "🛡️",
                    iconBg:
                      "bg-violet-500/10 text-violet-600 dark:text-violet-400",
                    title: "Security scan passed",
                    description:
                      "No vulnerabilities detected in latest dependency audit",
                    time: "1 day ago",
                    severity: "info",
                  },
                ].map((alert, i) => (
                  <div
                    key={i}
                    className="group flex items-start gap-3 px-6 py-3.5 transition-colors hover:bg-muted/20"
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm ${alert.iconBg}`}
                    >
                      {alert.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{alert.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-muted-foreground/60">
                      {alert.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Resource Usage */}
            <div className="reveal-up delay-8 overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="border-b px-6 py-4">
                <h2 className="text-sm font-semibold">Resource Usage</h2>
                <p className="text-xs text-muted-foreground">
                  Current infrastructure load
                </p>
              </div>
              <div className="space-y-4 p-6">
                <ResourceBar label="CPU Usage" value={42} color="bg-primary" />
                <ResourceBar label="Memory" value={67} color="bg-sky-500" />
                <ResourceBar
                  label="Storage"
                  value={34}
                  color="bg-emerald-500"
                />
                <ResourceBar
                  label="Bandwidth"
                  value={58}
                  color="bg-violet-500"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded-md bg-primary">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <path
                    d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-display text-xs font-bold">
                Lylrv Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Internal administration panel &middot; v1.0.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Admin Stat Card ── */
function AdminStatCard({
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
            className={cn(
              "mt-0.5 inline-flex items-center gap-1 text-xs font-medium",
              trend.positive ? "text-emerald-500" : "text-red-400",
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={cn(!trend.positive && "rotate-180")}
            >
              <path d="M6 2.5L9.5 6.5H2.5L6 2.5Z" fill="currentColor" />
            </svg>
            {trend.value}
            <span className="text-muted-foreground">this month</span>
          </span>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
          {icon}
        </div>
      </div>
      <div className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-3/4 -translate-x-1/2 rounded-full bg-primary/0 blur-xl transition-all duration-500 group-hover:bg-primary/5" />
    </div>
  );
}

/* ── Resource Bar ── */
function ResourceBar({
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
          className={cn(
            "h-full rounded-full transition-all duration-1000 ease-out",
            color,
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
