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

function formatStatus(value: string | null) {
  if (!value) {
    return "Captured";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

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
  const codes = referralsQuery.data?.codes ?? [];
  const conversions = referralsQuery.data?.conversions ?? [];
  const summary = referralsQuery.data?.summary ?? {
    codeCount: 0,
    activeCodeCount: 0,
    conversionCount: 0,
    issuedCount: 0,
    revokedCount: 0,
  };

  const codeLookup = new Map(
    codes.map((row) => [
      row.code,
      row.customer?.name ?? row.customer?.email ?? "Unknown",
    ]),
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Referrals"
        description="Referral code ownership, referred-order state, and issued reward coupons."
        meta={client?.name ?? client?.email ?? "No active client"}
      />

      <div className="grid gap-4 sm:grid-cols-5">
        <DashboardMetric
          label="Codes"
          value={summary.codeCount.toLocaleString()}
        />
        <DashboardMetric
          label="Active Codes"
          value={summary.activeCodeCount.toLocaleString()}
        />
        <DashboardMetric
          label="Conversions"
          value={summary.conversionCount.toLocaleString()}
        />
        <DashboardMetric
          label="Rewards Issued"
          value={summary.issuedCount.toLocaleString()}
        />
        <DashboardMetric
          label="Rewards Revoked"
          value={summary.revokedCount.toLocaleString()}
        />
      </div>

      {conversions.length ? (
        <DashboardSection
          title="Referral conversions"
          description="Latest referred orders"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Referrer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Coupon</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {conversions.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 font-medium">#{row.orderId}</td>
                    <td className="px-4 py-3">
                      {row.email ??
                        row.phone ??
                        row.externalUserId ??
                        "Unknown"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs uppercase">
                        {row.referralCode ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.referralCode
                          ? (codeLookup.get(row.referralCode) ?? "Unknown")
                          : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>{formatStatus(row.referralStatus)}</div>
                      <div className="text-xs text-muted-foreground">
                        {row.referralReason ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs uppercase">
                        {row.rewardCouponCode ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {row.rewardCouponType ?? "—"}
                        {row.rewardCouponAmount !== null
                          ? ` • ${Number(row.rewardCouponAmount).toLocaleString()}`
                          : ""}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(row.updatedAt ?? row.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardSection>
      ) : (
        <DashboardEmptyState
          title="No referral conversions found"
          description="No referred orders have been synced for this client yet."
        />
      )}

      {codes.length ? (
        <DashboardSection
          title="Referral code ownership"
          description="Latest synced customer referral codes"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Active</th>
                  <th className="px-4 py-3">Usage</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {codes.map((row) => (
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
                      {formatDate(row.updatedAt ?? row.createdAt)}
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
