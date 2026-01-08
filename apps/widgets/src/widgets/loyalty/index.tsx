import { createRoot } from "react-dom/client";
import {
	Button,
	FloatingButton,
	LoadingState,
	Panel,
	PanelContent,
	PanelFooter,
	PanelHeader,
	TabNavigation,
} from "../../components";
import {
	GiftIcon,
	HistoryIcon,
	HomeIcon,
	LoyaltyIcon,
	SparkleIcon,
} from "../../components/icons";
import { DEFAULT_MIN_REDEEM, DEFAULT_REDEEM_VALUES } from "../../constants";
import {
	useLocalizations,
	useLoyaltyWidget,
	useWidgetTheme,
} from "../../hooks";
import { WidgetProvider } from "../../providers";
import type { WidgetConfig } from "../../types";
import type { LoyaltyTab } from "../../types/loyalty.types";
import { formatPoints, getVariable, parseNumberList } from "../../utils";
import styles from "./styles.css?inline";

interface LoyaltyWidgetProps {
	config: WidgetConfig;
	apiBaseUrl: string;
}

function LoyaltyWidget({ config, apiBaseUrl }: LoyaltyWidgetProps) {
	const t = useLocalizations(config);
	const theme = useWidgetTheme(config);

	const isLoggedIn = config.user?.isLoggedIn || false;
	const userEmail = config.user?.email;
	const earnSections = config.clientConfig?.earnSections || [];
	const variables = config.clientConfig?.variables;

	const redeemValues = parseNumberList(
		variables,
		"redeem_values",
		DEFAULT_REDEEM_VALUES,
	);
	const minRedeemValue = Number.parseInt(
		getVariable(variables, "min_redeem_value", String(DEFAULT_MIN_REDEEM)),
		10,
	);
	const referralGainValue = getVariable(
		variables,
		"referral_gain_value",
		"120",
	);

	const {
		isOpen,
		activeTab,
		copiedCode,
		selectedRedeem,
		isLoading,
		points,
		referralCode,
		recentActivity,
		handleToggle,
		handleCopyReferral,
		handleRedeem,
		handleConfirmRedeem,
		setActiveTab,
		isRedeeming,
	} = useLoyaltyWidget({
		shop: config.shop || "",
		email: userEmail,
		apiBaseUrl,
		isLoggedIn,
		userPoints: config.user?.points,
		userReferralCode: config.user?.referralCode,
	});

	const tabs = [
		{ id: "home" as LoyaltyTab, label: <HomeIcon className="h-4 w-4" /> },
		{
			id: "earn" as LoyaltyTab,
			label: t.earn_more_points?.split(" ")[0] || "Earn",
		},
		{ id: "redeem" as LoyaltyTab, label: t.redeem || "Redeem" },
		{ id: "history" as LoyaltyTab, label: <HistoryIcon className="h-4 w-4" /> },
	];

	return (
		<div className="fixed bottom-4 left-4 z-9999">
			<FloatingButton
				onClick={handleToggle}
				icon={<LoyaltyIcon className="h-7 w-7" />}
				label={t.main_floating_button_title || "Loyalty Points"}
			/>

			<Panel isOpen={isOpen} position={theme.position} isRTL={theme.isRTL}>
				<PanelHeader>
					<h2 className="text-lg font-semibold">
						{t.point_system_header || "Loyalty Points"}
					</h2>
					{isLoggedIn && (
						<div className="mt-2">
							<p className="text-3xl font-bold">{formatPoints(points)}</p>
							<p className="text-sm opacity-90">
								{t.total_points || "Total Points"}
							</p>
						</div>
					)}
				</PanelHeader>

				{isLoggedIn && (
					<TabNavigation
						tabs={tabs}
						activeTab={activeTab}
						onTabChange={(id) => setActiveTab(id as LoyaltyTab)}
					/>
				)}

				<PanelContent>
					{isLoading ? (
						<LoadingState />
					) : !isLoggedIn ? (
						<UnauthenticatedView t={t} earnSections={earnSections} />
					) : activeTab === "home" ? (
						<HomeTab
							t={t}
							points={points}
							referralCode={referralCode}
							referralGainValue={referralGainValue}
							copiedCode={copiedCode}
							onCopyReferral={handleCopyReferral}
							onNavigate={setActiveTab}
						/>
					) : activeTab === "earn" ? (
						<EarnTab t={t} earnSections={earnSections} />
					) : activeTab === "redeem" ? (
						<RedeemTab
							t={t}
							points={points}
							redeemValues={redeemValues}
							minRedeemValue={minRedeemValue}
							selectedRedeem={selectedRedeem}
							isRedeeming={isRedeeming}
							onSelect={handleRedeem}
							onConfirm={handleConfirmRedeem}
						/>
					) : (
						<HistoryTab t={t} recentActivity={recentActivity} />
					)}
				</PanelContent>

				<PanelFooter>
					<button
						type="button"
						className="text-xs text-muted-foreground hover:text-foreground"
					>
						{t.need_help || "Need help?"}
					</button>
				</PanelFooter>
			</Panel>
		</div>
	);
}

interface UnauthenticatedViewProps {
	t: Record<string, string>;
	earnSections: Array<{
		title: string;
		earnAmount: string;
		description: string;
	}>;
}

function UnauthenticatedView({ t, earnSections }: UnauthenticatedViewProps) {
	return (
		<div className="space-y-4">
			<div className="text-center">
				<p className="mb-4 text-sm text-muted-foreground">
					{t.unlock_exciting_perks || "Unlock exciting perks and rewards!"}
				</p>
				<Button fullWidth>{t.sign_in || "Sign In"}</Button>
				<p className="mt-3 text-xs text-muted-foreground">
					{t.already_have_an_account || "Already have an account?"}{" "}
					<button type="button" className="font-medium text-primary">
						{t.join_now || "Join Now"}
					</button>
				</p>
			</div>

			<div className="border-t border-border pt-4">
				<h3 className="mb-3 text-sm font-semibold text-foreground">
					{t.earn_more_points || "Ways to Earn Points"}
				</h3>
				<ul className="space-y-2">
					{earnSections.slice(0, 3).map((section, i) => (
						<li
							key={i}
							className="flex items-start gap-2 text-sm text-muted-foreground"
						>
							<span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
								{section.earnAmount}
							</span>
							<span>{section.title}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}

interface HomeTabProps {
	t: Record<string, string>;
	points: number;
	referralCode: string | null;
	referralGainValue: string;
	copiedCode: boolean;
	onCopyReferral: () => void;
	onNavigate: (tab: LoyaltyTab) => void;
}

function HomeTab({
	t,
	points,
	referralCode,
	referralGainValue,
	copiedCode,
	onCopyReferral,
	onNavigate,
}: HomeTabProps) {
	return (
		<div className="space-y-4">
			<div className="rounded-lg bg-primary/10 p-4 text-center">
				<p className="text-4xl font-bold text-primary">
					{formatPoints(points)}
				</p>
				<p className="text-sm text-muted-foreground">
					{t.total_points || "Available Points"}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<Button variant="outline" onClick={() => onNavigate("redeem")}>
					<GiftIcon className="h-4 w-4" />
					{t.redeem_points || "Redeem"}
				</Button>
				<Button variant="outline" onClick={() => onNavigate("earn")}>
					<SparkleIcon className="h-4 w-4" />
					{t.earn_more_points?.split(" ").slice(0, 2).join(" ") || "Earn More"}
				</Button>
			</div>

			{referralCode && (
				<div className="border-t border-border pt-4">
					<h3 className="mb-2 text-sm font-semibold text-foreground">
						{t.referral_title || "Refer a Friend"}
					</h3>
					<p className="mb-2 text-xs text-muted-foreground">
						{t.referral_paragraph_1 || "Share your code and earn"}{" "}
						{referralGainValue} {t.points || "points"}
					</p>
					<div className="flex items-center gap-2">
						<div className="flex-1 rounded-lg border border-input bg-muted px-3 py-2 font-mono text-sm">
							{referralCode}
						</div>
						<Button onClick={onCopyReferral} size="sm">
							{copiedCode ? "✓" : t.copy_referral_code?.split(" ")[0] || "Copy"}
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

interface EarnTabProps {
	t: Record<string, string>;
	earnSections: Array<{
		title: string;
		earnAmount: string;
		description: string;
	}>;
}

function EarnTab({ t, earnSections }: EarnTabProps) {
	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold text-foreground">
				{t.earn_points_page_title || "Ways to Earn Points"}
			</h3>
			{earnSections.map((section, i) => (
				<div key={i} className="rounded-lg border border-border p-3">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<p className="font-medium text-foreground">{section.title}</p>
							<p className="mt-1 text-xs text-muted-foreground">
								{section.description}
							</p>
						</div>
						<span className="ml-2 shrink-0 rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
							+{section.earnAmount}
						</span>
					</div>
				</div>
			))}
		</div>
	);
}

interface RedeemTabProps {
	t: Record<string, string>;
	points: number;
	redeemValues: number[];
	minRedeemValue: number;
	selectedRedeem: number | null;
	isRedeeming: boolean;
	onSelect: (value: number) => void;
	onConfirm: () => void;
}

function RedeemTab({
	t,
	points,
	redeemValues,
	minRedeemValue,
	selectedRedeem,
	isRedeeming,
	onSelect,
	onConfirm,
}: RedeemTabProps) {
	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold text-foreground">
				{t.redeem_points_title?.replace(
					"{redeemValue}",
					String(minRedeemValue),
				) || "Redeem Points"}
			</h3>
			<p className="text-xs text-muted-foreground">
				{t.redeem_points_description || "Exchange your points for discounts"}
			</p>
			<div className="grid grid-cols-2 gap-2">
				{redeemValues.map((value) => {
					const canRedeem = points >= value;
					const isSelected = selectedRedeem === value;
					return (
						<button
							key={value}
							type="button"
							onClick={() => canRedeem && onSelect(value)}
							disabled={!canRedeem}
							className={`rounded-lg border p-3 text-center transition-colors ${
								canRedeem
									? "hover:border-primary"
									: "cursor-not-allowed opacity-50"
							} ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
						>
							<p
								className={`text-lg font-bold ${canRedeem ? "text-primary" : "text-muted-foreground"}`}
							>
								{value}
							</p>
							<p className="text-xs text-muted-foreground">
								{t.points || "Points"}
							</p>
						</button>
					);
				})}
			</div>
			{selectedRedeem && (
				<Button fullWidth onClick={onConfirm} disabled={isRedeeming}>
					{isRedeeming
						? "..."
						: `${t.redeem_confirmation || "Confirm Redeem"} - ${selectedRedeem} ${t.points || "pts"}`}
				</Button>
			)}
		</div>
	);
}

interface HistoryTabProps {
	t: Record<string, string>;
	recentActivity: Array<{
		id: string;
		amount: number;
		reason: string;
		createdAt: string;
	}>;
}

function HistoryTab({ t, recentActivity }: HistoryTabProps) {
	return (
		<div className="space-y-3">
			<h3 className="text-sm font-semibold text-foreground">
				{t.activity_reason || "Activity History"}
			</h3>
			{recentActivity.length > 0 ? (
				recentActivity.map((activity) => (
					<div
						key={activity.id}
						className="flex items-center justify-between rounded-lg border border-border p-3"
					>
						<div>
							<p className="text-sm font-medium text-foreground">
								{activity.reason}
							</p>
							<p className="text-xs text-muted-foreground">
								{new Date(activity.createdAt).toLocaleDateString()}
							</p>
						</div>
						<span
							className={`font-bold ${activity.amount >= 0 ? "text-green-600" : "text-red-500"}`}
						>
							{activity.amount >= 0 ? "+" : ""}
							{activity.amount}
						</span>
					</div>
				))
			) : (
				<p className="py-4 text-center text-sm text-muted-foreground">
					No activity yet.
				</p>
			)}
		</div>
	);
}

export function mount(container: HTMLElement, config: WidgetConfig) {
	const shadowRoot = container.attachShadow({ mode: "open" });

	const scripts = document.querySelectorAll('script[src*="loader.bundle.js"]');
	const scriptElement = scripts[0] as HTMLScriptElement | undefined;
	const apiBaseUrl = scriptElement
		? new URL(scriptElement.src).origin
		: window.location.origin;

	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	shadowRoot.appendChild(styleElement);

	const mountPoint = document.createElement("div");
	shadowRoot.appendChild(mountPoint);

	const root = createRoot(mountPoint);
	root.render(
		<WidgetProvider config={config} apiBaseUrl={apiBaseUrl}>
			<LoyaltyWidget config={config} apiBaseUrl={apiBaseUrl} />
		</WidgetProvider>,
	);
}

if (typeof window !== "undefined") {
	window.LylrvWidgets = window.LylrvWidgets || {};
	window.LylrvWidgets.loyalty = { mount };
}
