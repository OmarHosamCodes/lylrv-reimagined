import { cn } from "@lylrv/ui";
import { Button } from "@lylrv/ui/button";
import { Input } from "@lylrv/ui/input";
import { Label } from "@lylrv/ui/label";
import { Textarea } from "@lylrv/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  AverageRatingDisplay,
  FloatingButton,
  LoadingState,
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
  RatingDistribution,
  ReviewCard,
  StarRating,
  TabNavigation,
} from "@/components";
import { useLocalizations, useReviewsWidget } from "@/hooks";
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  transitions,
} from "@/lib/transitions";
import { WidgetProvider } from "@/providers";
import stylesText from "@/styles.css?inline";
import type { WidgetConfig } from "@/types";
import type { ReviewsTabs } from "@/types/reviews.types";

interface ReviewsWidgetProps {
  config: WidgetConfig;
  apiBaseUrl: string;
}

function ReviewsWidget({ config, apiBaseUrl }: ReviewsWidgetProps) {
  const t = useLocalizations(config);
  const isLoggedIn = config.user?.isLoggedIn || false;

  const {
    isOpen,
    activeTab,
    formData,
    isLoading,
    reviews,
    meta,
    handleToggle,
    setActiveTab,
    handleRatingChange,
    handleInputChange,
    handleSubmit,
    canSubmit,
    isSubmitting,
  } = useReviewsWidget({
    shop: config.shop || "",
    apiBaseUrl,
    type: "website",
  });

  const tabs = [
    { id: "reviews" as ReviewsTabs, label: t.reviews_tab_title || "Reviews" },
    { id: "write" as ReviewsTabs, label: t.write_review || "Write Review" },
  ];

  return (
    <div className="fixed bottom-4 right-4 z-9999">
      <FloatingButton
        onClick={handleToggle}
        icon={<Star className="h-7 w-7" />}
        label={t.secondary_floating_button_title || "Reviews"}
        badge={meta?.total}
        className="pl-2 pr-4"
      />

      <Panel
        isOpen={isOpen}
        onClose={handleToggle}
        className={cn(
          "z-10002 flex flex-col",
          "w-[min(440px,calc(100vw-1.25rem))] h-[min(82vh,700px)] max-sm:w-screen max-sm:h-[100dvh] max-sm:rounded-none",
          "p-0 box-border overflow-hidden",
        )}
      >
        <PanelHeader className="py-5">
          <motion.h2
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transitions.spring}
            className="ly-widget-heading text-lg"
          >
            {t.reviews_system_header || "Customer Reviews"}
          </motion.h2>
        </PanelHeader>

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as ReviewsTabs)}
        />

        <PanelContent className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoading ? "loading" : activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transitions.smooth}
            >
              {isLoading ? (
                <LoadingState />
              ) : activeTab === "reviews" ? (
                <ReviewsTab t={t} reviews={reviews} meta={meta} />
              ) : (
                <WriteReviewTab
                  t={t}
                  isLoggedIn={isLoggedIn}
                  formData={formData}
                  canSubmit={canSubmit}
                  isSubmitting={isSubmitting}
                  onRatingChange={handleRatingChange}
                  onInputChange={handleInputChange}
                  onSubmit={handleSubmit}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </PanelContent>

        <PanelFooter className="bg-white/40">
          <motion.button
            type="button"
            whileHover={{ color: "var(--color-foreground)" }}
            className="text-xs font-medium text-muted-foreground transition-colors"
          >
            {t.need_help || "Need help?"}
          </motion.button>
        </PanelFooter>
      </Panel>
    </div>
  );
}

// ─── Reviews Tab ──────────────────────────────────────────────────────────

interface ReviewsTabProps {
  t: Record<string, string>;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    title: string | null;
    body: string | null;
    images: string[] | null;
    verified: boolean;
    createdAt: string;
  }>;
  meta: {
    total: number;
    averageRating: number;
    ratingDistribution: number[];
  } | null;
}

function ReviewsTab({ t, reviews, meta }: ReviewsTabProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {meta && (
        <motion.section
          variants={fadeInUp}
          className="grid grid-cols-[auto_1fr] items-center gap-3 py-1 max-sm:grid-cols-1"
        >
          <AverageRatingDisplay
            avgRating={meta.averageRating}
            className="shrink-0"
          />
          <RatingDistribution
            distribution={meta.ratingDistribution}
            total={meta.total}
            className="flex-1 max-w-[230px] max-sm:max-w-full max-sm:w-full"
          />
        </motion.section>
      )}

      {meta && (
        <motion.p variants={staggerItem} className="ly-widget-pill mx-auto">
          {meta.total} {t.total_reviews || "reviews"}
        </motion.p>
      )}

      <motion.div
        variants={staggerItem}
        className="space-y-3 border-t border-white/50 pt-4"
      >
        {reviews.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {reviews.map((review) => (
              <motion.div key={review.id} variants={staggerItem}>
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t.no_reviews || "No reviews yet. Be the first to review!"}
          </p>
        )}
      </motion.div>

      {reviews.length > 0 && (
        <motion.button
          type="button"
          variants={staggerItem}
          whileHover={{ x: 3 }}
          transition={transitions.snappy}
          className="w-full rounded-xl border border-white/60 bg-white/55 py-2 text-center text-sm font-medium text-foreground transition-colors hover:bg-white/70"
        >
          {t.view_all || "View All"} →
        </motion.button>
      )}
    </motion.div>
  );
}

// ─── Write Review Tab ─────────────────────────────────────────────────────

interface WriteReviewTabProps {
  t: Record<string, string>;
  isLoggedIn: boolean;
  formData: { rating: number; title: string; body: string };
  canSubmit: boolean;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onInputChange: (field: "title" | "body", value: string) => void;
  onSubmit: () => void;
}

function WriteReviewTab({
  t,
  isLoggedIn,
  formData,
  canSubmit,
  isSubmitting,
  onRatingChange,
  onInputChange,
  onSubmit,
}: WriteReviewTabProps) {
  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.spring}
        className="ly-widget-card py-8 px-4 text-center"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {t.sign_in || "Sign in"} to write a review
        </p>
        <Button fullWidth>{t.sign_in || "Sign In"}</Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <motion.div variants={staggerItem}>
        <Label>{t.add_website_review || "Rate your experience"}</Label>
        <div className="mt-2">
          <StarRating
            rating={formData.rating}
            size="lg"
            interactive
            onRate={onRatingChange}
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Label htmlFor="review-title">
          {t.add_product_review_title || "Title"}
        </Label>
        <Input
          id="review-title"
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="Summary of your experience"
          className="mt-1.5 border-white/70 bg-white/65"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Label htmlFor="review-body">
          {t.add_website_review_body || "Your review"}
        </Label>
        <Textarea
          id="review-body"
          value={formData.body}
          onChange={(e) => onInputChange("body", e.target.value)}
          rows={4}
          placeholder="Tell us about your experience..."
          className="mt-1.5 border-white/70 bg-white/65"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Button
          fullWidth
          onClick={onSubmit}
          disabled={!canSubmit}
          className="rounded-xl shadow-lg"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isSubmitting ? "submitting" : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={transitions.snappy}
            >
              {isSubmitting
                ? "Submitting..."
                : t.write_review || "Submit Review"}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    </motion.div>
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
      <ReviewsWidget config={config} apiBaseUrl={apiBaseUrl} />
    </WidgetProvider>,
  );
}

if (typeof window !== "undefined") {
  window.LylrvWidgets = window.LylrvWidgets || {};
  window.LylrvWidgets.reviews = { mount };
}
