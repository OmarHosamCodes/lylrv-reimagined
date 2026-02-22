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

export const Route = createFileRoute("/dashboard/referrals")({
  component: ReferralsPage,
});

function ReferralsPage() {
  const trpc = useTRPC();
  const { activeClientId } = useActiveClient();
  const referralsQuery = useQuery(
    trpc.dashboard.referrals.queryOptions({
      clientId: activeClientId,
      limit: 100,
    }),
  );

  if (referralsQuery.isLoading) {
    return <DashboardLoadingState label="referrals" />;
  }

  if (referralsQuery.isError) {
    return (
      <DashboardErrorState description="The referrals request failed. Try refreshing this page." />
    );
  }

  const client = referralsQuery.data?.client ?? null;
  const rows = referralsQuery.data?.rows ?? [];
  const activeRows = rows.filter((row) => row.isActive);
  const totalUsage = rows.reduce(
    (sum, row) => sum + Number(row.usageCount ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Referrals"
        description="Referral codes and usage data from your client records."
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardMetric label="Codes" value={rows.length.toLocaleString()} />
        <DashboardMetric
          label="Active"
          value={activeRows.length.toLocaleString()}
        />
        <DashboardMetric
          label="Total Usage"
          value={totalUsage.toLocaleString()}
        />
      </div>

      {rows.length ? (
        <DashboardSection
          title="Referral codes"
          description="Latest 100 records"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-mono text-xs uppercase">
                      {row.code}
                    </td>
                    <td className="px-4 py-3">
                      {row.customer?.name ?? row.customer?.email ?? "Unknown"}
                    </td>
                    <td className="px-4 py-3">{row.isActive ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">{row.usageCount ?? 0}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      ) : (
        <DashboardEmptyState
          title="No referrals found"
          description="No referral records are available for this client yet."
        />
      )}
    </div>
  );
}
