import { QueryClient, QueryClientProvider, useMutation, useQuery } from "@tanstack/react-query";
import { getApiClient, type Review, type ReviewsMeta } from "@lylrv/state";

const reviewsKeys = {
  all: ["reviews"] as const,
  website: (shop: string) => [...reviewsKeys.all, "website", shop] as const,
  product: (shop: string, productId: number) =>
    [...reviewsKeys.all, "product", shop, productId] as const,
};

interface UseReviewsOptions {
  shop: string;
  apiBaseUrl: string;
  type?: "website" | "product";
  productId?: number;
  enabled?: boolean;
  limit?: number;
}

interface UseReviewsResult {
  reviews: Review[];
  meta: ReviewsMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useReviews({
  shop,
  apiBaseUrl,
  type = "website",
  productId,
  enabled = true,
  limit = 10,
}: UseReviewsOptions): UseReviewsResult {
  const api = getApiClient(apiBaseUrl);

  const queryKey =
    type === "product" && productId
      ? reviewsKeys.product(shop, productId)
      : reviewsKeys.website(shop);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      return api.getReviews(shop, { type, productId, limit });
    },
    enabled: enabled && !!shop,
    staleTime: 5 * 60 * 1000,
  });

  return {
    reviews: data?.reviews || [],
    meta: data?.meta || null,
    isLoading,
    isError,
    error: error as Error | null,
    refetch,
  };
}

interface UseSubmitReviewOptions {
  shop: string;
  apiBaseUrl: string;
  productId?: number;
  onSuccess?: () => void;
}

export function useSubmitReview({
  shop,
  apiBaseUrl,
  productId,
  onSuccess,
}: UseSubmitReviewOptions) {
  const api = getApiClient(apiBaseUrl);

  return useMutation({
    mutationFn: async (data: {
      rating: number;
      title?: string;
      body?: string;
      images?: File[];
    }) => {
      return api.submitReview(shop, { ...data, productId });
    },
    onSuccess: () => {
      onSuccess?.();
    },
  });
}

export { QueryClient, QueryClientProvider };
