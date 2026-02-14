import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

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
		return (
			<div className="text-sm text-muted-foreground">Loading settings...</div>
		);
	}

	if (!settingsQuery.data) {
		return (
			<div className="rounded-xl border bg-card p-6">
				<p className="text-sm text-muted-foreground">
					No settings available for this client.
				</p>
			</div>
		);
	}

	const { client, config, widgets } = settingsQuery.data;

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Client and widget configuration from backend schema.
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-xl border bg-card p-5">
					<h2 className="text-sm font-semibold">Client</h2>
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
				</div>

				<div className="rounded-xl border bg-card p-5">
					<h2 className="text-sm font-semibold">Widget Settings</h2>
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
				</div>
			</div>

			<div className="rounded-xl border bg-card p-5">
				<h2 className="text-sm font-semibold">Client Config</h2>
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
			</div>
		</div>
	);
}
