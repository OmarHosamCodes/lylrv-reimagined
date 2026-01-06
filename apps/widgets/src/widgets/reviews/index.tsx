import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { WidgetConfig } from "../../types";
import styles from "./styles.css?inline";

interface ReviewsAppProps {
	config: WidgetConfig;
	apiBaseUrl: string;
}

interface Review {
	id: string;
	author: string;
	rating: number;
	title: string | null;
	body: string | null;
	images: string[] | null;
	verified: boolean;
	createdAt: string;
	type: string;
}

interface ReviewsMeta {
	total: number;
	averageRating: number;
	ratingDistribution: number[];
}

// Helper to get localized text
function useLocalizations(config: WidgetConfig) {
	return useMemo(() => {
		const locale = config.clientConfig?.language?.local || "en";
		const localizations = config.clientConfig?.localizations || {};
		return localizations[locale] || localizations["en"] || {};
	}, [config]);
}

function StarRating({
	rating,
	size = "sm",
}: {
	rating: number;
	size?: "sm" | "md" | "lg";
}) {
	const sizeClass =
		size === "lg" ? "h-5 w-5" : size === "md" ? "h-4 w-4" : "h-3 w-3";
	return (
		<div className="flex">
			{[1, 2, 3, 4, 5].map((star) => (
				<svg
					key={star}
					className={`${sizeClass} ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
					fill="currentColor"
					viewBox="0 0 20 20"
				>
					<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
				</svg>
			))}
		</div>
	);
}

function RatingBar({
	count,
	total,
	rating,
	color,
}: {
	count: number;
	total: number;
	rating: number;
	color: string;
}) {
	const percentage = total > 0 ? (count / total) * 100 : 0;
	return (
		<div className="flex items-center gap-2 text-xs">
			<span className="w-3">{rating}</span>
			<div className="h-2 flex-1 rounded-full bg-gray-200">
				<div
					className="h-full rounded-full transition-all"
					style={{ width: `${percentage}%`, backgroundColor: color }}
				/>
			</div>
			<span className="w-6 text-gray-500">{count}</span>
		</div>
	);
}

function ReviewsApp({ config, apiBaseUrl }: ReviewsAppProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"reviews" | "write">("reviews");
	const [reviews, setReviews] = useState<Review[]>([]);
	const [meta, setMeta] = useState<ReviewsMeta | null>(null);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({ rating: 0, title: "", body: "" });

	const t = useLocalizations(config);
	const theme = config.clientConfig?.theme;
	const primaryColor =
		theme?.buttonBackgroundColor || config.styles.primaryColor;
	const textColor = theme?.buttonTextColor || "#ffffff";
	const isRTL = config.clientConfig?.language?.direction === "rtl";
	const isLoggedIn = config.user?.isLoggedIn || false;

	// Fetch reviews
	useEffect(() => {
		if (isOpen) {
			setLoading(true);
			const shop = config.clientId || "";
			fetch(
				`${apiBaseUrl}/api/widget/reviews?shop=${encodeURIComponent(shop)}&type=website&limit=10`,
			)
				.then((res) => res.json())
				.then((data) => {
					setReviews(data.reviews || []);
					setMeta(data.meta || null);
				})
				.catch((err) => console.error("[Lylrv] Reviews fetch error:", err))
				.finally(() => setLoading(false));
		}
	}, [isOpen, apiBaseUrl, config.clientId]);

	const formatDate = (date: string) => {
		const d = new Date(date);
		const now = new Date();
		const diff = Math.floor(
			(now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
		);
		if (diff === 0) return "Today";
		if (diff === 1) return "Yesterday";
		if (diff < 7) return `${diff} days ago`;
		if (diff < 30) return `${Math.floor(diff / 7)} weeks ago`;
		return d.toLocaleDateString();
	};

	return (
		<div style={{ direction: isRTL ? "rtl" : "ltr" }}>
			{/* Floating Action Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
				style={{ backgroundColor: primaryColor }}
				aria-label={t.secondary_floating_button_title || "Reviews"}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill={textColor}
					className="h-7 w-7"
				>
					<path
						fillRule="evenodd"
						d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{/* Panel */}
			{isOpen && (
				<div
					className="absolute bottom-16 w-80 overflow-hidden rounded-xl bg-white shadow-2xl"
					style={{ [isRTL ? "left" : "right"]: 0 }}
				>
					{/* Header */}
					<div
						className="p-4"
						style={{ backgroundColor: primaryColor, color: textColor }}
					>
						<h2 className="text-lg font-semibold">
							{t.reviews_system_header || "Customer Reviews"}
						</h2>
						{meta && (
							<div className="mt-2 flex items-center gap-2">
								<span className="text-2xl font-bold">{meta.averageRating}</span>
								<div>
									<StarRating
										rating={Math.round(meta.averageRating)}
										size="md"
									/>
									<p className="text-xs opacity-90">
										{meta.total} {t.total_reviews || "reviews"}
									</p>
								</div>
							</div>
						)}
					</div>

					{/* Tabs */}
					<div className="flex border-b">
						<button
							onClick={() => setActiveTab("reviews")}
							className={`flex-1 py-2 text-sm font-medium transition-colors ${
								activeTab === "reviews" ? "border-b-2" : "text-gray-500"
							}`}
							style={
								activeTab === "reviews"
									? { borderColor: primaryColor, color: primaryColor }
									: {}
							}
						>
							{t.reviews_tab_title || "Reviews"}
						</button>
						<button
							onClick={() => setActiveTab("write")}
							className={`flex-1 py-2 text-sm font-medium transition-colors ${
								activeTab === "write" ? "border-b-2" : "text-gray-500"
							}`}
							style={
								activeTab === "write"
									? { borderColor: primaryColor, color: primaryColor }
									: {}
							}
						>
							{t.write_review || "Write Review"}
						</button>
					</div>

					{/* Content */}
					<div className="max-h-80 overflow-y-auto p-4">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div
									className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300"
									style={{ borderTopColor: primaryColor }}
								/>
							</div>
						) : activeTab === "reviews" ? (
							<div className="space-y-4">
								{/* Rating Distribution */}
								{meta && (
									<div className="space-y-1">
										{[5, 4, 3, 2, 1].map((rating) => (
											<RatingBar
												key={rating}
												rating={rating}
												count={meta.ratingDistribution[rating - 1] || 0}
												total={meta.total}
												color={primaryColor}
											/>
										))}
									</div>
								)}

								{/* Reviews List */}
								<div className="space-y-3 border-t pt-3">
									{reviews.length > 0 ? (
										reviews.map((review) => (
											<div
												key={review.id}
												className="rounded-lg bg-gray-50 p-3"
											>
												<div className="mb-1 flex items-center justify-between">
													<StarRating rating={review.rating} />
													{review.verified && (
														<span className="text-xs text-green-600">
															✓ Verified
														</span>
													)}
												</div>
												{review.title && (
													<p className="font-medium text-gray-800">
														{review.title}
													</p>
												)}
												{review.body && (
													<p className="text-sm text-gray-600">{review.body}</p>
												)}
												{review.images && review.images.length > 0 && (
													<div className="mt-2 flex gap-1">
														{review.images.slice(0, 3).map((img, i) => (
															<img
																key={i}
																src={img}
																alt=""
																className="h-12 w-12 rounded object-cover"
															/>
														))}
													</div>
												)}
												<div className="mt-2 flex items-center justify-between text-xs text-gray-500">
													<span>{review.author}</span>
													<span>{formatDate(review.createdAt)}</span>
												</div>
											</div>
										))
									) : (
										<p className="text-center text-sm text-gray-500 py-4">
											No reviews yet. Be the first to review!
										</p>
									)}
								</div>

								{reviews.length > 0 && (
									<button
										className="w-full text-center text-sm font-medium"
										style={{ color: primaryColor }}
									>
										{t.view_all || "View All"} →
									</button>
								)}
							</div>
						) : (
							/* Write Review Tab */
							<div className="space-y-4">
								{!isLoggedIn ? (
									<div className="text-center py-4">
										<p className="text-sm text-gray-600 mb-4">
											{t.sign_in || "Sign in"} to write a review
										</p>
										<button
											className="w-full rounded-lg py-3 text-sm font-medium text-white"
											style={{ backgroundColor: primaryColor }}
										>
											{t.sign_in || "Sign In"}
										</button>
									</div>
								) : (
									<>
										<div>
											<label className="mb-2 block text-sm font-medium text-gray-700">
												{t.add_website_review || "Rate your experience"}
											</label>
											<div className="flex gap-1">
												{[1, 2, 3, 4, 5].map((star) => (
													<button
														key={star}
														onClick={() =>
															setFormData((prev) => ({ ...prev, rating: star }))
														}
														className="h-8 w-8"
													>
														<svg
															className={`h-8 w-8 ${star <= formData.rating ? "text-yellow-400" : "text-gray-300"} transition-colors hover:text-yellow-300`}
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
														</svg>
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="mb-1 block text-sm font-medium text-gray-700">
												{t.add_product_review_title || "Title"}
											</label>
											<input
												type="text"
												value={formData.title}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														title: e.target.value,
													}))
												}
												className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
												style={{ focusRingColor: primaryColor } as any}
												placeholder="Summary of your experience"
											/>
										</div>

										<div>
											<label className="mb-1 block text-sm font-medium text-gray-700">
												{t.add_website_review_body || "Your review"}
											</label>
											<textarea
												value={formData.body}
												onChange={(e) =>
													setFormData((prev) => ({
														...prev,
														body: e.target.value,
													}))
												}
												className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
												rows={4}
												placeholder="Tell us about your experience..."
											/>
										</div>

										<button
											className="w-full rounded-lg py-3 text-sm font-medium text-white disabled:opacity-50"
											style={{ backgroundColor: primaryColor }}
											disabled={formData.rating === 0}
										>
											{t.write_review || "Submit Review"}
										</button>
									</>
								)}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="border-t p-2 text-center">
						<button className="text-xs text-gray-400 hover:text-gray-600">
							{t.need_help || "Need help?"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

// Mount function exposed to the loader
export function mount(container: HTMLElement, config: WidgetConfig) {
	const shadow = container.attachShadow({ mode: "open" });

	const styleTag = document.createElement("style");
	styleTag.textContent = styles;
	shadow.appendChild(styleTag);

	const root = document.createElement("div");
	root.className = "relative";
	shadow.appendChild(root);

	const scripts = document.querySelectorAll('script[src*="loader"]');
	let apiBaseUrl = window.location.origin;
	if (scripts.length > 0) {
		const scriptUrl = new URL((scripts[0] as HTMLScriptElement).src);
		apiBaseUrl = scriptUrl.origin;
	}

	createRoot(root).render(
		<ReviewsApp config={config} apiBaseUrl={apiBaseUrl} />,
	);
}

// Register with global namespace for loader
if (typeof window !== "undefined") {
	(window as any).LylrvWidgets = (window as any).LylrvWidgets || {};
	(window as any).LylrvWidgets.reviews = { mount };
}
