import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { ConfigVariable, WidgetConfig } from "../../types";
import styles from "./styles.css?inline";

interface LoyaltyAppProps {
	config: WidgetConfig;
	apiBaseUrl: string;
}

interface CustomerData {
	totalPoints: number;
	referralCode: string | null;
	recentActivity: Array<{
		id: string;
		amount: number;
		reason: string;
		createdAt: string;
	}>;
	activeCoupons: Array<{
		id: string;
		code: string;
		amount: number;
	}>;
}

// Helper to get localized text
function useLocalizations(config: WidgetConfig) {
	return useMemo(() => {
		const locale = config.clientConfig?.language?.local || "en";
		const localizations = config.clientConfig?.localizations || {};
		return localizations[locale] || localizations.en || {};
	}, [config]);
}

// Helper to get variable value
function getVariable(
	variables: ConfigVariable[] | undefined,
	name: string,
): string {
	return variables?.find((v) => v.name === name)?.value || "";
}

// Parse redeem values from variable
function getRedeemValues(variables: ConfigVariable[] | undefined): number[] {
	const value = getVariable(variables, "redeem_values");
	if (!value) return [100, 200, 500, 1000];
	return value
		.split(",")
		.map((v) => parseInt(v.trim(), 10))
		.filter((v) => !Number.isNaN(v));
}

function LoyaltyApp({ config, apiBaseUrl }: LoyaltyAppProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"home" | "earn" | "redeem" | "history"
	>("home");
	const [customerData, setCustomerData] = useState<CustomerData | null>(null);
	const [loading, setLoading] = useState(false);
	const [copiedCode, setCopiedCode] = useState(false);
	const [selectedRedeem, setSelectedRedeem] = useState<number | null>(null);

	const t = useLocalizations(config);
	const theme = config.clientConfig?.theme;
	const primaryColor =
		theme?.buttonBackgroundColor || config.styles.primaryColor;
	const textColor = theme?.buttonTextColor || "#ffffff";
	const isRTL = config.clientConfig?.language?.direction === "rtl";
	const isLoggedIn = config.user?.isLoggedIn || false;
	const userEmail = config.user?.email;

	const earnSections = config.clientConfig?.earnSections || [];
	const redeemValues = getRedeemValues(config.clientConfig?.variables);
	const minRedeemValue = parseInt(
		getVariable(config.clientConfig?.variables, "min_redeem_value") || "100",
		10,
	);
	const referralGainValue =
		getVariable(config.clientConfig?.variables, "referral_gain_value") || "120";

	// Fetch customer data when logged in
	useEffect(() => {
		if (isLoggedIn && userEmail && isOpen) {
			setLoading(true);
			fetch(
				`${apiBaseUrl}/api/widget/customer?shop=${encodeURIComponent(config.clientId || "")}&email=${encodeURIComponent(userEmail)}`,
			)
				.then((res) => res.json())
				.then((data) => {
					if (data.exists && data.customer) {
						setCustomerData(data.customer);
					}
				})
				.catch((err) => console.error("[Lylrv] Customer fetch error:", err))
				.finally(() => setLoading(false));
		}
	}, [isLoggedIn, userEmail, isOpen, apiBaseUrl, config.clientId]);

	const handleCopyReferral = () => {
		if (customerData?.referralCode) {
			navigator.clipboard.writeText(customerData.referralCode);
			setCopiedCode(true);
			setTimeout(() => setCopiedCode(false), 2000);
		}
	};

	const points = customerData?.totalPoints ?? config.user?.points ?? 0;
	const referralCode =
		customerData?.referralCode ?? config.user?.referralCode ?? null;

	return (
		<div style={{ direction: isRTL ? "rtl" : "ltr" }}>
			{/* Floating Action Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
				style={{ backgroundColor: primaryColor }}
				aria-label={t.main_floating_button_title || "Loyalty Points"}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill={textColor}
					className="h-7 w-7"
				>
					<path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
				</svg>
			</button>

			{/* Panel */}
			{isOpen && (
				<div
					className="absolute bottom-16 w-80 overflow-hidden rounded-xl bg-white shadow-2xl"
					style={{ [isRTL ? "left" : "right"]: 0 }}
				>
					{/* Header */}
					<div
						className="p-4 text-center"
						style={{ backgroundColor: primaryColor, color: textColor }}
					>
						<h2 className="text-lg font-semibold">
							{t.point_system_header || "Loyalty Points"}
						</h2>
						{isLoggedIn && (
							<div className="mt-2">
								<p className="text-3xl font-bold">{points}</p>
								<p className="text-sm opacity-90">
									{t.total_points || "Total Points"}
								</p>
							</div>
						)}
					</div>

					{/* Navigation Tabs */}
					{isLoggedIn && (
						<div className="flex border-b">
							{(["home", "earn", "redeem", "history"] as const).map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab)}
									className={`flex-1 py-2 text-xs font-medium transition-colors ${
										activeTab === tab
											? "border-b-2 text-gray-900"
											: "text-gray-500 hover:text-gray-700"
									}`}
									style={
										activeTab === tab
											? { borderColor: primaryColor, color: primaryColor }
											: {}
									}
								>
									{tab === "home" && "🏠"}
									{tab === "earn" &&
										(t.earn_more_points?.split(" ")[0] || "Earn")}
									{tab === "redeem" && (t.redeem || "Redeem")}
									{tab === "history" && "📜"}
								</button>
							))}
						</div>
					)}

					{/* Content */}
					<div className="max-h-80 overflow-y-auto p-4">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div
									className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300"
									style={{ borderTopColor: primaryColor }}
								/>
							</div>
						) : !isLoggedIn ? (
							/* Unauthenticated View */
							<div className="space-y-4">
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-4">
										{t.unlock_exciting_perks ||
											"Unlock exciting perks and rewards!"}
									</p>
									<button
										className="w-full rounded-lg py-3 text-sm font-medium transition-colors hover:opacity-90"
										style={{ backgroundColor: primaryColor, color: textColor }}
									>
										{t.sign_in || "Sign In"}
									</button>
									<p className="mt-3 text-xs text-gray-500">
										{t.already_have_an_account || "Already have an account?"}{" "}
										<button
											className="font-medium"
											style={{ color: primaryColor }}
										>
											{t.join_now || "Join Now"}
										</button>
									</p>
								</div>

								{/* Preview of benefits */}
								<div className="border-t pt-4">
									<h3 className="mb-3 text-sm font-semibold text-gray-800">
										{t.earn_more_points || "Ways to Earn Points"}
									</h3>
									<ul className="space-y-2">
										{earnSections.slice(0, 3).map((section, i) => (
											<li
												key={i}
												className="flex items-start gap-2 text-sm text-gray-600"
											>
												<span
													className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
													style={{
														backgroundColor: primaryColor,
														color: textColor,
													}}
												>
													{section.earnAmount}
												</span>
												<span>{section.title}</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						) : activeTab === "home" ? (
							/* Home Tab - Authenticated */
							<div className="space-y-4">
								{/* Points Balance Card */}
								<div
									className="rounded-lg p-4 text-center"
									style={{ backgroundColor: `${primaryColor}15` }}
								>
									<p
										className="text-4xl font-bold"
										style={{ color: primaryColor }}
									>
										{points}
									</p>
									<p className="text-sm text-gray-600">
										{t.total_points || "Available Points"}
									</p>
								</div>

								{/* Quick Actions */}
								<div className="grid grid-cols-2 gap-2">
									<button
										onClick={() => setActiveTab("redeem")}
										className="rounded-lg border p-3 text-center text-sm font-medium hover:bg-gray-50"
									>
										🎁 {t.redeem_points || "Redeem"}
									</button>
									<button
										onClick={() => setActiveTab("earn")}
										className="rounded-lg border p-3 text-center text-sm font-medium hover:bg-gray-50"
									>
										⭐{" "}
										{t.earn_more_points?.split(" ").slice(0, 2).join(" ") ||
											"Earn More"}
									</button>
								</div>

								{/* Referral Section */}
								{referralCode && (
									<div className="border-t pt-4">
										<h3 className="mb-2 text-sm font-semibold text-gray-800">
											{t.referral_title || "Refer a Friend"}
										</h3>
										<p className="mb-2 text-xs text-gray-500">
											{t.referral_paragraph_1 || "Share your code and earn"}{" "}
											{referralGainValue} {t.points || "points"}
										</p>
										<div className="flex items-center gap-2">
											<div className="flex-1 rounded-lg border bg-gray-50 px-3 py-2 font-mono text-sm">
												{referralCode}
											</div>
											<button
												onClick={handleCopyReferral}
												className="rounded-lg px-3 py-2 text-sm font-medium text-white"
												style={{ backgroundColor: primaryColor }}
											>
												{copiedCode
													? "✓"
													: t.copy_referral_code?.split(" ")[0] || "Copy"}
											</button>
										</div>
									</div>
								)}
							</div>
						) : activeTab === "earn" ? (
							/* Earn Tab */
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-800">
									{t.earn_points_page_title || "Ways to Earn Points"}
								</h3>
								{earnSections.map((section, i) => (
									<div key={i} className="rounded-lg border p-3">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<p className="font-medium text-gray-800">
													{section.title}
												</p>
												<p className="mt-1 text-xs text-gray-500">
													{section.description}
												</p>
											</div>
											<span
												className="ml-2 shrink-0 rounded-full px-2 py-1 text-xs font-bold"
												style={{
													backgroundColor: `${primaryColor}15`,
													color: primaryColor,
												}}
											>
												+{section.earnAmount}
											</span>
										</div>
									</div>
								))}
							</div>
						) : activeTab === "redeem" ? (
							/* Redeem Tab */
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-800">
									{t.redeem_points_title?.replace(
										"{redeemValue}",
										String(minRedeemValue),
									) || "Redeem Points"}
								</h3>
								<p className="text-xs text-gray-500">
									{t.redeem_points_description ||
										"Exchange your points for discounts"}
								</p>
								<div className="grid grid-cols-2 gap-2">
									{redeemValues.map((value) => (
										<button
											key={value}
											onClick={() => setSelectedRedeem(value)}
											disabled={points < value}
											className={`rounded-lg border p-3 text-center transition-colors ${
												points >= value
													? "hover:border-gray-400"
													: "cursor-not-allowed opacity-50"
											} ${selectedRedeem === value ? "ring-2" : ""}`}
											style={
												selectedRedeem === value
													? {
															ringColor: primaryColor,
															borderColor: primaryColor,
														}
													: {}
											}
										>
											<p
												className="text-lg font-bold"
												style={{
													color: points >= value ? primaryColor : "gray",
												}}
											>
												{value}
											</p>
											<p className="text-xs text-gray-500">
												{t.points || "Points"}
											</p>
										</button>
									))}
								</div>
								{selectedRedeem && (
									<button
										className="w-full rounded-lg py-3 text-sm font-medium text-white"
										style={{ backgroundColor: primaryColor }}
									>
										{t.redeem_confirmation || "Confirm Redeem"} -{" "}
										{selectedRedeem} {t.points || "pts"}
									</button>
								)}
							</div>
						) : (
							/* History Tab */
							<div className="space-y-3">
								<h3 className="text-sm font-semibold text-gray-800">
									{t.activity_reason || "Activity History"}
								</h3>
								{customerData?.recentActivity?.length ? (
									customerData.recentActivity.map((activity) => (
										<div
											key={activity.id}
											className="flex items-center justify-between rounded-lg border p-3"
										>
											<div>
												<p className="text-sm font-medium text-gray-800">
													{activity.reason}
												</p>
												<p className="text-xs text-gray-500">
													{new Date(activity.createdAt).toLocaleDateString()}
												</p>
											</div>
											<span
												className={`font-bold ${activity.amount >= 0 ? "text-green-600" : "text-red-600"}`}
											>
												{activity.amount >= 0 ? "+" : ""}
												{activity.amount}
											</span>
										</div>
									))
								) : (
									<p className="text-center text-sm text-gray-500 py-4">
										No activity yet
									</p>
								)}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="border-t p-2 text-center">
						<button className="text-xs text-gray-400 hover:text-gray-600">
							{t.need_help || "Need help?"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// Mount function exposed to the loader
export function mount(container: HTMLElement, config: WidgetConfig) {
	const shadow = container.attachShadow({ mode: "open" });

	// Inject styles into Shadow DOM
	const styleTag = document.createElement("style");
	styleTag.textContent = styles;
	shadow.appendChild(styleTag);

	// Create root element for React
	const root = document.createElement("div");
	root.className = "relative";
	shadow.appendChild(root);

	// Determine API base URL from script source or use window location
	const scripts = document.querySelectorAll('script[src*="loader"]');
	let apiBaseUrl = window.location.origin;
	if (scripts.length > 0) {
		const scriptUrl = new URL((scripts[0] as HTMLScriptElement).src);
		apiBaseUrl = scriptUrl.origin;
	}

	createRoot(root).render(
		<LoyaltyApp config={config} apiBaseUrl={apiBaseUrl} />,
	);
}

// Register with global namespace for loader
if (typeof window !== "undefined") {
	(window as any).LylrvWidgets = (window as any).LylrvWidgets || {};
	(window as any).LylrvWidgets.loyalty = { mount };
}
