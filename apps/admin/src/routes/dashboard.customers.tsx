import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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

	const rows = customersQuery.data?.rows ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Customers</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Customer records synced for the selected client.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border bg-card">
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
						{rows.length ? (
							rows.map((row) => (
								<tr key={row.id}>
									<td className="px-4 py-3 font-medium">{row.name}</td>
									<td className="px-4 py-3">{row.email}</td>
									<td className="px-4 py-3">{row.phone ?? "—"}</td>
									<td className="px-4 py-3">{row.totalPoints ?? 0}</td>
									<td className="px-4 py-3 text-muted-foreground">
										{formatDate(row.createdAt)}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-10 text-center text-muted-foreground"
								>
									No customers found.
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
