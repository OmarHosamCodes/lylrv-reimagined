import { useState } from "react";
import { createRoot } from "react-dom/client";
import styles from "./styles.css?inline";

interface WidgetConfig {
    enabled: boolean;
    widgets: string[];
    styles: {
        primaryColor: string;
        position: "left" | "right";
    };
    clientId?: string;
}

interface ProductReviewsAppProps {
    config: WidgetConfig;
}

interface Review {
    id: string;
    rating: number;
    title: string;
    content: string;
    author: string;
    date: string;
    verified: boolean;
}

// Sample reviews for demo
const SAMPLE_REVIEWS: Review[] = [
    {
        id: "1",
        rating: 5,
        title: "Excellent quality!",
        content: "This product exceeded my expectations. The quality is top-notch and it arrived quickly.",
        author: "Emily R.",
        date: "2 days ago",
        verified: true,
    },
    {
        id: "2",
        rating: 4,
        title: "Great value for money",
        content: "Very happy with my purchase. Would definitely recommend to others.",
        author: "Michael T.",
        date: "1 week ago",
        verified: true,
    },
    {
        id: "3",
        rating: 5,
        title: "Perfect!",
        content: "Exactly what I was looking for. Fast shipping too!",
        author: "Sarah K.",
        date: "2 weeks ago",
        verified: false,
    },
];

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`h-4 w-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
}

function ProductReviewsApp({ config }: ProductReviewsAppProps) {
    const [showForm, setShowForm] = useState(false);
    const primaryColor = config.styles.primaryColor;

    const averageRating = SAMPLE_REVIEWS.reduce((acc, r) => acc + r.rating, 0) / SAMPLE_REVIEWS.length;

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Customer Reviews</h2>
                        <div className="mt-1 flex items-center gap-2">
                            <StarRating rating={Math.round(averageRating)} />
                            <span className="text-sm text-gray-600">
                                {averageRating.toFixed(1)} out of 5 ({SAMPLE_REVIEWS.length} reviews)
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Write a Review
                    </button>
                </div>
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="border-b border-gray-200 bg-gray-50 p-4">
                    <h3 className="mb-3 font-medium text-gray-900">Write Your Review</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">Rating</label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="text-gray-300 transition-colors hover:text-yellow-400"
                                    >
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">Title</label>
                            <input
                                type="text"
                                placeholder="Summarize your review"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-700">Review</label>
                            <textarea
                                rows={3}
                                placeholder="Share your experience with this product"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                                style={{ backgroundColor: primaryColor }}
                            >
                                Submit Review
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="divide-y divide-gray-100">
                {SAMPLE_REVIEWS.map((review) => (
                    <div key={review.id} className="p-4">
                        <div className="mb-2 flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <StarRating rating={review.rating} />
                                    {review.verified && (
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                            Verified Purchase
                                        </span>
                                    )}
                                </div>
                                <h4 className="mt-1 font-medium text-gray-900">{review.title}</h4>
                            </div>
                            <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{review.content}</p>
                        <p className="mt-2 text-xs text-gray-500">— {review.author}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 text-center">
                <button
                    className="text-sm font-medium transition-colors hover:opacity-80"
                    style={{ color: primaryColor }}
                >
                    Load More Reviews
                </button>
            </div>
        </div>
    );
}

// Mount function exposed to the loader
export function mount(container: HTMLElement, config: WidgetConfig) {
    const shadow = container.attachShadow({ mode: "open" });

    // Inject styles into Shadow DOM
    const styleTag = document.createElement("style");
    styleTag.textContent = styles;
    shadow.appendChild(styleTag);

    // Create root element for React
    const root = document.createElement("div");
    root.className = "w-full";
    shadow.appendChild(root);

    createRoot(root).render(<ProductReviewsApp config={config} />);
}
