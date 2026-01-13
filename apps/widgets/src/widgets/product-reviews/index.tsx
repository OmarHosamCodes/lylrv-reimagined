import { useProductReviewsWidget } from "@/hooks";
import { WidgetProvider } from "@/providers";
import stylesText from "@/styles.css?inline";
import type { WidgetConfig } from "@/types";
import { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
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

	// Guard: only render on product pages
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

	// Local state for form display (independent of tabs)
	const [formMode, setFormMode] = useState<"none" | "review" | "question">(
		"none",
	);

	// Derived data for images
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
		// Note: Question submission logic is not yet available in the hook.
		// We would call an API here.
		setFormMode("none");
	};

	// Close form on review submit
	const onReviewSubmitWrapper = async () => {
		await handleSubmit();
		setFormMode("none");
	};

	return (
		<div
			className="w-full space-y-6 bg-transparent"
			style={{ direction: widgetTheme.isRTL ? "rtl" : "ltr" }}
		>
			<ProductReviewsHeader
				avgRating={meta?.averageRating || 0}
				totalReviews={meta?.total || 0}
				t={t}
				theme={widgetTheme}
				isReviewsContainImages={reviewsContainImages}
				allReviewsImages={allReviewsImages}
				onToggleReviewForm={handleToggleReviewForm}
				onToggleQuestionForm={handleToggleQuestionForm}
			/>

			<FormDisplay
				showForm={formMode === "none" ? null : formMode}
				t={t}
				isLoggedIn={isLoggedIn}
				hasPurchased={hasPurchased}
				hasUserAlreadyReviewed={false} // Hook doesn't expose this yet? 'user' in config might have it? Reference hook had it.
				// Target hook returns hasPurchased, but maybe not hasReviewed. We'll default false or check reviews.
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

			<ProductReviewsTabs
				reviews={reviews}
				questions={[]} // Questions data not yet available from hook
				t={t}
				onImageClick={setImageViewerOpen}
				onWriteReview={handleToggleReviewForm}
			/>
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
