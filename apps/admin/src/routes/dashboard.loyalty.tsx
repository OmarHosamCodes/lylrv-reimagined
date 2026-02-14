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

	if (loyaltyQuery.isLoading) {
		return <DashboardLoadingState label="loyalty activity" />;
	}

	if (loyaltyQuery.isError) {
		return (
			<DashboardErrorState description="The loyalty activity request failed. Try refreshing this page." />
		);
	}

	const client = loyaltyQuery.data?.client ?? null;
	const rows = loyaltyQuery.data?.rows ?? [];
	const totalAwarded = rows.reduce(
		(sum, row) => sum + Number(row.amount ?? 0),
		0,
	);

	return (
		<div className="flex flex-col gap-5">
			<DashboardPageHeader
				title="Loyalty"
				description="Points activities and loyalty transactions from backend logs."
				meta={client?.name ?? client?.email ?? "No active client"}
			/>

			<div className="grid gap-4 sm:grid-cols-3">
				<DashboardMetric label="Events" value={rows.length.toLocaleString()} />
				<DashboardMetric
					label="Points Issued"
					value={totalAwarded.toLocaleString()}
				/>
				<DashboardMetric
					label="Unique Customers"
					value={new Set(
						rows.map((row) => row.email).filter(Boolean),
					).size.toLocaleString()}
				/>
			</div>

			{rows.length ? (
				<DashboardSection
					title="Activity timeline"
					description="Latest 100 loyalty transactions"
				>
					<div className="divide-y">
						{rows.map((row) => (
							<div
								key={row.id}
								className="flex items-center justify-between px-5 py-3"
							>
								<div>
									<p className="text-sm font-medium">{row.reason}</p>
									<p className="text-xs text-muted-foreground">
										{row.name ?? row.email} · {row.email}
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-semibold">{row.amount} pts</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(row.createdAt)}
									</p>
								</div>
							</div>
						))}
					</div>
				</DashboardSection>
			) : (
				<DashboardEmptyState
					title="No loyalty activity found"
					description="No loyalty transactions are available for this client yet."
				/>
			)}
		</div>
	);
}
