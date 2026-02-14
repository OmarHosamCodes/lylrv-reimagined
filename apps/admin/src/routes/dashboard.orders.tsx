import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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

	const rows = ordersQuery.data?.rows ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Orders</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Orders synced for the selected client from backend order records.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border bg-card">
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
						{rows.length ? (
							rows.map((row) => (
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
							))
						) : (
							<tr>
								<td
									colSpan={6}
									className="px-4 py-10 text-center text-muted-foreground"
								>
									No orders found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function formatDate(dateValue: string | null) {
	if (!dateValue) {
		return "—";
	}

	return new Date(dateValue).toLocaleDateString();
}
