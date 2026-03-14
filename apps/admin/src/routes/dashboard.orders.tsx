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

export const Route = createFileRoute("/dashboard/orders")({
  component: OrdersPage,
});

function OrdersPage() {
  const trpc = useTRPC();
  const { activeClientId } = useActiveClient();
  const ordersQuery = useQuery(
    trpc.dashboard.orders.queryOptions({
      clientId: activeClientId,
      limit: 100,
    }),
  );
  const storefrontOrdersQuery = useQuery(
    trpc.storefront.listOrders.queryOptions({
      clientId: activeClientId,
      limit: 50,
    }),
  );

  if (ordersQuery.isLoading || storefrontOrdersQuery.isLoading) {
    return <DashboardLoadingState label="orders" />;
  }

  if (ordersQuery.isError || storefrontOrdersQuery.isError) {
    return (
      <DashboardErrorState description="The orders request failed. Try refreshing this page." />
    );
  }

  const client = ordersQuery.data?.client ?? null;
  const rows = ordersQuery.data?.rows ?? [];
  const storefrontRows = storefrontOrdersQuery.data?.rows ?? [];
  const paidOrders = rows.filter((row) => row.payment === "paid").length;
  const submittedStorefrontOrders = storefrontRows.filter(
    (row) => row.status === "submitted" || row.status === "paid",
  ).length;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Orders"
        description="Orders synced for the selected client from backend order records."
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <DashboardMetric label="Orders" value={rows.length.toLocaleString()} />
        <DashboardMetric label="Paid" value={paidOrders.toLocaleString()} />
        <DashboardMetric
          label="Unpaid"
          value={(rows.length - paidOrders).toLocaleString()}
        />
        <DashboardMetric
          label="Storefront"
          value={storefrontRows.length.toLocaleString()}
        />
      </div>

      {rows.length ? (
        <DashboardSection title="Order ledger" description="Latest 100 records">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">#{row.orderId}</td>
                    <td className="px-4 py-3">{row.email ?? "—"}</td>
                    <td className="px-4 py-3">{row.status ?? "—"}</td>
                    <td className="px-4 py-3">{row.payment ?? "—"}</td>
                    <td className="px-4 py-3">{row.total ?? "0.00"}</td>
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
          title="No orders found"
          description="No order records are available for this client yet."
        />
      )}

      {storefrontRows.length ? (
        <DashboardSection
          title="Native storefront orders"
          description={`${submittedStorefrontOrders} submitted or paid`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Public ID</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Items</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {storefrontRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">{row.publicId}</td>
                    <td className="px-4 py-3">{row.email ?? "—"}</td>
                    <td className="px-4 py-3">{row.status ?? "—"}</td>
                    <td className="px-4 py-3">{row.items.length}</td>
                    <td className="px-4 py-3">{row.total ?? "0.00"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      ) : null}
    </div>
  );
}
