import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
  DashboardPageHeader,
  DashboardSection,
} from "~/component/dashboard-ui";
import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const trpc = useTRPC();
  const { activeClientId } = useActiveClient();
  const settingsQuery = useQuery(
    trpc.dashboard.settings.queryOptions({ clientId: activeClientId }),
  );

  if (settingsQuery.isLoading) {
    return <DashboardLoadingState label="settings" />;
  }

  if (settingsQuery.isError) {
    return (
      <DashboardErrorState description="The settings request failed. Try refreshing this page." />
    );
  }

  if (!settingsQuery.data) {
    return (
      <DashboardEmptyState
        title="No settings available"
        description="No settings are available for this client yet."
      />
    );
  }

  const { client, config, widgets } = settingsQuery.data;

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        title="Settings"
        description="Client and widget configuration from backend schema."
        meta={client.name ?? client.email}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardSection
          title="Client"
          description="Identity and account plan"
        >
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span>{" "}
              {client.name ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Email:</span>{" "}
              {client.email}
            </p>
            <p>
              <span className="text-muted-foreground">Plan:</span>{" "}
              {client.type ?? "free"}
            </p>
            <p>
              <span className="text-muted-foreground">Source:</span>{" "}
              {client.createSource}
            </p>
          </div>
        </DashboardSection>

        <DashboardSection
          title="Widget Settings"
          description="Current widget configuration snapshot"
        >
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Enabled:</span>{" "}
              {widgets?.isEnabled ? "Yes" : "No"}
            </p>
            <p>
              <span className="text-muted-foreground">Primary Color:</span>{" "}
              {widgets?.appearance?.primaryColor ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Position:</span>{" "}
              {widgets?.appearance?.position ?? "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Loyalty Widget:</span>{" "}
              {widgets?.activeWidgets?.loyalty ? "On" : "Off"}
            </p>
          </div>
        </DashboardSection>
      </div>

      <DashboardSection
        title="Client Config"
        description="Environment and integration details"
      >
        <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Integration:</span>{" "}
            {config?.integrationType ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Store URL:</span>{" "}
            {config?.storeUrl ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Active:</span>{" "}
            {config?.isActive ? "Yes" : "No"}
          </p>
          <p>
            <span className="text-muted-foreground">Locale:</span>{" "}
            {(config?.language as { locale?: string } | null)?.locale ?? "en"}
          </p>
        </div>
      </DashboardSection>
    </div>
  );
}
