import { cn } from "@lylrv/ui";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  GiftIcon,
  History,
  Home,
  SparkleIcon,
  X,
} from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  Button,
  FloatingButton,
  LoadingState,
  Panel,
  PanelContent,
  PanelFooter,
  PointIcon,
  TabNavigation,
} from "@/components";
import { useLocalizations, useLoyaltyWidget } from "@lylrv/hooks";
import { DEFAULT_MIN_REDEEM, DEFAULT_REDEEM_VALUES } from "@/constants";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import { WidgetProvider } from "@/providers";
import stylesText from "@/styles.css?inline";
import type { LoyaltyTab, WidgetConfig } from "@/types";
import { formatPoints, getVariable, parseNumberList } from "@/utils";

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
    shop: config.apiKey || config.shop || "",
    email: userEmail ?? undefined,
    apiBaseUrl,
    isLoggedIn,
    userPoints: config.user?.points,
    userReferralCode: config.user?.referralCode,
  });

  const spentPoints = 0;

  const tabs = [
    { id: "home" as LoyaltyTab, label: <Home className="h-4 w-4" /> },
    {
      id: "earn" as LoyaltyTab,
      label: t.earn_more_points?.split(" ")[0] || "Earn",
    },
    { id: "redeem" as LoyaltyTab, label: t.redeem || "Redeem" },
    { id: "history" as LoyaltyTab, label: <History className="h-4 w-4" /> },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-9999">
      <FloatingButton
        onClick={handleToggle}
        icon={<GiftIcon className="h-5 w-5" />}
        label={t.main_floating_button_title || "Loyalty Points"}
        className="pl-2 pr-4"
      />

      <Panel
        isOpen={isOpen}
        onClose={handleToggle}
        className={cn(
          "z-10002 flex flex-col",
          "w-[min(440px,calc(100vw-1.25rem))] h-[min(82vh,700px)] max-sm:w-screen max-sm:h-dvh max-sm:rounded-none",
          "p-0 box-border overflow-hidden",
        )}
      >
        <ThemedHeader
          isLoggedIn={isLoggedIn}
          userName={userName}
          userEmail={userEmail}
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

        <PanelContent className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoading ? "loading" : !isLoggedIn ? "unauth" : activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitions.smooth}
            >
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
            </motion.div>
          </AnimatePresence>
        </PanelContent>

        <PanelFooter>
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
          >
            {t.need_help || "Need help?"}
          </button>
        </PanelFooter>
      </Panel>
    </div>
  );
}

// ─── Themed Header ────────────────────────────────────────────────────────

interface ThemedHeaderProps {
  isLoggedIn: boolean;
  userName?: string | null;
  userEmail?: string | null;
  headerTitle: string;
  onClose: () => void;
  activeTab: LoyaltyTab;
  onBack: () => void;
}

function ThemedHeader({
  isLoggedIn,
  userName,
  userEmail,
  headerTitle,
  onClose,
  activeTab,
  onBack,
}: ThemedHeaderProps) {
  const showBackButton = activeTab !== "home";

  return (
    <header className="h-34 w-full shrink-0 border-b bg-muted/40 text-center text-foreground">
      <div className="relative flex flex-col w-full h-full py-4 text-lg font-semibold leading-none tracking-tight px-5 max-sm:px-4">
        <div className="relative flex flex-row items-center justify-between w-full mb-auto">
          <AnimatePresence>
            {showBackButton && (
              <motion.button
                type="button"
                onClick={onBack}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={transitions.snappy}
                className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
          {!showBackButton && <div />}
          <button
            type="button"
            onClick={onClose}
            onKeyUp={(e) => e.key === "Escape" && onClose()}
            className="p-1.5 rounded-full transition-colors hover:bg-muted cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center justify-center grow">
          {isLoggedIn ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transitions.spring}
              className="flex flex-col items-center justify-center text-center text-sm w-full"
            >
              <h1 className="text-muted-foreground text-[11px] tracking-[0.2em] uppercase">
                {headerTitle}
              </h1>
              <p className="font-bold text-xl mt-1.5 tracking-tight">
                {userName || userEmail || "User"}
              </p>
            </motion.div>
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={transitions.spring}
              className="text-2xl text-center font-bold tracking-tight"
            >
              {headerTitle}
            </motion.h1>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Card Component ───────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

/** Inline card — pure Tailwind, no stylesheet class */
function Card({ children, className, onClick }: CardProps) {
  const cardClasses = cn("rounded-lg border bg-card p-4 shadow-sm", className);

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(cardClasses, "cursor-pointer text-left w-full")}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }
  return <div className={cardClasses}>{children}</div>;
}

// ─── Unauthenticated View ─────────────────────────────────────────────────

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Sign in section */}
      <motion.div variants={staggerItem}>
        <Card className="text-center">
          <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
            {t.unlock_exciting_perks || "Unlock exciting perks and rewards!"}
          </p>
          <Button fullWidth>{t.sign_in || "Sign In"}</Button>
          <p className="mt-3 text-xs text-muted-foreground">
            {t.already_have_an_account || "Already have an account?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline cursor-pointer"
            >
              {t.join_now || "Join Now"}
            </button>
          </p>
        </Card>
      </motion.div>

      {/* Ways to earn section */}
      <motion.div variants={staggerItem}>
        <h3 className="mb-3 text-base font-semibold text-foreground">
          {t.earn_more_points || "Ways to Earn Points"}
        </h3>
        <div className="space-y-2.5">
          {earnSections.slice(0, 3).map((section, i) => (
            <motion.div key={i} variants={staggerItem}>
              <Card className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                  +{section.earnAmount}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground text-sm">
                    {section.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {section.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Referral info */}
      <motion.div variants={staggerItem}>
        <Card className="text-center">
          <h3 className="text-base font-semibold text-foreground mb-1.5">
            {t.referral_title || "Refer a Friend"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t.referral_paragraph_1 || "Share your code and earn"}{" "}
            <span className="font-bold text-primary">{referralGainValue}</span>{" "}
            {t.points || "points"}
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Home Tab ─────────────────────────────────────────────────────────────

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Points summary cards */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 gap-3 max-sm:grid-cols-1"
      >
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PointIcon className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">
              {t.total_points || "Total Points"}
            </span>
          </div>
          <motion.span
            key={points}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={transitions.springBouncy}
            className="text-xl font-bold text-foreground tabular-nums"
          >
            {formatPoints(points)}
          </motion.span>
        </Card>
        <Card className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PointIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {t.spent_points || "Spent Points"}
            </span>
          </div>
          <span className="text-xl font-bold text-foreground tabular-nums">
            {formatPoints(Math.abs(spentPoints))}
          </span>
        </Card>
      </motion.div>

      {/* Earn and Redeem navigation cards */}
      <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3">
        <Card
          className="flex items-center justify-between"
          onClick={() => onNavigate("earn")}
        >
          <div className="flex flex-col items-start gap-2">
            <SparkleIcon className="h-7 w-7 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {t.earn_more_points?.split(" ").slice(0, 2).join(" ") ||
                "Earn Points"}
            </span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
        </Card>
        <Card
          className="flex items-center justify-between"
          onClick={() => onNavigate("redeem")}
        >
          <div className="flex flex-col items-start gap-2">
            <GiftIcon className="h-7 w-7 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {t.redeem_points || "Redeem Points"}
            </span>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-muted-foreground" />
        </Card>
      </motion.div>

      {/* Referral section */}
      {referralCode && (
        <motion.div variants={staggerItem}>
          <Card>
            <h3 className="text-base font-semibold text-foreground mb-1.5">
              {t.referral_title || "Refer a Friend"}
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {t.referral_paragraph_1 || "Share your code and earn"}{" "}
              <span className="font-bold text-primary">
                {referralGainValue}
              </span>{" "}
              {t.points || "points"}
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-input bg-muted/70 px-4 py-2.5 font-mono text-sm text-center tracking-wide">
                {referralCode}
              </div>
              <Button onClick={onCopyReferral} size="sm">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copiedCode ? "copied" : "copy"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={transitions.snappy}
                  >
                    {copiedCode
                      ? "Copied!"
                      : t.copy_referral_code?.split(" ")[0] || "Copy"}
                  </motion.span>
                </AnimatePresence>
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Earn Tab ─────────────────────────────────────────────────────────────

interface EarnTabProps {
  t: Record<string, string>;
  earnSections: Array<{
    title: string;
    earnAmount: string;
    description: string;
  }>;
}

function getColorScheme(amount: number, amounts: number[]): string {
  const sortedAmounts = [...amounts].sort((a, b) => a - b);
  const index = sortedAmounts.indexOf(amount);
  const colors: string[] = [
    "bg-slate-100 text-slate-600",
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-amber-50 text-amber-600",
    "bg-orange-50 text-orange-600",
    "bg-rose-50 text-rose-600",
    "bg-violet-50 text-violet-600",
  ];
  const color = colors[Math.min(index, colors.length - 1)];
  return color ?? colors[0] ?? "";
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
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 max-sm:grid-cols-1"
      >
        {sortedSections.map((section, i) => (
          <motion.div key={i} variants={staggerItem}>
            <Card className="flex items-start gap-3 max-sm:flex-row">
              <motion.div
                className={cn(
                  "h-12 w-12 max-sm:h-10 max-sm:w-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
                  getColorScheme(Number(section.earnAmount), amounts),
                )}
              >
                +{section.earnAmount}
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm mb-0.5">
                  {section.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {section.description}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Redeem Tab ───────────────────────────────────────────────────────────

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
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {t.redeem_points_description || "Exchange your points for discounts"}
        </p>
      </div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3"
      >
        {redeemValues.map((value) => {
          const canRedeem = points >= value;
          const isSelected = selectedRedeem === value;
          return (
            <motion.div key={value} variants={staggerItem}>
              <Card
                className={cn(
                  "flex flex-col items-center p-4",
                  canRedeem
                    ? "hover:border-primary cursor-pointer"
                    : "opacity-40 cursor-not-allowed saturate-0",
                  isSelected &&
                    "border-primary ring-2 ring-primary/20 bg-primary/5",
                )}
                onClick={() => canRedeem && onSelect(value)}
              >
                <motion.div
                  animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={transitions.springBouncy}
                  className="flex items-center justify-center mb-2"
                >
                  <GiftIcon
                    className={cn(
                      "h-9 w-9",
                      canRedeem ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </motion.div>
                <p
                  className={cn(
                    "text-2xl font-bold tabular-nums",
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
            </motion.div>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {selectedRedeem && (
          <motion.div
            initial={{ opacity: 0, y: 8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={transitions.spring}
          >
            <Button fullWidth onClick={onConfirm} disabled={isRedeeming}>
              {isRedeeming
                ? "..."
                : `${t.redeem_confirmation || "Confirm Redeem"} - ${selectedRedeem} ${t.points || "pts"}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────

interface HistoryTabProps {
  t: Record<string, string>;
  recentActivity: Array<{
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
  }>;
}

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
        <div className="overflow-hidden rounded-lg border bg-card">
          {/* Table header */}
          <div className="grid grid-cols-4 gap-2 border-b bg-muted/40 px-4 py-3 text-xs font-medium text-muted-foreground">
            <span>{t.activity_reason || "Reason"}</span>
            <span>{t.activity_points || "Points"}</span>
            <span>{t.activity_date || "Date"}</span>
            <span>{t.activity_expiry_status || "Expiry"}</span>
          </div>

          {/* Table rows with stagger */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="divide-y divide-border/40"
          >
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                variants={staggerItem}
                className="grid grid-cols-4 gap-2 px-4 py-3 text-sm hover:bg-muted/20 transition-colors duration-150"
              >
                <span className="text-foreground truncate">
                  {activity.reason}
                </span>
                <span
                  className={cn(
                    "font-semibold tabular-nums",
                    activity.amount >= 0 ? "text-emerald-600" : "text-rose-500",
                  )}
                >
                  {activity.amount >= 0 ? "+" : ""}
                  {activity.amount}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {new Date(activity.createdAt).toLocaleDateString()}
                </span>
                <span className="text-muted-foreground">
                  {calculateExpiryStatus(
                    activity.createdAt,
                    activity.amount,
                    t,
                  )}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={transitions.smooth}
        >
          <Card className="text-center py-8">
            <p className="text-muted-foreground">
              {t.no_activity || "No activity yet."}
            </p>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────────────────

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
