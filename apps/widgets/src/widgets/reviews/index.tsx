import { cn } from "@lylrv/ui";
import { createRoot } from "react-dom/client";
import {
	AverageRatingDisplay,
	Button,
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
} from "../../components";
import { StarFilledIcon } from "../../components/icons";
import { useLocalizations, useReviewsWidget } from "../../hooks";
import { WidgetProvider } from "../../providers";
import stylesText from "../../styles.css?inline";
import type { WidgetConfig } from "../../types";
import type { ReviewsTabs } from "../../types/reviews.types";

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
		<div className="fixed bottom-4 right-20 z-9999">
			{/* Floating Button with Star Icon and Review Count Badge */}
			<FloatingButton
				onClick={handleToggle}
				icon={<StarFilledIcon className="h-7 w-7" />}
				label={t.secondary_floating_button_title || "Reviews"}
				badge={meta?.total}
			/>

			<Panel
				isOpen={isOpen}
				onClose={handleToggle}
				className={cn(
					"z-10002 flex flex-col",
					"w-3xl h-[600px] max-sm:w-screen max-sm:h-screen max-sm:min-w-full max-sm:max-w-lg",
					"p-0 box-border overflow-hidden",
					"bg-background border-none shadow-lg rounded-none sm:rounded-lg",
					"duration-300",
				)}
			>
				<PanelHeader>
					<h2 className="text-lg font-semibold">
						{t.reviews_system_header || "Customer Reviews"}
					</h2>
				</PanelHeader>

				<TabNavigation
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={(id) => setActiveTab(id as ReviewsTabs)}
				/>

				<PanelContent className="flex-1 overflow-y-auto">
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
						className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
			{/* Rating Summary Section: Average + Distribution side by side */}
			{meta && (
				<section className="flex flex-row items-center justify-center gap-6 py-2 max-sm:flex-col max-sm:gap-4">
					{/* Average Rating Display */}
					<AverageRatingDisplay
						avgRating={meta.averageRating}
						className="flex-shrink-0"
					/>
					{/* Rating Distribution Bars */}
					<RatingDistribution
						distribution={meta.ratingDistribution}
						total={meta.total}
						className="flex-1 max-w-[200px] max-sm:max-w-full max-sm:w-full"
					/>
				</section>
			)}

			{/* Review Count */}
			{meta && (
				<p className="text-center text-sm text-muted-foreground">
					{meta.total} {t.total_reviews || "reviews"}
				</p>
			)}

			{/* Reviews List */}
			<div className="space-y-3 border-t border-border pt-4">
				{reviews.length > 0 ? (
					reviews.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))
				) : (
					<p className="py-8 text-center text-sm text-muted-foreground">
						{t.no_reviews || "No reviews yet. Be the first to review!"}
					</p>
				)}
			</div>

			{/* View All Button */}
			{reviews.length > 0 && (
				<button
					type="button"
					className="w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2"
				>
					{t.view_all || "View All"} →
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
			<div className="py-8 text-center">
				<p className="mb-4 text-sm text-muted-foreground">
					{t.sign_in || "Sign in"} to write a review
				</p>
				<Button fullWidth>{t.sign_in || "Sign In"}</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
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
				/>
			</div>

			<Button fullWidth onClick={onSubmit} disabled={!canSubmit}>
				{isSubmitting ? "..." : t.write_review || "Submit Review"}
			</Button>
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
