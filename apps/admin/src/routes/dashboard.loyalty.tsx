import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/loyalty")({
	component: LoyaltyPage,
});

function LoyaltyPage() {
	const trpc = useTRPC();
	const { activeClientId } = useActiveClient();
	const loyaltyQuery = useQuery(
		trpc.dashboard.loyalty.queryOptions({
			clientId: activeClientId,
			limit: 100,
		}),
	);

	const rows = loyaltyQuery.data?.rows ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Loyalty</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Points activities and loyalty transactions from backend activity logs.
				</p>
			</div>

			<div className="rounded-xl border bg-card">
				<div className="divide-y">
					{rows.length ? (
						rows.map((row) => (
							<div
								key={row.id}
								className="flex items-center justify-between px-5 py-3"
							>
								<div>
									<p className="text-sm font-medium">{row.reason}</p>
									<p className="text-xs text-muted-foreground">
										{row.name ?? row.email} - {row.email}
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold">{row.amount} pts</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(row.createdAt)}
									</p>
								</div>
							</div>
						))
					) : (
						<p className="px-5 py-10 text-center text-sm text-muted-foreground">
							No loyalty activity found.
						</p>
					)}
				</div>
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
