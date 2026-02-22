import { cn } from "@lylrv/ui";
import type { ReactNode } from "react";

export function DashboardPageHeader({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-3xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {meta ? (
        <span className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {meta}
        </span>
      ) : null}
    </div>
  );
}

export function DashboardSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("overflow-hidden rounded-xl border bg-card", className)}
    >
      <div className="border-b border-border/80 px-5 py-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function DashboardMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      {note ? (
        <p className="mt-1 text-xs text-muted-foreground">{note}</p>
      ) : null}
    </div>
  );
}

export function DashboardEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed bg-card p-8 text-center">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function DashboardErrorState({ description }: { description: string }) {
  return (
    <div className="rounded-xl border border-destructive/25 bg-card p-6">
      <p className="text-sm font-semibold text-destructive">
        Could not load data
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function DashboardLoadingState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border bg-card px-5 py-8 text-sm text-muted-foreground">
      Loading {label}...
    </div>
  );
}

export function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return "—";
  }

  return new Date(dateValue).toLocaleDateString();
}
