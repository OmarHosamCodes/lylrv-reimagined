import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardMetric,
  DashboardPageHeader,
  DashboardSection,
  formatDate,
} from "~/component/dashboard-ui";
import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/reviews")({
  component: ReviewsPage,
});

function ReviewsPage() {
  const trpc = useTRPC();
  const { activeClientId } = useActiveClient();
  const reviewsQuery = useQuery(
    trpc.dashboard.reviews.queryOptions({
      clientId: activeClientId,
      limit: 100,
    }),
  );

  if (reviewsQuery.isLoading) {
    return <DashboardLoadingState label="reviews" />;
  }

  if (reviewsQuery.isError) {
    return (
      <DashboardErrorState description="The reviews request failed. Try refreshing this page." />
    );
  }

  const client = reviewsQuery.data?.client ?? null;
  const rows = reviewsQuery.data?.rows ?? [];
  const averageRating = rows.length
    ? (
        rows.reduce((sum, row) => sum + Number(row.rating ?? 0), 0) /
        rows.length
      ).toFixed(1)
    : "0.0";

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Reviews"
        description="Product and website reviews captured in the backend schema."
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardMetric label="Reviews" value={rows.length.toLocaleString()} />
        <DashboardMetric label="Average Rating" value={`${averageRating}/5`} />
        <DashboardMetric
          label="With Comment"
          value={rows
            .filter((row) => Boolean(row.body))
            .length.toLocaleString()}
        />
      </div>

      {rows.length ? (
        <DashboardSection
          title="Review feed"
          description="Latest 100 published reviews"
        >
          <div className="space-y-3 p-4">
            {rows.map((row) => (
              <div key={row.id} className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      {row.title ?? "Untitled review"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.author ?? row.email ?? "Anonymous"} · {row.type}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{row.rating ?? "0"}/5</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {row.body ?? "No review body"}
                </p>
              </div>
            ))}
          </div>
        </DashboardSection>
      ) : (
        <DashboardEmptyState
          title="No reviews found"
          description="No review records are available for this client yet."
        />
      )}
    </div>
  );
}
