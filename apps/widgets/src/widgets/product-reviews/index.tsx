import { createRoot } from "react-dom/client";
import {
	Button,
	Input,
	Label,
	LoadingState,
	RatingDistribution,
	ReviewCard,
	StarRating,
	TabNavigation,
	Textarea,
} from "../../components";
import { CameraIcon, QuestionIcon } from "../../components/icons";
import { useProductReviewsWidget } from "../../hooks";
import { WidgetProvider } from "../../providers";
import type { WidgetConfig } from "../../types";
import type { ReviewsTab } from "../../types/reviews.types";
import styles from "./styles.css?inline";

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
		theme,
		isLoggedIn,
		hasPurchased,
		reviewPoints,
		reviewWithImagesPoints,
		activeTab,
		setActiveTab,
		reviews,
		meta,
		isLoading,
		imageViewerOpen,
		setImageViewerOpen,
		formData,
		imageFiles,
		handleRatingChange,
		handleInputChange,
		handleAddImages,
		handleRemoveImage,
		handleSubmit,
		canSubmit,
		isSubmitting,
	} = useProductReviewsWidget(config, {
		shop: config.shop || "",
		productId: productId,
		apiBaseUrl,
	});

	const tabs = [
		{
			id: "reviews" as ReviewsTab,
			label: `${t.reviews_tab_title || "Reviews"} ${meta ? `(${meta.total})` : ""}`,
		},
		{
			id: "questions" as ReviewsTab,
			label: t.questions_tab_title || "Questions",
		},
	];

	return (
		<div className="w-full" style={{ direction: theme.isRTL ? "rtl" : "ltr" }}>
			{/* Header Summary */}
			<div className="mb-4 flex items-center justify-between rounded-lg border border-border bg-card p-4">
				<div className="flex items-center gap-4">
					{meta && (
						<>
							<div className="text-center">
								<p className="text-3xl font-bold text-primary">
									{meta.averageRating.toFixed(1)}
								</p>
								<StarRating rating={Math.round(meta.averageRating)} size="sm" />
							</div>
							<div className="border-l border-border pl-4">
								<p className="text-sm text-muted-foreground">
									{meta.total} {t.total_reviews || "reviews"}
								</p>
								<div className="mt-1">
									<RatingDistribution
										distribution={meta.ratingDistribution}
										total={meta.total}
									/>
								</div>
							</div>
						</>
					)}
				</div>
				<Button onClick={() => setActiveTab("write")}>
					{t.write_review || "Write Review"}
				</Button>
			</div>

			{/* Tabs */}
			<TabNavigation
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={(id) => setActiveTab(id as ReviewsTab | "questions")}
			/>

			{/* Content */}
			<div className="mt-4">
				{isLoading ? (
					<LoadingState />
				) : activeTab === "reviews" ? (
					<ReviewsList
						reviews={reviews}
						t={t}
						onWriteClick={() => setActiveTab("write")}
						onImageClick={setImageViewerOpen}
					/>
				) : activeTab === "questions" ? (
					<QuestionsTab t={t} />
				) : (
					<WriteReviewForm
						t={t}
						isLoggedIn={isLoggedIn}
						hasPurchased={hasPurchased}
						reviewPoints={reviewPoints}
						reviewWithImagesPoints={reviewWithImagesPoints}
						formData={formData}
						imageFiles={imageFiles}
						canSubmit={canSubmit}
						isSubmitting={isSubmitting}
						onRatingChange={handleRatingChange}
						onInputChange={handleInputChange}
						onAddImages={handleAddImages}
						onRemoveImage={handleRemoveImage}
						onSubmit={handleSubmit}
						onCancel={() => setActiveTab("reviews")}
					/>
				)}
			</div>

			{/* Image Viewer Modal */}
			{imageViewerOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
					onClick={() => setImageViewerOpen(null)}
				>
					<img
						src={imageViewerOpen}
						alt=""
						className="max-h-full max-w-full rounded-lg"
					/>
				</div>
			)}
		</div>
	);
}

interface ReviewsListProps {
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
	t: Record<string, string>;
	onWriteClick: () => void;
	onImageClick: (url: string) => void;
}

function ReviewsList({
	reviews,
	t,
	onWriteClick,
	onImageClick,
}: ReviewsListProps) {
	if (reviews.length === 0) {
		return (
			<div className="py-8 text-center">
				<p className="text-muted-foreground">
					No reviews yet for this product.
				</p>
				<button
					type="button"
					onClick={onWriteClick}
					className="mt-3 text-sm font-medium text-primary"
				>
					Be the first to review →
				</button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{reviews.map((review) => (
				<ReviewCard
					key={review.id}
					review={review}
					onImageClick={onImageClick}
				/>
			))}
		</div>
	);
}

interface QuestionsTabProps {
	t: Record<string, string>;
}

function QuestionsTab({ t }: QuestionsTabProps) {
	return (
		<div className="py-8 text-center">
			<QuestionIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/50" />
			<p className="mb-3 text-muted-foreground">
				{t.add_question_body || "Have a question about this product?"}
			</p>
			<Button>{t.add_question || "Ask a Question"}</Button>
		</div>
	);
}

interface WriteReviewFormProps {
	t: Record<string, string>;
	isLoggedIn: boolean;
	hasPurchased: boolean;
	reviewPoints: number;
	reviewWithImagesPoints: number;
	formData: { rating: number; title: string; body: string };
	imageFiles: File[];
	canSubmit: boolean;
	isSubmitting: boolean;
	onRatingChange: (rating: number) => void;
	onInputChange: (field: "title" | "body", value: string) => void;
	onAddImages: (files: FileList | null) => void;
	onRemoveImage: (index: number) => void;
	onSubmit: () => void;
	onCancel: () => void;
}

function WriteReviewForm({
	t,
	isLoggedIn,
	hasPurchased,
	reviewPoints,
	reviewWithImagesPoints,
	formData,
	imageFiles,
	canSubmit,
	isSubmitting,
	onRatingChange,
	onInputChange,
	onAddImages,
	onRemoveImage,
	onSubmit,
	onCancel,
}: WriteReviewFormProps) {
	if (!isLoggedIn) {
		return (
			<div className="rounded-lg border border-border bg-card p-6 text-center">
				<p className="mb-4 text-sm text-muted-foreground">
					{t.sign_in || "Sign in"} to write a review
				</p>
				<Button>{t.sign_in || "Sign In"}</Button>
			</div>
		);
	}

	if (!hasPurchased) {
		return (
			<div className="rounded-lg border border-border bg-card p-6 text-center">
				<p className="text-sm text-muted-foreground">
					Only verified purchasers can write reviews.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4 rounded-lg border border-border bg-card p-4">
			<h3 className="font-semibold text-foreground">
				{t.add_product_review_page_title || "Write a Product Review"}
			</h3>

			{/* Points earned message */}
			<div className="rounded-lg bg-primary/10 p-3 text-sm text-primary">
				⭐ {t.you_will_gain || "You'll earn"}{" "}
				<strong>
					{reviewPoints}-{reviewWithImagesPoints}
				</strong>{" "}
				{t.points || "points"}!
			</div>

			<div>
				<Label>Rating *</Label>
				<div className="mt-1">
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
					{t.add_product_review_title || "Review Title"}
				</Label>
				<Input
					id="review-title"
					value={formData.title}
					onChange={(e) => onInputChange("title", e.target.value)}
					placeholder="Summarize your experience"
				/>
			</div>

			<div>
				<Label htmlFor="review-body">
					{t.add_product_review_body || "Your Review"}
				</Label>
				<Textarea
					id="review-body"
					value={formData.body}
					onChange={(e) => onInputChange("body", e.target.value)}
					rows={4}
					placeholder="Tell others about your experience with this product..."
				/>
			</div>

			<div>
				<Label>
					{t.add_product_review_images || "Add Photos"} (+
					{reviewWithImagesPoints - reviewPoints} pts)
				</Label>
				<div className="mt-1 flex flex-wrap items-center gap-2">
					<label className="flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-3 text-center transition-colors hover:border-primary hover:bg-accent">
						<input
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={(e) => onAddImages(e.target.files)}
						/>
						<CameraIcon className="h-5 w-5 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">Add Photos</span>
					</label>
					{imageFiles.map((file, i) => (
						<div key={i} className="relative h-14 w-14">
							<img
								src={URL.createObjectURL(file)}
								alt=""
								className="h-full w-full rounded-lg object-cover"
							/>
							<button
								type="button"
								onClick={() => onRemoveImage(i)}
								className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground"
							>
								✕
							</button>
						</div>
					))}
				</div>
			</div>

			<div className="flex gap-2">
				<Button variant="outline" onClick={onCancel} className="flex-1">
					Cancel
				</Button>
				<Button onClick={onSubmit} disabled={!canSubmit} className="flex-1">
					{isSubmitting ? "..." : t.write_review || "Submit Review"}
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

	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	shadowRoot.appendChild(styleElement);

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
