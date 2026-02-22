import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { useProductReviewsWidget } from "@/hooks";
import { transitions } from "@/lib/transitions";
import { WidgetProvider } from "@/providers";
import stylesText from "@/styles.css?inline";
import type { WidgetConfig } from "@/types";
import { FormDisplay } from "./components/FormDisplay";
import { ProductReviewsHeader } from "./components/ProductReviewsHeader";
import { ProductReviewsTabs } from "./components/ProductReviewsTabs";
import { getAllReviewsImages, hasReviewImages } from "./components/utils";

interface ProductReviewsWidgetProps {
  config: WidgetConfig;
  apiBaseUrl: string;
}

function ProductReviewsWidget({
  config,
  apiBaseUrl,
}: ProductReviewsWidgetProps) {
  const productId = config.context?.product?.id;

  if (!productId) {
    return null;
  }

  const {
    t,
    theme: widgetTheme,
    isLoggedIn,
    hasPurchased,
    reviewPoints,
    reviewWithImagesPoints,
    reviews,
    meta,
    formData,
    handleRatingChange,
    handleInputChange,
    handleAddImages,
    handleRemoveImage,
    handleSubmit,
    canSubmit,
    isSubmitting,
    setImageViewerOpen,
  } = useProductReviewsWidget(config, {
    shop: config.shop || "",
    productId: productId,
    apiBaseUrl,
  });

  const [formMode, setFormMode] = useState<"none" | "review" | "question">(
    "none",
  );

  const allReviewsImages = useMemo(
    () => getAllReviewsImages(reviews),
    [reviews],
  );
  const reviewsContainImages = useMemo(
    () => hasReviewImages(reviews),
    [reviews],
  );

  const handleToggleReviewForm = () => {
    setFormMode((prev) => (prev === "review" ? "none" : "review"));
  };

  const handleToggleQuestionForm = () => {
    setFormMode((prev) => (prev === "question" ? "none" : "question"));
  };

  const handleQuestionSubmit = (body: string) => {
    console.log("Question submitted:", body);
    setFormMode("none");
  };

  const onReviewSubmitWrapper = async () => {
    await handleSubmit();
    setFormMode("none");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transitions.slowReveal}
      className="ly-widget-shell w-full space-y-6 p-4 sm:p-6"
      style={{ direction: widgetTheme.isRTL ? "rtl" : "ltr" }}
    >
      <ProductReviewsHeader
        avgRating={meta?.averageRating || 0}
        totalReviews={meta?.total || 0}
        t={t}
        isReviewsContainImages={reviewsContainImages}
        allReviewsImages={allReviewsImages}
        onToggleReviewForm={handleToggleReviewForm}
        onToggleQuestionForm={handleToggleQuestionForm}
      />

      <AnimatePresence mode="wait">
        {formMode !== "none" && (
          <motion.div
            key={formMode}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={transitions.spring}
            className="overflow-hidden"
          >
            <FormDisplay
              showForm={formMode}
              t={t}
              isLoggedIn={isLoggedIn}
              hasPurchased={hasPurchased}
              hasUserAlreadyReviewed={false}
              reviewPoints={reviewPoints}
              reviewWithImagesPoints={reviewWithImagesPoints}
              formData={formData}
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              onRatingChange={handleRatingChange}
              onInputChange={handleInputChange}
              onAddImages={handleAddImages}
              onRemoveImage={handleRemoveImage}
              onSubmitReview={onReviewSubmitWrapper}
              onCancel={() => setFormMode("none")}
              onSubmitQuestion={handleQuestionSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <ProductReviewsTabs
        reviews={reviews}
        questions={[]}
        t={t}
        onImageClick={setImageViewerOpen}
        onWriteReview={handleToggleReviewForm}
      />
    </motion.div>
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
  mountPoint.className = "w-full";
  shadowRoot.appendChild(mountPoint);

  const root = createRoot(mountPoint);
  root.render(
    <WidgetProvider config={config} apiBaseUrl={apiBaseUrl}>
      <ProductReviewsWidget config={config} apiBaseUrl={apiBaseUrl} />
    </WidgetProvider>,
  );
}

if (typeof window !== "undefined") {
  window.LylrvWidgets = window.LylrvWidgets || {};
  window.LylrvWidgets["product-reviews"] = { mount };
}
