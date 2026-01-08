// Default values for the widget configuration
export const DEFAULT_PRIMARY_COLOR = "#6366f1";
export const DEFAULT_TEXT_COLOR = "#ffffff";
export const DEFAULT_POSITION = "right" as const;

// Default redeem values for loyalty
export const DEFAULT_REDEEM_VALUES = [100, 200, 500, 1000];
export const DEFAULT_MIN_REDEEM = 100;

// API query keys for React Query
export const QUERY_KEYS = {
	config: (shop: string) => ["widget-config", shop] as const,
	customer: (shop: string, email: string) => ["customer", shop, email] as const,
	reviews: (shop: string, type: string, productId?: number) =>
		["reviews", shop, type, productId] as const,
} as const;

// Default localizations (fallback when none provided)
export const DEFAULT_LOCALIZATIONS = {
	en: {
		point_system_header: "Loyalty Points",
		total_points: "Total Points",
		earn_more_points: "Earn Points",
		redeem: "Redeem",
		redeem_points: "Redeem Points",
		sign_in: "Sign In",
		join_now: "Join Now",
		already_have_an_account: "Already have an account?",
		unlock_exciting_perks: "Unlock exciting perks and rewards!",
		referral_title: "Refer a Friend",
		copy_referral_code: "Copy Code",
		points: "Points",
		reviews_system_header: "Customer Reviews",
		total_reviews: "reviews",
		reviews_tab_title: "Reviews",
		write_review: "Write Review",
		view_all: "View All",
		need_help: "Need help?",
		add_website_review: "Rate your experience",
		add_product_review_title: "Review Title",
		add_product_review_body: "Your review",
		add_question: "Ask a Question",
		add_question_body: "Have a question about this product?",
	},
} as const;

// Widget stacking order for floating buttons
export const WIDGET_Z_INDEX = {
	floating_button: 9999,
	panel: 9998,
	overlay: 9997,
} as const;
