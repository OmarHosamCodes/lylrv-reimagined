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

export const Route = createFileRoute("/dashboard/customers")({
  component: CustomersPage,
});

function CustomersPage() {
  const trpc = useTRPC();
  const { activeClientId } = useActiveClient();
  const customersQuery = useQuery(
    trpc.dashboard.customers.queryOptions({
      clientId: activeClientId,
      limit: 100,
    }),
  );

  if (customersQuery.isLoading) {
    return <DashboardLoadingState label="customers" />;
  }

  if (customersQuery.isError) {
    return (
      <DashboardErrorState description="The customers dataset failed to load. Try refreshing this page." />
    );
  }

  const client = customersQuery.data?.client ?? null;
  const rows = customersQuery.data?.rows ?? [];
  const totalPoints = rows.reduce(
    (total, row) => total + Number(row.totalPoints ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Customers"
        description="Customer records synced for the selected client."
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <DashboardMetric
          label="Profiles"
          value={rows.length.toLocaleString()}
        />
        <DashboardMetric
          label="Total Points"
          value={totalPoints.toLocaleString()}
        />
        <DashboardMetric
          label="With Phone"
          value={rows
            .filter((row) => Boolean(row.phone))
            .length.toLocaleString()}
        />
      </div>

      {rows.length ? (
        <DashboardSection
          title="Customer directory"
          description="Latest 100 synced customers"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Points</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3">{row.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      {(row.totalPoints ?? 0).toLocaleString()}
                    </td>
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
          title="No customers found"
          description="No customer records are available for this client yet."
        />
      )}
    </div>
  );
}
