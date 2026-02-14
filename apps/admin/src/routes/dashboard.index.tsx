import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

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
		return <DashboardLoadingState label="dashboard overview" />;
	}

	if (overviewQuery.isError) {
		return (
			<DashboardErrorState description="The dashboard overview request failed. Try refreshing the page." />
		);
	}

	if (!overviewQuery.data) {
		return (
			<DashboardEmptyState
				title="No client selected"
				description="Create a client from the signup flow, then select it from the workspace switcher to view analytics."
			/>
		);
	}

	const { client, summary, recentActivity } = overviewQuery.data;

	return (
		<div className="flex flex-col gap-6">
			<DashboardPageHeader
				title={client.name ?? client.email}
				description="Real-time summary from your connected client workspace."
				meta="Overview"
			/>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
				<DashboardMetric
					label="Customers"
					value={summary.customerCount.toLocaleString()}
					note="Profiles synced"
				/>
				<DashboardMetric
					label="Loyalty Events"
					value={summary.activityCount.toLocaleString()}
					note="Recent point actions"
				/>
				<DashboardMetric
					label="Reviews"
					value={summary.reviewCount.toLocaleString()}
					note="User feedback"
				/>
				<DashboardMetric
					label="Referrals"
					value={summary.referralCount.toLocaleString()}
					note="Codes and usage"
				/>
				<DashboardMetric
					label="Orders"
					value={summary.orderCount.toLocaleString()}
					note="Commerce records"
				/>
			</div>

			<div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
				<DashboardSection
					title="Recent loyalty activity"
					description="Latest points transactions for the selected client."
				>
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
				</DashboardSection>

				<DashboardSection
					title="Quick navigation"
					description="Open key areas with one click."
				>
					<div className="space-y-2 p-4 text-sm">
						<QuickLink to="/dashboard/customers" label="Customers" />
						<QuickLink to="/dashboard/loyalty" label="Loyalty" />
						<QuickLink to="/dashboard/reviews" label="Reviews" />
						<QuickLink to="/dashboard/orders" label="Orders" />
						<QuickLink to="/dashboard/settings" label="Settings" />
					</div>
				</DashboardSection>
			</div>
		</div>
	);
}

function QuickLink({ to, label }: { to: string; label: string }) {
	return (
		<Link
			to={to}
			className="flex items-center justify-between rounded-lg border border-border/80 px-3 py-2 font-medium transition hover:bg-muted/40"
		>
			<span>{label}</span>
			<span className="text-muted-foreground">→</span>
		</Link>
	);
}
