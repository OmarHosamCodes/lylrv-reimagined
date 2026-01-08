import type { CustomerData } from "./loyalty.types";
import type { Review, ReviewsMeta } from "./reviews.types";
import type { WidgetConfig } from "./widget.types";

// API Response Types
export interface WidgetConfigResponse extends WidgetConfig { }

export interface CustomerResponse {
	exists: boolean;
	customer: CustomerData | null;
}

export interface ReviewsResponse {
	reviews: Review[];
	meta: ReviewsMeta;
}

// API Request Types
export interface CustomerRequest {
	shop: string;
	email: string;
}

export interface ReviewsRequest {
	shop: string;
	type?: "website" | "product";
	productId?: number;
	limit?: number;
	offset?: number;
}
