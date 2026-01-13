import { cn } from "@lylrv/ui";
import { createRoot } from "react-dom/client";
import {
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
import {
	useLocalizations,
	useReviewsWidget,
	useWidgetTheme,
} from "../../hooks";
import { WidgetProvider } from "../../providers";
import type { WidgetConfig } from "../../types";
import type { ReviewsTabs } from "../../types/reviews.types";
import styles from "./styles.css?inline";

interface ReviewsWidgetProps {
	config: WidgetConfig;
	apiBaseUrl: string;
}

function ReviewsWidget({ config, apiBaseUrl }: ReviewsWidgetProps) {
	const t = useLocalizations(config);
	const theme = useWidgetTheme(config);
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
				position={theme.position}
				isRTL={theme.isRTL}
				className={cn(
					"z-10002 flex flex-col gap-4",
					"w-3xl h-[600px] max-sm:w-screen max-sm:h-screen max-sm:min-w-full max-sm:max-w-lg",
					"p-0 box-border overflow-hidden",
					"bg-background border-none shadow-lg rounded-none sm:rounded-lg",
					"duration-1000 data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
				)}
			>
				<PanelHeader>
					<h2 className="text-lg font-semibold">
						{t.reviews_system_header || "Customer Reviews"}
					</h2>
					{meta && (
						<div className="mt-2 flex items-center justify-center gap-2">
							<span className="text-2xl font-bold">
								{meta.averageRating.toFixed(1)}
							</span>
							<div className="text-left">
								<StarRating rating={Math.round(meta.averageRating)} size="md" />
								<p className="text-xs opacity-90">
									{meta.total} {t.total_reviews || "reviews"}
								</p>
							</div>
						</div>
					)}
				</PanelHeader>

				<TabNavigation
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={(id) => setActiveTab(id as ReviewsTabs)}
				/>

				<PanelContent>
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
						className="text-xs text-muted-foreground hover:text-foreground"
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
				<RatingDistribution
					distribution={meta.ratingDistribution}
					total={meta.total}
				/>
			)}

			<div className="space-y-3 border-t border-border pt-3">
				{reviews.length > 0 ? (
					reviews.map((review) => (
						<ReviewCard key={review.id} review={review} />
					))
				) : (
					<p className="py-4 text-center text-sm text-muted-foreground">
						No reviews yet. Be the first to review!
					</p>
				)}
			</div>

			{reviews.length > 0 && (
				<button
					type="button"
					className="w-full text-center text-sm font-medium text-primary"
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
			<div className="py-4 text-center">
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

	const styleElement = document.createElement("style");
	styleElement.textContent = styles;
	shadowRoot.appendChild(styleElement);

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
