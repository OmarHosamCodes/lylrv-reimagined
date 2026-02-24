import { StarIcon } from "lucide-react";
import { createRoot } from "react-dom/client";
import {
  AverageRatingDisplay,
  Button,
  cn,
  FloatingButton,
  Input,
  Label,
  LoadingState,
  Panel,
  PanelContent,
  PanelFooter,
  PanelHeader,
  RatingDistribution,
  ReviewCard,
  StarRating,
  TabNavigation,
  Textarea,
} from "@/components";
import { useLocalizations, useReviewsWidget } from "@lylrv/hooks";
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
    shop: config.apiKey || config.shop || "",
    apiBaseUrl,
    type: "website",
  });

  const tabs = [
    { id: "reviews" as ReviewsTabs, label: t.reviews_tab_title || "Reviews" },
    { id: "write" as ReviewsTabs, label: t.write_review || "Write Review" },
  ];

  return (
    <div className="fixed left-0 bottom-1/2 z-9999">
      <FloatingButton
        onClick={handleToggle}
        icon={<StarIcon className="h-5 w-5" />}
        label={t.secondary_floating_button_title || "Reviews"}
        badge={meta?.total}
        className="pl-2 pr-4 -translate-4 rotate-90"
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
        <PanelHeader>
          <h2 className="font-semibold tracking-tight text-foreground text-lg">
            {t.reviews_system_header || "Customer Reviews"}
          </h2>
        </PanelHeader>

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as ReviewsTabs)}
        />

        <PanelContent className="flex-1 overflow-y-auto px-4 pb-4 pt-3">
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
        </PanelContent>

        <PanelFooter>
          <button
            type="button"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {t.need_help || "Need help?"}
          </button>
        </PanelFooter>
      </Panel>
    </div>
  );
}

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
    <div className="space-y-4">
      {meta && (
        <section className="grid grid-cols-[auto_1fr] items-center gap-3 py-1 max-sm:grid-cols-1">
          <AverageRatingDisplay
            avgRating={meta.averageRating}
            className="shrink-0"
          />
          <RatingDistribution
            distribution={meta.ratingDistribution}
            total={meta.total}
            className="flex-1 max-w-[230px] max-sm:max-w-full max-sm:w-full"
          />
        </section>
      )}

      {meta && (
        <p className="inline-flex items-center gap-1 rounded-full border bg-muted/30 px-3 py-1 text-[11px] font-medium text-muted-foreground">
          {meta.total} {t.total_reviews || "reviews"}
        </p>
      )}

      <div className="space-y-3 border-t pt-4">
        {reviews.length > 0 ? (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            {t.no_reviews || "No reviews yet. Be the first to review!"}
          </p>
        )}
      </div>

      {reviews.length > 0 && (
        <button
          type="button"
          className="w-full rounded-md border bg-background py-2 text-center text-sm font-medium text-foreground hover:bg-muted/40"
        >
          {t.view_all || "View All"}
        </button>
      )}
    </div>
  );
}

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
      <div className="rounded-lg border bg-card shadow-sm py-8 px-4 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          {t.sign_in || "Sign in"} to write a review
        </p>
        <Button fullWidth>{t.sign_in || "Sign In"}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4 shadow-sm">
      <div>
        <Label>{t.add_website_review || "Rate your experience"}</Label>
        <div className="mt-2">
          <StarRating
            rating={formData.rating}
            size="lg"
            interactive
            onRate={onRatingChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">
          {t.add_product_review_title || "Title"}
        </Label>
        <Input
          id="review-title"
          value={formData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          placeholder="Summary of your experience"
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="review-body">
          {t.add_website_review_body || "Your review"}
        </Label>
        <Textarea
          id="review-body"
          value={formData.body}
          onChange={(e) => onInputChange("body", e.target.value)}
          rows={4}
          placeholder="Tell us about your experience..."
          className="mt-1.5"
        />
      </div>

      <div>
        <Button fullWidth onClick={onSubmit} disabled={!canSubmit}>
          {isSubmitting ? "Submitting..." : t.write_review || "Submit Review"}
        </Button>
      </div>
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
      <ReviewsWidget config={config} apiBaseUrl={apiBaseUrl} />
    </WidgetProvider>,
  );
}

if (typeof window !== "undefined") {
  window.LylrvWidgets = window.LylrvWidgets || {};
  window.LylrvWidgets.reviews = { mount };
}
