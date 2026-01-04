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

interface ReviewsAppProps {
    config: WidgetConfig;
}

function ReviewsApp({ config }: ReviewsAppProps) {
    const [isOpen, setIsOpen] = useState(false);
    const primaryColor = config.styles.primaryColor;

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={handleToggle}
                className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
                aria-label="Open reviews"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
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
                <div className="absolute bottom-16 right-0 w-80 overflow-hidden rounded-xl bg-white shadow-2xl">
                    {/* Header */}
                    <div
                        className="p-4 text-white"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <h2 className="text-lg font-semibold">Customer Reviews</h2>
                        <p className="text-sm opacity-90">See what others are saying</p>
                    </div>

                    {/* Content */}
                    <div className="max-h-80 space-y-3 overflow-y-auto p-4">
                        {/* Sample Review */}
                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">5.0</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                "Great product! Fast shipping and excellent quality."
                            </p>
                            <p className="mt-1 text-xs text-gray-500">— John D.</p>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3">
                            <div className="mb-1 flex items-center gap-2">
                                <div className="flex text-yellow-400">
                                    {[...Array(4)].map((_, i) => (
                                        <svg
                                            key={i}
                                            className="h-4 w-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-xs text-gray-500">4.0</span>
                            </div>
                            <p className="text-sm text-gray-700">
                                "Very satisfied with my purchase. Would recommend!"
                            </p>
                            <p className="mt-1 text-xs text-gray-500">— Sarah M.</p>
                        </div>

                        {/* Write Review CTA */}
                        <button
                            className="w-full rounded-lg py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: primaryColor }}
                        >
                            Write a Review
                        </button>
                    </div>
                </div>
            )}
        </>
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
    root.className = "relative";
    shadow.appendChild(root);

    createRoot(root).render(<ReviewsApp config={config} />);
}

// Register with global namespace for loader
if (typeof window !== "undefined") {
    (window as any).LylrvWidgets = (window as any).LylrvWidgets || {};
    (window as any).LylrvWidgets.reviews = { mount };
}
