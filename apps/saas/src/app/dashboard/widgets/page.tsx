"use client";

import { cn } from "@lylrv/ui";
import { Button } from "@lylrv/ui/button";
import { Input } from "@lylrv/ui/input";
import { Switch } from "@lylrv/ui/switch";
import { toast } from "@lylrv/ui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useEffect } from "react";

import { useTRPC } from "~/trpc/react";

// Hardcoded for demo - in real app, get from auth context or route params
const DEMO_CLIENT_ID = "00000000-0000-0000-0000-000000000000";

// Default values for widget settings
const DEFAULT_SETTINGS = {
  isEnabled: true,
  activeWidgets: { loyalty: false, reviews: false, productReviews: false },
  appearance: {
    primaryColor: "#c87a1a",
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
    <div className="flex flex-1 flex-col gap-8">
      {/* Page header */}
      <div className="reveal-up">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Configuration
        </span>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight lg:text-4xl">
          Widget Settings
        </h1>
        <p className="mt-1 max-w-lg text-sm text-muted-foreground">
          Configure and customize the embeddable widgets that appear on your
          storefront. Changes are reflected in real-time.
        </p>
      </div>

      <WidgetSettingsForm clientId={DEMO_CLIENT_ID} />
    </div>
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
        toast.success("Widget settings saved successfully");
        queryClient.invalidateQueries({
          queryKey: trpc.widget.getSettings.queryKey({ clientId }),
        });
        setIsDirty(false);
      },
      onError: () => {
        toast.error("Failed to save widget settings");
      },
    }),
  );

  const [localSettings, setLocalSettings] =
    useState<WidgetSettingsState | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const updateLocalSettings = useCallback(
    (updates: Partial<WidgetSettingsState>) => {
      const base = currentSettings ?? DEFAULT_SETTINGS;
      setLocalSettings({ ...base, ...updates });
      setIsDirty(true);
    },
    [currentSettings],
  );

  const handleToggleWidget = useCallback(
    (widget: "loyalty" | "reviews" | "productReviews") => {
      const base = currentSettings ?? DEFAULT_SETTINGS;
      updateLocalSettings({
        activeWidgets: {
          ...base.activeWidgets,
          [widget]: !base.activeWidgets[widget],
        },
      });
    },
    [currentSettings, updateLocalSettings],
  );

  const handleColorChange = useCallback(
    (color: string) => {
      const base = currentSettings ?? DEFAULT_SETTINGS;
      updateLocalSettings({
        appearance: { ...base.appearance, primaryColor: color },
      });
    },
    [currentSettings, updateLocalSettings],
  );

  const handlePositionChange = useCallback(
    (position: "left" | "right") => {
      const base = currentSettings ?? DEFAULT_SETTINGS;
      updateLocalSettings({
        appearance: { ...base.appearance, position },
      });
    },
    [currentSettings, updateLocalSettings],
  );

  const handleToggleEnabled = useCallback(() => {
    const base = currentSettings ?? DEFAULT_SETTINGS;
    updateLocalSettings({ isEnabled: !base.isEnabled });
  }, [currentSettings, updateLocalSettings]);

  const handleSave = () => {
    if (!localSettings) return;
    updateMutation.mutate({
      clientId,
      isEnabled: localSettings.isEnabled,
      activeWidgets: localSettings.activeWidgets,
      appearance: localSettings.appearance,
    });
  };

  const handleDiscard = () => {
    setLocalSettings(null);
    setIsDirty(false);
  };

  const installSnippet = `<script src="${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/widgets/loader.bundle.js?shop=YOUR_SHOP_ID" async></script>`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(installSnippet);
    setCopied(true);
    toast.success("Snippet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [installSnippet]);

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 animate-pulse rounded-xl border bg-card"
              />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-xl border bg-card" />
          <div className="h-48 animate-pulse rounded-xl border bg-card" />
        </div>
      </div>
    );
  }

  if (!currentSettings) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-destructive">
              Failed to load settings
            </h3>
            <p className="text-xs text-destructive/70">
              We couldn&apos;t retrieve your widget configuration. Please try
              again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — main settings */}
        <div className="space-y-6 lg:col-span-2">
          {/* Master Toggle */}
          <div className="reveal-up delay-1 group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-xl transition-all duration-300",
                    currentSettings.isEnabled
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2v4" />
                    <path d="m16.24 7.76-2.12 2.12" />
                    <path d="M20 14h-4" />
                    <path d="m16.24 20.24-2.12-2.12" />
                    <path d="M12 22v-4" />
                    <path d="m4 14 2.12 2.12" />
                    <path d="M2 10h4" />
                    <path d="m4 4 2.12 2.12" />
                    <circle cx="12" cy="14" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">
                    Enable Widgets
                  </h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Master switch for all widget visibility on your storefront
                  </p>
                </div>
              </div>
              <Switch
                checked={currentSettings.isEnabled}
                onCheckedChange={handleToggleEnabled}
              />
            </div>
            {/* Status bar */}
            <div
              className={cn(
                "flex items-center gap-2 border-t px-6 py-3 text-xs font-medium transition-colors duration-300",
                currentSettings.isEnabled
                  ? "border-primary/10 bg-primary/[0.03] text-primary"
                  : "border-border bg-muted/30 text-muted-foreground",
              )}
            >
              <span className="relative flex size-1.5">
                {currentSettings.isEnabled && (
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-40" />
                )}
                <span
                  className={cn(
                    "relative inline-flex size-1.5 rounded-full",
                    currentSettings.isEnabled
                      ? "bg-primary"
                      : "bg-muted-foreground/40",
                  )}
                />
              </span>
              {currentSettings.isEnabled
                ? "Widgets are live on your storefront"
                : "Widgets are currently hidden"}
            </div>
          </div>

          {/* Active Widgets */}
          <div className="reveal-up delay-2 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-base font-semibold tracking-tight">
                Active Widgets
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Choose which widgets appear on your storefront
              </p>
            </div>
            <div className="divide-y">
              {(
                [
                  {
                    key: "loyalty" as const,
                    title: "Loyalty Points",
                    description:
                      "Floating panel showing customer points balance, tier status, and available rewards",
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ),
                  },
                  {
                    key: "reviews" as const,
                    title: "Store Reviews",
                    description:
                      "Showcase overall store ratings and customer testimonials in a beautiful carousel",
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                    ),
                  },
                  {
                    key: "productReviews" as const,
                    title: "Product Reviews",
                    description:
                      "Display star ratings and review summaries directly on product pages",
                    icon: (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="18"
                          height="18"
                          x="3"
                          y="3"
                          rx="2"
                          ry="2"
                        />
                        <path d="M3 9h18" />
                        <path d="M9 21V9" />
                      </svg>
                    ),
                  },
                ] as const
              ).map((widget) => {
                const isActive = currentSettings.activeWidgets[widget.key];
                return (
                  <div
                    key={widget.key}
                    className="group flex items-center justify-between px-6 py-5 transition-colors duration-200 hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl transition-all duration-300",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {widget.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold">
                            {widget.title}
                          </h3>
                          {isActive && (
                            <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/5 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 max-w-sm text-xs text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => handleToggleWidget(widget.key)}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Appearance */}
          <div className="reveal-up delay-3 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-base font-semibold tracking-tight">
                Appearance
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Customize how widgets look on your storefront
              </p>
            </div>
            <div className="grid gap-8 p-6 sm:grid-cols-2">
              {/* Color Picker */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Brand Color
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={currentSettings.appearance.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    />
                    <div
                      className="size-12 rounded-xl border-2 border-border shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                      style={{
                        backgroundColor:
                          currentSettings.appearance.primaryColor,
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={currentSettings.appearance.primaryColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="h-10 font-mono text-sm uppercase"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                {/* Quick color presets */}
                <div className="flex gap-2 pt-1">
                  {[
                    "#c87a1a",
                    "#0ea5e9",
                    "#8b5cf6",
                    "#10b981",
                    "#ef4444",
                    "#ec4899",
                    "#f97316",
                    "#1a1a1a",
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={cn(
                        "size-7 rounded-lg border-2 transition-all duration-200 hover:scale-110",
                        currentSettings.appearance.primaryColor === color
                          ? "border-foreground shadow-md"
                          : "border-transparent hover:border-border",
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Position */}
              <div className="space-y-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Widget Position
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["left", "right"] as const).map((pos) => {
                    const isSelected =
                      currentSettings.appearance.position === pos;
                    return (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => handlePositionChange(pos)}
                        className={cn(
                          "group relative flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 transition-all duration-200",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/30 hover:bg-muted/30",
                        )}
                      >
                        {/* Visual indicator */}
                        <div className="flex h-10 w-full items-end gap-1 rounded-md bg-muted/50 p-1.5">
                          <div
                            className={cn(
                              "h-full w-2 rounded-sm transition-colors duration-200",
                              isSelected
                                ? "bg-primary"
                                : "bg-muted-foreground/20",
                              pos === "left" ? "order-first" : "order-last",
                            )}
                          />
                          <div className="flex-1 space-y-1">
                            <div className="h-1 w-3/4 rounded bg-muted-foreground/10" />
                            <div className="h-1 w-1/2 rounded bg-muted-foreground/10" />
                          </div>
                        </div>
                        <span
                          className={cn(
                            "text-xs font-medium capitalize transition-colors",
                            isSelected
                              ? "text-primary"
                              : "text-muted-foreground",
                          )}
                        >
                          {pos}
                        </span>
                        {isSelected && (
                          <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[8px] text-primary-foreground">
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — preview & installation */}
        <div className="space-y-6">
          {/* Live Preview */}
          <div className="reveal-up delay-2 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold">Live Preview</h2>
              <p className="text-xs text-muted-foreground">
                How your widget will look
              </p>
            </div>
            <div className="relative flex aspect-[3/4] items-end justify-center overflow-hidden bg-muted/20 p-6">
              {/* Mock page */}
              <div className="absolute inset-4 rounded-lg border border-dashed border-border/50 bg-background/50">
                {/* Fake page lines */}
                <div className="space-y-3 p-4">
                  <div className="h-3 w-3/4 rounded bg-muted-foreground/5" />
                  <div className="h-3 w-1/2 rounded bg-muted-foreground/5" />
                  <div className="h-3 w-5/6 rounded bg-muted-foreground/5" />
                  <div className="h-3 w-2/3 rounded bg-muted-foreground/5" />
                </div>
              </div>

              {/* Widget preview */}
              {currentSettings.isEnabled && (
                <div
                  className={cn(
                    "absolute bottom-6 z-10 flex flex-col items-center gap-2 transition-all duration-500",
                    currentSettings.appearance.position === "right"
                      ? "right-6"
                      : "left-6",
                  )}
                >
                  {/* Widget popup */}
                  <div
                    className="w-48 overflow-hidden rounded-xl border shadow-xl"
                    style={{
                      borderColor: `${currentSettings.appearance.primaryColor}20`,
                    }}
                  >
                    <div
                      className="px-4 py-2.5 text-[10px] font-semibold text-white"
                      style={{
                        backgroundColor:
                          currentSettings.appearance.primaryColor,
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 18 18"
                          fill="currentColor"
                        >
                          <path d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z" />
                        </svg>
                        Your Rewards
                      </div>
                    </div>
                    <div className="space-y-2 bg-card p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">
                          Points
                        </span>
                        <span className="text-[10px] font-bold">1,250</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: "62%",
                            backgroundColor:
                              currentSettings.appearance.primaryColor,
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">
                          Tier: Gold
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          750 to Platinum
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Floating trigger button */}
                  <div
                    className="flex size-10 items-center justify-center rounded-full shadow-lg"
                    style={{
                      backgroundColor: currentSettings.appearance.primaryColor,
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 18 18"
                      fill="white"
                    >
                      <path d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Installation snippet */}
          <div className="reveal-up delay-4 overflow-hidden rounded-xl border bg-card shadow-sm">
            <div className="border-b px-6 py-4">
              <h2 className="text-sm font-semibold">Installation</h2>
              <p className="text-xs text-muted-foreground">
                Add this to your storefront
              </p>
            </div>
            <div className="p-4">
              <p className="mb-3 px-2 text-xs text-muted-foreground">
                Paste this snippet before the closing{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">
                  &lt;/body&gt;
                </code>{" "}
                tag:
              </p>
              <div className="group relative">
                <pre className="overflow-x-auto rounded-xl border bg-muted/30 p-4 text-[11px] leading-relaxed text-foreground/80 backdrop-blur-sm">
                  <code className="font-mono">{installSnippet}</code>
                </pre>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    "absolute right-2 top-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-all duration-200",
                    copied
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-border bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm hover:text-foreground group-hover:opacity-100",
                  )}
                >
                  {copied ? (
                    <>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied
                    </>
                  ) : (
                    <>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-3 px-2 text-[10px] text-muted-foreground/60">
                Replace{" "}
                <code className="font-mono text-muted-foreground">
                  YOUR_SHOP_ID
                </code>{" "}
                with your unique identifier from the Settings page.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t bg-background/80 backdrop-blur-xl transition-all duration-500",
          isDirty
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none",
        )}
      >
        <div className="ml-64 flex items-center justify-between px-10 py-4">
          <div className="flex items-center gap-3">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              You have unsaved changes
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDiscard}
              className="text-muted-foreground"
            >
              Discard
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="relative min-w-[120px] bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              {updateMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
