import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { WidgetConfig } from "../../types";
import styles from "./styles.css?inline";

interface ProductReviewsAppProps {
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
	interactive,
	onRate,
}: {
	rating: number;
	size?: "sm" | "md" | "lg";
	interactive?: boolean;
	onRate?: (rating: number) => void;
}) {
	const sizeClass =
		size === "lg" ? "h-6 w-6" : size === "md" ? "h-5 w-5" : "h-4 w-4";
	return (
		<div className="flex">
			{[1, 2, 3, 4, 5].map((star) => (
				<button
					key={star}
					type="button"
					onClick={() => interactive && onRate?.(star)}
					disabled={!interactive}
					className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
				>
					<svg
						className={`${sizeClass} ${star <= rating ? "text-yellow-400" : "text-gray-300"} transition-colors`}
						fill="currentColor"
						viewBox="0 0 20 20"
					>
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
					</svg>
				</button>
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

function ProductReviewsApp({ config, apiBaseUrl }: ProductReviewsAppProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [activeTab, setActiveTab] = useState<"reviews" | "questions" | "write">(
		"reviews",
	);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [meta, setMeta] = useState<ReviewsMeta | null>(null);
	const [loading, setLoading] = useState(false);
	const [imageViewerOpen, setImageViewerOpen] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		rating: 0,
		title: "",
		body: "",
		images: [] as File[],
	});

	const t = useLocalizations(config);
	const theme = config.clientConfig?.theme;
	const primaryColor =
		theme?.buttonBackgroundColor || config.styles.primaryColor;
	const textColor = theme?.buttonTextColor || "#ffffff";
	const isRTL = config.clientConfig?.language?.direction === "rtl";
	const isLoggedIn = config.user?.isLoggedIn || false;
	const productId = config.context?.product?.id;
	const hasPurchased = config.context?.product?.hasPurchased || false;

	// Fetch product reviews
	useEffect(() => {
		if (isOpen && productId) {
			setLoading(true);
			const shop = config.clientId || "";
			fetch(
				`${apiBaseUrl}/api/widget/reviews?shop=${encodeURIComponent(shop)}&productId=${productId}&limit=10`,
			)
				.then((res) => res.json())
				.then((data) => {
					setReviews(data.reviews || []);
					setMeta(data.meta || null);
				})
				.catch((err) =>
					console.error("[Lylrv] Product reviews fetch error:", err),
				)
				.finally(() => setLoading(false));
		}
	}, [isOpen, apiBaseUrl, config.clientId, productId]);

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

	// Get interaction points for reviews
	const getReviewPoints = () => {
		const interactions = config.clientConfig?.interactions || [];
		const reviewInteraction = interactions.find((i) => i.trigger === "review");
		return reviewInteraction?.pointsGained || 50;
	};

	const getReviewWithImagesPoints = () => {
		const interactions = config.clientConfig?.interactions || [];
		const interaction = interactions.find((i) => i.trigger === "reviewImgs");
		return interaction?.pointsGained || 100;
	};

	return (
		<div style={{ direction: isRTL ? "rtl" : "ltr" }}>
			{/* This widget is inline, no floating button */}
			<div className="w-full">
				{/* Header Summary */}
				<div className="mb-4 flex items-center justify-between rounded-lg border p-4">
					<div className="flex items-center gap-4">
						{meta && (
							<>
								<div className="text-center">
									<p
										className="text-3xl font-bold"
										style={{ color: primaryColor }}
									>
										{meta.averageRating}
									</p>
									<StarRating
										rating={Math.round(meta.averageRating)}
										size="sm"
									/>
								</div>
								<div className="border-l pl-4">
									<p className="text-sm text-gray-600">
										{meta.total} {t.total_reviews || "reviews"}
									</p>
									<div className="mt-1 space-y-0.5">
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
								</div>
							</>
						)}
					</div>
					<button
						onClick={() => setActiveTab("write")}
						className="rounded-lg px-4 py-2 text-sm font-medium text-white"
						style={{ backgroundColor: primaryColor }}
					>
						{t.write_review || "Write Review"}
					</button>
				</div>

				{/* Tabs */}
				<div className="mb-4 flex border-b">
					<button
						onClick={() => setActiveTab("reviews")}
						className={`px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === "reviews" ? "border-b-2" : "text-gray-500"
						}`}
						style={
							activeTab === "reviews"
								? { borderColor: primaryColor, color: primaryColor }
								: {}
						}
					>
						{t.reviews_tab_title || "Reviews"} {meta ? `(${meta.total})` : ""}
					</button>
					<button
						onClick={() => setActiveTab("questions")}
						className={`px-4 py-2 text-sm font-medium transition-colors ${
							activeTab === "questions" ? "border-b-2" : "text-gray-500"
						}`}
						style={
							activeTab === "questions"
								? { borderColor: primaryColor, color: primaryColor }
								: {}
						}
					>
						{t.questions_tab_title || "Questions"}
					</button>
				</div>

				{/* Content */}
				{loading ? (
					<div className="flex items-center justify-center py-8">
						<div
							className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300"
							style={{ borderTopColor: primaryColor }}
						/>
					</div>
				) : activeTab === "reviews" ? (
					<div className="space-y-4">
						{reviews.length > 0 ? (
							reviews.map((review) => (
								<div key={review.id} className="rounded-lg border p-4">
									<div className="mb-2 flex items-start justify-between">
										<div>
											<StarRating rating={review.rating} size="md" />
											{review.title && (
												<p className="mt-1 font-semibold text-gray-800">
													{review.title}
												</p>
											)}
										</div>
										{review.verified && (
											<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
												✓ Verified Purchase
											</span>
										)}
									</div>

									{review.body && (
										<p className="text-sm text-gray-600">{review.body}</p>
									)}

									{review.images && review.images.length > 0 && (
										<div className="mt-3 flex gap-2">
											{review.images.map((img, i) => (
												<button
													key={i}
													onClick={() => setImageViewerOpen(img)}
													className="h-16 w-16 overflow-hidden rounded-lg border hover:opacity-80"
												>
													<img
														src={img}
														alt=""
														className="h-full w-full object-cover"
													/>
												</button>
											))}
										</div>
									)}

									<div className="mt-3 flex items-center justify-between border-t pt-2 text-xs text-gray-500">
										<span>{review.author}</span>
										<span>{formatDate(review.createdAt)}</span>
									</div>
								</div>
							))
						) : (
							<div className="py-8 text-center">
								<p className="text-gray-500">
									No reviews yet for this product.
								</p>
								<button
									onClick={() => setActiveTab("write")}
									className="mt-3 text-sm font-medium"
									style={{ color: primaryColor }}
								>
									Be the first to review →
								</button>
							</div>
						)}
					</div>
				) : activeTab === "questions" ? (
					<div className="py-8 text-center">
						<p className="text-gray-500 mb-3">
							{t.add_question_body || "Have a question about this product?"}
						</p>
						<button
							className="rounded-lg px-4 py-2 text-sm font-medium text-white"
							style={{ backgroundColor: primaryColor }}
						>
							{t.add_question || "Ask a Question"}
						</button>
					</div>
				) : (
					/* Write Review Form */
					<div className="rounded-lg border p-4">
						{!isLoggedIn ? (
							<div className="py-4 text-center">
								<p className="mb-4 text-sm text-gray-600">
									{t.sign_in || "Sign in"} to write a review
								</p>
								<button
									className="rounded-lg px-6 py-2 text-sm font-medium text-white"
									style={{ backgroundColor: primaryColor }}
								>
									{t.sign_in || "Sign In"}
								</button>
							</div>
						) : !hasPurchased ? (
							<div className="py-4 text-center">
								<p className="text-sm text-gray-600">
									Only verified purchasers can write reviews.
								</p>
							</div>
						) : (
							<div className="space-y-4">
								<h3 className="font-semibold text-gray-800">
									{t.add_product_review_page_title || "Write a Product Review"}
								</h3>

								{/* Points earned message */}
								<div
									className="rounded-lg p-3 text-sm"
									style={{
										backgroundColor: `${primaryColor}10`,
										color: primaryColor,
									}}
								>
									⭐ {t.you_will_gain || "You'll earn"}{" "}
									<strong>
										{getReviewPoints()}-{getReviewWithImagesPoints()}
									</strong>{" "}
									{t.points || "points"}!
								</div>

								<div>
									<label className="mb-2 block text-sm font-medium text-gray-700">
										Rating *
									</label>
									<StarRating
										rating={formData.rating}
										size="lg"
										interactive
										onRate={(rating) =>
											setFormData((prev) => ({ ...prev, rating }))
										}
									/>
								</div>

								<div>
									<label className="mb-1 block text-sm font-medium text-gray-700">
										{t.add_product_review_title || "Review Title"}
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
										placeholder="Summarize your experience"
									/>
								</div>

								<div>
									<label className="mb-1 block text-sm font-medium text-gray-700">
										{t.add_product_review_body || "Your Review"}
									</label>
									<textarea
										value={formData.body}
										onChange={(e) =>
											setFormData((prev) => ({ ...prev, body: e.target.value }))
										}
										className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2"
										rows={4}
										placeholder="Tell others about your experience with this product..."
									/>
								</div>

								<div>
									<label className="mb-1 block text-sm font-medium text-gray-700">
										{t.add_product_review_images || "Add Photos"} (+
										{getReviewWithImagesPoints() - getReviewPoints()} pts)
									</label>
									<div className="flex items-center gap-2">
										<label className="cursor-pointer rounded-lg border-2 border-dashed px-4 py-3 text-center hover:bg-gray-50">
											<input
												type="file"
												accept="image/*"
												multiple
												className="hidden"
												onChange={(e) => {
													const files = Array.from(e.target.files || []);
													setFormData((prev) => ({
														...prev,
														images: [...prev.images, ...files].slice(0, 5),
													}));
												}}
											/>
											<span className="text-sm text-gray-500">
												+ Add Photos
											</span>
										</label>
										{formData.images.map((file, i) => (
											<div key={i} className="relative h-12 w-12">
												<img
													src={URL.createObjectURL(file)}
													alt=""
													className="h-full w-full rounded-lg object-cover"
												/>
												<button
													onClick={() =>
														setFormData((prev) => ({
															...prev,
															images: prev.images.filter((_, idx) => idx !== i),
														}))
													}
													className="absolute -right-1 -top-1 rounded-full bg-red-500 p-0.5 text-white"
												>
													✕
												</button>
											</div>
										))}
									</div>
								</div>

								<div className="flex gap-2">
									<button
										onClick={() => setActiveTab("reviews")}
										className="flex-1 rounded-lg border py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
									>
										Cancel
									</button>
									<button
										className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
										style={{ backgroundColor: primaryColor }}
										disabled={formData.rating === 0}
									>
										{t.write_review || "Submit Review"}
									</button>
								</div>
							</div>
						)}
					</div>
				)}

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
	root.className = "w-full";
	shadow.appendChild(root);

	const scripts = document.querySelectorAll('script[src*="loader"]');
	let apiBaseUrl = window.location.origin;
	if (scripts.length > 0) {
		const scriptUrl = new URL((scripts[0] as HTMLScriptElement).src);
		apiBaseUrl = scriptUrl.origin;
	}

	createRoot(root).render(
		<ProductReviewsApp config={config} apiBaseUrl={apiBaseUrl} />,
	);
}

// Register with global namespace for loader
if (typeof window !== "undefined") {
	(window as any).LylrvWidgets = (window as any).LylrvWidgets || {};
	(window as any).LylrvWidgets["product-reviews"] = { mount };
}
