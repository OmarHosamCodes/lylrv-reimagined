import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/")({
	component: DashboardOverviewPage,
});

function DashboardOverviewPage() {
	const trpc = useTRPC();
	const { activeClientId } = useActiveClient();
	const overviewQuery = useQuery(
		trpc.dashboard.overview.queryOptions({ clientId: activeClientId }),
	);

	if (overviewQuery.isLoading) {
		return (
			<div className="text-sm text-muted-foreground">Loading dashboard...</div>
		);
	}

	if (!overviewQuery.data) {
		return (
			<div className="rounded-xl border border-border bg-card p-6">
				<h1 className="text-xl font-semibold">No client found</h1>
				<p className="mt-2 text-sm text-muted-foreground">
					Create a client from the signup flow to start seeing dashboard data.
				</p>
			</div>
		);
	}

	const { client, summary, recentActivity } = overviewQuery.data;

	return (
		<div className="flex flex-col gap-6">
			<div>
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
					Overview
				</p>
				<h1 className="mt-1 text-3xl font-bold tracking-tight">
					{client.name ?? client.email}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Real-time summary from your connected client workspace.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
				<MetricCard label="Customers" value={summary.customerCount} />
				<MetricCard label="Loyalty Events" value={summary.activityCount} />
				<MetricCard label="Reviews" value={summary.reviewCount} />
				<MetricCard label="Referrals" value={summary.referralCount} />
				<MetricCard label="Orders" value={summary.orderCount} />
			</div>

			<div className="rounded-xl border bg-card shadow-sm">
				<div className="border-b px-5 py-4">
					<h2 className="text-sm font-semibold">Recent loyalty activity</h2>
				</div>
				<div className="divide-y">
					{recentActivity.length ? (
						recentActivity.map((row) => (
							<div
								key={row.id}
								className="flex items-center justify-between px-5 py-3"
							>
								<div>
									<p className="text-sm font-medium">
										{row.name ?? row.email} · {row.reason}
									</p>
									<p className="text-xs text-muted-foreground">{row.email}</p>
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
						<p className="px-5 py-6 text-sm text-muted-foreground">
							No recent activity.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

function MetricCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl border bg-card p-4 shadow-sm">
			<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="mt-2 text-2xl font-semibold tracking-tight">
				{value.toLocaleString()}
			</p>
		</div>
	);
}

function formatDate(dateValue: string | null) {
	if (!dateValue) {
		return "—";
	}

	return new Date(dateValue).toLocaleDateString();
}
