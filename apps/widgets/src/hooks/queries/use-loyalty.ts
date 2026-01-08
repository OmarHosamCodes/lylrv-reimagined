import { useMutation, useQuery } from "@tanstack/react-query";
import { getApiClient } from "../../api";
import type { CustomerData } from "../../types";

// Query keys
const loyaltyKeys = {
	all: ["loyalty"] as const,
	customer: (shop: string, email: string) =>
		[...loyaltyKeys.all, "customer", shop, email] as const,
};

interface UseLoyaltyOptions {
	shop: string;
	email: string | null | undefined;
	apiBaseUrl: string;
	enabled?: boolean;
}

interface UseLoyaltyResult {
	customer: CustomerData | null;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	refetch: () => void;
}

/**
 * Hook to fetch customer loyalty data
 */
export function useLoyalty({
	shop,
	email,
	apiBaseUrl,
	enabled = true,
}: UseLoyaltyOptions): UseLoyaltyResult {
	const api = getApiClient(apiBaseUrl);

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: loyaltyKeys.customer(shop, email || ""),
		queryFn: async () => {
			if (!email) return null;
			return api.getCustomer(shop, email);
		},
		enabled: enabled && !!shop && !!email,
		staleTime: 2 * 60 * 1000, // 2 minutes
	});

	return {
		customer: data?.exists ? data.customer : null,
		isLoading,
		isError,
		error: error as Error | null,
		refetch,
	};
}

interface UseRedeemPointsOptions {
	shop: string;
	email: string;
	apiBaseUrl: string;
	onSuccess?: (couponCode?: string) => void;
}

/**
 * Hook to redeem loyalty points
 */
export function useRedeemPoints({
	shop,
	email,
	apiBaseUrl,
	onSuccess,
}: UseRedeemPointsOptions) {
	const api = getApiClient(apiBaseUrl);

	return useMutation({
		mutationFn: async (points: number) => {
			return api.redeemPoints(shop, email, points);
		},
		onSuccess: (data: { success: boolean; couponCode?: string }) => {
			onSuccess?.(data.couponCode);
		},
	});
}
