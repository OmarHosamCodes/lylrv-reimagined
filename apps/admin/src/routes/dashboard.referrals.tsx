import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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

	const rows = referralsQuery.data?.rows ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Referrals</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Referral codes and usage data from your client records.
				</p>
			</div>

			<div className="overflow-hidden rounded-xl border bg-card">
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
						{rows.length ? (
							rows.map((row) => (
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
							))
						) : (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-10 text-center text-muted-foreground"
								>
									No referrals found.
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
