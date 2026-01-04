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

interface LoyaltyAppProps {
    config: WidgetConfig;
}

function LoyaltyApp({ config }: LoyaltyAppProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [points, setPoints] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

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
                aria-label="Open loyalty program"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="h-7 w-7"
                >
                    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
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
                        <h2 className="text-lg font-semibold">Loyalty Rewards</h2>
                        <p className="text-sm opacity-90">Earn points with every purchase</p>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {points !== null ? (
                            <div className="text-center">
                                <p className="text-3xl font-bold" style={{ color: primaryColor }}>
                                    {points}
                                </p>
                                <p className="text-sm text-gray-600">Available Points</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-center text-sm text-gray-600">
                                    Sign in to view your points balance
                                </p>
                                <button
                                    className="w-full rounded-lg py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Sign In
                                </button>
                            </div>
                        )}

                        {/* Ways to earn */}
                        <div className="mt-4 border-t pt-4">
                            <h3 className="mb-2 text-sm font-semibold text-gray-800">
                                Ways to Earn
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                                        ✓
                                    </span>
                                    Make a purchase
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                                        ✓
                                    </span>
                                    Leave a review
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                                        ✓
                                    </span>
                                    Refer a friend
                                </li>
                            </ul>
                        </div>
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

    createRoot(root).render(<LoyaltyApp config={config} />);
}

// Register with global namespace for loader
if (typeof window !== "undefined") {
    (window as any).LylrvWidgets = (window as any).LylrvWidgets || {};
    (window as any).LylrvWidgets.loyalty = { mount };
}
