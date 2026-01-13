import { cn } from "@lylrv/ui";
import { createRoot } from "react-dom/client";
import {
	Button,
	FloatingButton,
	LoadingState,
	Panel,
	PanelContent,
	PanelFooter,
	TabNavigation,
} from "../../components";
import {
	ArrowRightIcon,
	ChevronLeftIcon,
	CloseIcon,
	GiftIcon,
	HistoryIcon,
	HomeIcon,
	LoyaltyIcon,
	PointIcon,
	SparkleIcon,
} from "../../components/icons";
import { DEFAULT_MIN_REDEEM, DEFAULT_REDEEM_VALUES } from "../../constants";
import { useLocalizations, useLoyaltyWidget } from "../../hooks";
import { WidgetProvider } from "../../providers";
import stylesText from "../../styles.css?inline";
import type { WidgetConfig } from "../../types";
import type { LoyaltyTab } from "../../types/loyalty.types";
import { formatPoints, getVariable, parseNumberList } from "../../utils";

interface LoyaltyWidgetProps {
	config: WidgetConfig;
	apiBaseUrl: string;
}

function LoyaltyWidget({ config, apiBaseUrl }: LoyaltyWidgetProps) {
	const t = useLocalizations(config);

	const isLoggedIn = config.user?.isLoggedIn || false;
	const userEmail = config.user?.email;
	const userName = config.user?.name;
	const earnSections = config.clientConfig?.earnSections || [];
	const variables = config.clientConfig?.variables;
	const themeColor = config.clientConfig?.theme?.mainColor || "#6366f1";

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
		spentPoints,
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

			<Panel
				isOpen={isOpen}
				onClose={handleToggle}
				className={cn(
					"z-10002 flex flex-col",
					"w-3xl h-[600px] max-sm:w-screen max-sm:h-screen max-sm:min-w-full max-sm:max-w-lg",
					"p-0 box-border overflow-hidden",
					"bg-background border-none shadow-lg rounded-none sm:rounded-lg",
				)}
			>
				{/* Themed Header */}
				<ThemedHeader
					isLoggedIn={isLoggedIn}
					userName={userName}
					userEmail={userEmail}
					themeColor={themeColor}
					headerTitle={t.point_system_header || "Loyalty Points"}
					onClose={handleToggle}
					activeTab={activeTab}
					onBack={() => setActiveTab("home")}
				/>

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
						<UnauthenticatedView
							t={t}
							earnSections={earnSections}
							referralGainValue={referralGainValue}
						/>
					) : activeTab === "home" ? (
						<HomeTab
							t={t}
							points={points}
							spentPoints={spentPoints || 0}
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
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
					>
						{t.need_help || "Need help?"}
					</button>
				</PanelFooter>
			</Panel>
		</div>
	);
}

// Themed Header Component
interface ThemedHeaderProps {
	isLoggedIn: boolean;
	userName?: string;
	userEmail?: string;
	themeColor: string;
	headerTitle: string;
	onClose: () => void;
	activeTab: LoyaltyTab;
	onBack: () => void;
}

function ThemedHeader({
	isLoggedIn,
	userName,
	userEmail,
	themeColor,
	headerTitle,
	onClose,
	activeTab,
	onBack,
}: ThemedHeaderProps) {
	const showBackButton = activeTab !== "home";

	return (
		<header
			className="h-32 text-center flex flex-col items-center justify-center w-full sm:rounded-t-lg rounded-none flex-shrink-0"
			style={{
				backgroundColor: themeColor,
				color: "#ffffff",
			}}
		>
			<div className="flex flex-col w-full h-full py-4 text-lg font-semibold leading-none tracking-tight px-6 max-sm:px-4">
				{/* Top navigation row */}
				<div className="relative flex flex-row items-center justify-between w-full mb-auto">
					<button
						type="button"
						onClick={onBack}
						className={cn(
							"p-1 rounded-full hover:bg-white/10 transition-colors",
							!showBackButton && "invisible",
						)}
						aria-label="Go back"
					>
						<ChevronLeftIcon className="h-5 w-5 text-white" />
					</button>
					<button
						type="button"
						onClick={onClose}
						onKeyUp={(e) => e.key === "Escape" && onClose()}
						className="p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
						aria-label="Close"
					>
						<CloseIcon className="h-5 w-5 text-white" />
					</button>
				</div>

				{/* Content area */}
				<div className="flex items-center justify-center flex-grow">
					{isLoggedIn ? (
						<div className="flex flex-col items-center justify-center text-center text-sm w-full">
							<h1 className="text-white/80 text-sm">{headerTitle}</h1>
							<p className="font-bold text-lg mt-1">
								{userName || userEmail || "User"}
							</p>
						</div>
					) : (
						<h1 className="text-2xl text-center font-semibold">
							{headerTitle}
						</h1>
					)}
				</div>
			</div>
		</header>
	);
}

// Card Component for consistent styling
interface CardProps {
	children: React.ReactNode;
	className?: string;
	onClick?: () => void;
}

function Card({ children, className, onClick }: CardProps) {
	return (
		<div
			className={cn(
				"bg-card rounded-lg border border-border p-4 transition-all duration-200",
				onClick && "cursor-pointer hover:shadow-md hover:border-primary/30",
				className,
			)}
			onClick={onClick}
			onKeyUp={(e) => e.key === "Enter" && onClick?.()}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
		>
			{children}
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
	referralGainValue: string;
}

function UnauthenticatedView({
	t,
	earnSections,
	referralGainValue,
}: UnauthenticatedViewProps) {
	return (
		<div className="space-y-6">
			{/* Sign in section */}
			<Card className="text-center bg-primary/5 border-primary/20">
				<p className="mb-4 text-sm text-muted-foreground">
					{t.unlock_exciting_perks || "Unlock exciting perks and rewards!"}
				</p>
				<Button fullWidth>{t.sign_in || "Sign In"}</Button>
				<p className="mt-3 text-xs text-muted-foreground">
					{t.already_have_an_account || "Already have an account?"}{" "}
					<button
						type="button"
						className="font-medium text-primary hover:underline"
					>
						{t.join_now || "Join Now"}
					</button>
				</p>
			</Card>

			{/* Ways to earn section */}
			<div>
				<h3 className="mb-4 text-base font-semibold text-foreground">
					{t.earn_more_points || "Ways to Earn Points"}
				</h3>
				<div className="space-y-3">
					{earnSections.slice(0, 3).map((section, i) => (
						<Card key={i} className="flex items-center gap-3">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
								+{section.earnAmount}
							</div>
							<div className="flex-1">
								<p className="font-medium text-foreground">{section.title}</p>
								<p className="text-xs text-muted-foreground">
									{section.description}
								</p>
							</div>
						</Card>
					))}
				</div>
			</div>

			{/* Referral info */}
			<Card className="text-center bg-gradient-to-br from-primary/5 to-primary/10 border-none">
				<h3 className="text-base font-semibold text-foreground mb-2">
					{t.referral_title || "Refer a Friend"}
				</h3>
				<p className="text-sm text-muted-foreground">
					{t.referral_paragraph_1 || "Share your code and earn"}{" "}
					<span className="font-bold text-primary">{referralGainValue}</span>{" "}
					{t.points || "points"}
				</p>
			</Card>
		</div>
	);
}

interface HomeTabProps {
	t: Record<string, string>;
	points: number;
	spentPoints: number;
	referralCode: string | null;
	referralGainValue: string;
	copiedCode: boolean;
	onCopyReferral: () => void;
	onNavigate: (tab: LoyaltyTab) => void;
}

function HomeTab({
	t,
	points,
	spentPoints,
	referralCode,
	referralGainValue,
	copiedCode,
	onCopyReferral,
	onNavigate,
}: HomeTabProps) {
	return (
		<div className="space-y-5">
			{/* Points summary cards - 2 column grid */}
			<div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
				<Card className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<PointIcon className="h-5 w-5 text-primary" />
						<span className="text-sm text-muted-foreground">
							{t.total_points || "Total Points"}
						</span>
					</div>
					<span className="text-xl font-bold text-foreground">
						{formatPoints(points)}
					</span>
				</Card>
				<Card className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<PointIcon className="h-5 w-5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">
							{t.spent_points || "Spent Points"}
						</span>
					</div>
					<span className="text-xl font-bold text-foreground">
						{formatPoints(Math.abs(spentPoints))}
					</span>
				</Card>
			</div>

			{/* Earn and Redeem navigation cards */}
			<div className="grid grid-cols-2 gap-4">
				<Card
					className="flex items-center justify-between hover:bg-primary/5"
					onClick={() => onNavigate("earn")}
				>
					<div className="flex flex-col items-start gap-2">
						<SparkleIcon className="h-8 w-8 text-primary" />
						<span className="text-base font-medium text-foreground">
							{t.earn_more_points?.split(" ").slice(0, 2).join(" ") ||
								"Earn Points"}
						</span>
					</div>
					<ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
				</Card>
				<Card
					className="flex items-center justify-between hover:bg-primary/5"
					onClick={() => onNavigate("redeem")}
				>
					<div className="flex flex-col items-start gap-2">
						<GiftIcon className="h-8 w-8 text-primary" />
						<span className="text-base font-medium text-foreground">
							{t.redeem_points || "Redeem Points"}
						</span>
					</div>
					<ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
				</Card>
			</div>

			{/* Referral section */}
			{referralCode && (
				<Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none">
					<h3 className="text-base font-semibold text-foreground mb-2">
						{t.referral_title || "Refer a Friend"}
					</h3>
					<p className="text-sm text-muted-foreground mb-3">
						{t.referral_paragraph_1 || "Share your code and earn"}{" "}
						<span className="font-bold text-primary">{referralGainValue}</span>{" "}
						{t.points || "points"}
					</p>
					<div className="flex items-center gap-2">
						<div className="flex-1 rounded-lg border border-input bg-muted px-4 py-2.5 font-mono text-sm text-center">
							{referralCode}
						</div>
						<Button onClick={onCopyReferral} size="sm">
							{copiedCode ? "✓" : t.copy_referral_code?.split(" ")[0] || "Copy"}
						</Button>
					</div>
				</Card>
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

// Color scheme based on earn amount
function getColorScheme(amount: number, amounts: number[]): string {
	const sortedAmounts = [...amounts].sort((a, b) => a - b);
	const index = sortedAmounts.indexOf(amount);
	const colors = [
		"bg-slate-200 text-slate-700",
		"bg-blue-100 text-blue-700",
		"bg-green-100 text-green-700",
		"bg-yellow-100 text-yellow-700",
		"bg-orange-100 text-orange-700",
		"bg-red-100 text-red-700",
		"bg-purple-100 text-purple-700",
	];
	return colors[Math.min(index, colors.length - 1)] || colors[0];
}

function EarnTab({ t, earnSections }: EarnTabProps) {
	const sortedSections = [...earnSections].sort(
		(a, b) => Number(a.earnAmount) - Number(b.earnAmount),
	);
	const amounts = sortedSections.map((s) => Number(s.earnAmount));

	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-foreground">
				{t.earn_points_page_title || "Ways to Earn Points"}
			</h3>
			<div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
				{sortedSections.map((section, i) => (
					<Card
						key={i}
						className="flex items-start gap-3 hover:shadow-md transition-shadow max-sm:flex-row"
					>
						{/* Circular icon with color-coded amount */}
						<div
							className={cn(
								"h-14 w-14 max-sm:h-10 max-sm:w-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm transition-transform hover:scale-105",
								getColorScheme(Number(section.earnAmount), amounts),
							)}
						>
							+{section.earnAmount}
						</div>
						<div className="flex-1 min-w-0">
							<p className="font-medium text-foreground text-sm mb-1">
								{section.title}
							</p>
							<p className="text-xs text-muted-foreground line-clamp-2">
								{section.description}
							</p>
						</div>
					</Card>
				))}
			</div>
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
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold text-foreground">
					{t.redeem_points_title?.replace(
						"{redeemValue}",
						String(minRedeemValue),
					) || "Redeem Points"}
				</h3>
				<p className="text-sm text-muted-foreground mt-1">
					{t.redeem_points_description || "Exchange your points for discounts"}
				</p>
			</div>

			<div className="grid grid-cols-2 gap-3">
				{redeemValues.map((value) => {
					const canRedeem = points >= value;
					const isSelected = selectedRedeem === value;
					return (
						<Card
							key={value}
							className={cn(
								"flex flex-col items-center p-4 transition-all",
								canRedeem
									? "hover:border-primary cursor-pointer"
									: "opacity-50 cursor-not-allowed saturate-0",
								isSelected &&
									"border-primary ring-2 ring-primary/20 bg-primary/5",
							)}
							onClick={() => canRedeem && onSelect(value)}
						>
							<div className="flex items-center justify-center mb-2">
								<GiftIcon
									className={cn(
										"h-10 w-10",
										canRedeem ? "text-primary" : "text-muted-foreground",
									)}
								/>
							</div>
							<p
								className={cn(
									"text-2xl font-bold",
									canRedeem ? "text-primary" : "text-muted-foreground",
								)}
							>
								{value}
							</p>
							<p className="text-xs text-muted-foreground">
								{t.points || "Points"}
							</p>
							{canRedeem && (
								<div className="flex items-center gap-1 mt-2 text-primary text-sm font-medium">
									<span>{t.redeem || "Redeem"}</span>
									<ArrowRightIcon className="h-3 w-3" />
								</div>
							)}
						</Card>
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

// Calculate expiry status
function calculateExpiryStatus(
	createdAt: string,
	amount: number,
	t: Record<string, string>,
): string {
	if (amount <= 0) return "-";

	const createdDate = new Date(createdAt);
	const expiryDate = new Date(createdDate);
	expiryDate.setDate(expiryDate.getDate() + 90);

	const now = new Date();
	const diffTime = expiryDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	if (diffDays <= 0) return t.expired || "Expired";
	return `${diffDays} ${t.days_till_expiry || "days"}`;
}

function HistoryTab({ t, recentActivity }: HistoryTabProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-lg font-semibold text-foreground">
				{t.activity_reason || "Activity History"}
			</h3>

			{recentActivity.length > 0 ? (
				<div className="border border-border rounded-lg overflow-hidden">
					{/* Table header */}
					<div className="grid grid-cols-4 gap-2 bg-muted/50 px-4 py-3 text-xs font-medium text-muted-foreground border-b border-border">
						<span>{t.activity_reason || "Reason"}</span>
						<span>{t.activity_points || "Points"}</span>
						<span>{t.activity_date || "Date"}</span>
						<span>{t.activity_expiry_status || "Expiry"}</span>
					</div>

					{/* Table rows */}
					<div className="divide-y divide-border">
						{recentActivity.map((activity, index) => (
							<div
								key={activity.id}
								className="grid grid-cols-4 gap-2 px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
								style={{
									animationDelay: `${index * 50}ms`,
								}}
							>
								<span className="text-foreground truncate">
									{activity.reason}
								</span>
								<span
									className={cn(
										"font-medium",
										activity.amount >= 0 ? "text-green-600" : "text-red-500",
									)}
								>
									{activity.amount >= 0 ? "+" : ""}
									{activity.amount}
								</span>
								<span className="text-muted-foreground">
									{new Date(activity.createdAt).toLocaleDateString()}
								</span>
								<span className="text-muted-foreground">
									{calculateExpiryStatus(
										activity.createdAt,
										activity.amount,
										t,
									)}
								</span>
							</div>
						))}
					</div>
				</div>
			) : (
				<Card className="text-center py-8">
					<p className="text-muted-foreground">
						{t.no_activity || "No activity yet."}
					</p>
				</Card>
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

	const stylesheet = new CSSStyleSheet();
	stylesheet.replaceSync(stylesText);
	shadowRoot.adoptedStyleSheets = [stylesheet];

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
