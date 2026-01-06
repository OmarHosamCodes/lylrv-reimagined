"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";

// Hardcoded for demo - in real app, get from auth context or route params
const DEMO_CLIENT_ID = "00000000-0000-0000-0000-000000000000";

// Default values for widget settings
const DEFAULT_SETTINGS = {
	isEnabled: true,
	activeWidgets: { loyalty: false, reviews: false, productReviews: false },
	appearance: {
		primaryColor: "#000000",
		position: "right" as "left" | "right",
	},
};

type WidgetSettingsState = {
	isEnabled: boolean;
	activeWidgets: {
		loyalty: boolean;
		reviews: boolean;
		productReviews: boolean;
	};
	appearance: { primaryColor: string; position: "left" | "right" };
};

export default function WidgetsPage() {
	return (
		<main className="container mx-auto max-w-4xl py-8">
			<h1 className="mb-8 text-3xl font-bold">Widget Settings</h1>
			<WidgetSettingsForm clientId={DEMO_CLIENT_ID} />
		</main>
	);
}

function WidgetSettingsForm({ clientId }: { clientId: string }) {
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const { data: settings, isLoading } = useQuery(
		trpc.widget.getSettings.queryOptions({ clientId }),
	);

	const updateMutation = useMutation(
		trpc.widget.updateSettings.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.widget.getSettings.queryKey({ clientId }),
				});
			},
		}),
	);

	const [localSettings, setLocalSettings] =
		useState<WidgetSettingsState | null>(null);
	const [isDirty, setIsDirty] = useState(false);

	// Normalize the server response to our local state shape
	const normalizedSettings: WidgetSettingsState | null = settings
		? {
				isEnabled: settings.isEnabled ?? DEFAULT_SETTINGS.isEnabled,
				activeWidgets: settings.activeWidgets ?? DEFAULT_SETTINGS.activeWidgets,
				appearance: settings.appearance ?? DEFAULT_SETTINGS.appearance,
			}
		: null;

	// Use local settings if dirty, otherwise use normalized server data
	const currentSettings =
		isDirty && localSettings ? localSettings : normalizedSettings;

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!currentSettings) {
		return (
			<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
				Failed to load widget settings
			</div>
		);
	}

	const updateLocalSettings = (updates: Partial<WidgetSettingsState>) => {
		setLocalSettings({ ...currentSettings, ...updates });
		setIsDirty(true);
	};

	const handleToggleWidget = (
		widget: "loyalty" | "reviews" | "productReviews",
	) => {
		updateLocalSettings({
			activeWidgets: {
				...currentSettings.activeWidgets,
				[widget]: !currentSettings.activeWidgets[widget],
			},
		});
	};

	const handleColorChange = (color: string) => {
		updateLocalSettings({
			appearance: { ...currentSettings.appearance, primaryColor: color },
		});
	};

	const handlePositionChange = (position: "left" | "right") => {
		updateLocalSettings({
			appearance: { ...currentSettings.appearance, position },
		});
	};

	const handleToggleEnabled = () => {
		updateLocalSettings({
			isEnabled: !currentSettings.isEnabled,
		});
	};

	const handleSave = () => {
		if (!localSettings) return;
		updateMutation.mutate({
			clientId,
			isEnabled: localSettings.isEnabled,
			activeWidgets: localSettings.activeWidgets,
			appearance: localSettings.appearance,
		});
		setIsDirty(false);
	};

	const installSnippet = `<script src="${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/widgets/loader.bundle.js?shop=YOUR_SHOP_ID" async></script>`;

	return (
		<div className="space-y-8">
			{/* Master Toggle */}
			<div className="rounded-lg border p-6">
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold">Enable Widgets</h2>
						<p className="text-sm text-gray-600">
							Master switch to enable or disable all widgets on your site
						</p>
					</div>
					<button
						type="button"
						onClick={handleToggleEnabled}
						className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
							currentSettings.isEnabled ? "bg-primary" : "bg-gray-300"
						}`}
					>
						<span
							className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
								currentSettings.isEnabled ? "translate-x-6" : "translate-x-1"
							}`}
						/>
					</button>
				</div>
			</div>

			{/* Active Widgets */}
			<div className="rounded-lg border p-6">
				<h2 className="mb-4 text-xl font-semibold">Active Widgets</h2>
				<div className="space-y-4">
					{(["loyalty", "reviews", "productReviews"] as const).map((widget) => (
						<div
							key={widget}
							className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
						>
							<div>
								<h3 className="font-medium capitalize">
									{widget === "productReviews" ? "Product Reviews" : widget}{" "}
									Widget
								</h3>
								<p className="text-sm text-gray-600">
									{widget === "loyalty" && "Show loyalty points and rewards"}
									{widget === "reviews" && "Display store reviews widget"}
									{widget === "productReviews" &&
										"Show reviews on product pages"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => handleToggleWidget(widget)}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
									currentSettings.activeWidgets[widget]
										? "bg-primary"
										: "bg-gray-300"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
										currentSettings.activeWidgets[widget]
											? "translate-x-6"
											: "translate-x-1"
									}`}
								/>
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Appearance */}
			<div className="rounded-lg border p-6">
				<h2 className="mb-4 text-xl font-semibold">Appearance</h2>
				<div className="grid gap-6 md:grid-cols-2">
					<div>
						<label className="mb-2 block text-sm font-medium">
							Primary Color
						</label>
						<div className="flex items-center gap-3">
							<input
								type="color"
								value={currentSettings.appearance.primaryColor}
								onChange={(e) => handleColorChange(e.target.value)}
								className="h-10 w-14 cursor-pointer rounded border"
							/>
							<input
								type="text"
								value={currentSettings.appearance.primaryColor}
								onChange={(e) => handleColorChange(e.target.value)}
								className="flex-1 rounded-lg border px-3 py-2 text-sm"
								placeholder="#000000"
							/>
						</div>
					</div>
					<div>
						<label className="mb-2 block text-sm font-medium">Position</label>
						<div className="flex gap-2">
							{(["left", "right"] as const).map((pos) => (
								<button
									key={pos}
									type="button"
									onClick={() => handlePositionChange(pos)}
									className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors ${
										currentSettings.appearance.position === pos
											? "border-primary bg-primary/10 text-primary"
											: "border-gray-200 hover:border-gray-300"
									}`}
								>
									{pos}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Installation */}
			<div className="rounded-lg border p-6">
				<h2 className="mb-4 text-xl font-semibold">Installation</h2>
				<p className="mb-3 text-sm text-gray-600">
					Add this script tag to your website's HTML, just before the closing{" "}
					<code className="rounded bg-gray-100 px-1">&lt;/body&gt;</code> tag:
				</p>
				<div className="relative">
					<pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
						<code>{installSnippet}</code>
					</pre>
					<button
						type="button"
						onClick={() => navigator.clipboard.writeText(installSnippet)}
						className="absolute right-2 top-2 rounded bg-gray-700 px-2 py-1 text-xs text-white hover:bg-gray-600"
					>
						Copy
					</button>
				</div>
				<p className="mt-2 text-xs text-gray-500">
					Replace YOUR_SHOP_ID with your unique shop identifier.
				</p>
			</div>

			{/* Save Button */}
			{isDirty && (
				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleSave}
						disabled={updateMutation.isPending}
						className="rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
					>
						{updateMutation.isPending ? "Saving..." : "Save Changes"}
					</button>
				</div>
			)}
		</div>
	);
}
