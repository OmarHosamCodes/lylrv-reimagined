import type {
	CustomerResponse,
	ReviewsResponse,
	WidgetConfigResponse,
} from "../types";

/**
 * API Client for widget data fetching
 */
export class WidgetApiClient {
	constructor(private baseUrl: string) { }

	async getConfig(shop: string): Promise<WidgetConfigResponse | null> {
		try {
			const response = await fetch(
				`${this.baseUrl}/api/widget/config?shop=${encodeURIComponent(shop)}`,
			);
			if (!response.ok) {
				console.error("[Lylrv] Failed to load config:", response.status);
				return null;
			}
			return await response.json();
		} catch (error) {
			console.error("[Lylrv] Error loading config:", error);
			return null;
		}
	}

	async getCustomer(shop: string, email: string): Promise<CustomerResponse> {
		const response = await fetch(
			`${this.baseUrl}/api/widget/customer?shop=${encodeURIComponent(shop)}&email=${encodeURIComponent(email)}`,
		);
		if (!response.ok) {
			throw new Error(`Failed to fetch customer: ${response.status}`);
		}
		return await response.json();
	}

	async getReviews(
		shop: string,
		options: {
			type?: "website" | "product";
			productId?: number;
			limit?: number;
			offset?: number;
		} = {},
	): Promise<ReviewsResponse> {
		const params = new URLSearchParams({ shop });

		if (options.type) params.set("type", options.type);
		if (options.productId) params.set("productId", String(options.productId));
		if (options.limit) params.set("limit", String(options.limit));
		if (options.offset) params.set("offset", String(options.offset));

		const response = await fetch(
			`${this.baseUrl}/api/widget/reviews?${params.toString()}`,
		);
		if (!response.ok) {
			throw new Error(`Failed to fetch reviews: ${response.status}`);
		}
		return await response.json();
	}

	async submitReview(
		shop: string,
		data: {
			rating: number;
			title?: string;
			body?: string;
			productId?: number;
			images?: File[];
		},
	): Promise<{ success: boolean }> {
		const formData = new FormData();
		formData.append("shop", shop);
		formData.append("rating", String(data.rating));
		if (data.title) formData.append("title", data.title);
		if (data.body) formData.append("body", data.body);
		if (data.productId) formData.append("productId", String(data.productId));
		if (data.images) {
			for (const image of data.images) {
				formData.append("images", image);
			}
		}

		const response = await fetch(`${this.baseUrl}/api/widget/reviews`, {
			method: "POST",
			body: formData,
		});
		if (!response.ok) {
			throw new Error(`Failed to submit review: ${response.status}`);
		}
		return await response.json();
	}

	async redeemPoints(
		shop: string,
		email: string,
		points: number,
	): Promise<{ success: boolean; couponCode?: string }> {
		const response = await fetch(`${this.baseUrl}/api/widget/redeem`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ shop, email, points }),
		});
		if (!response.ok) {
			throw new Error(`Failed to redeem points: ${response.status}`);
		}
		return await response.json();
	}
}

// Create a singleton instance factory
let apiClient: WidgetApiClient | null = null;

export function getApiClient(baseUrl: string): WidgetApiClient {
	if (!apiClient) {
		apiClient = new WidgetApiClient(baseUrl);
	}
	return apiClient;
}
