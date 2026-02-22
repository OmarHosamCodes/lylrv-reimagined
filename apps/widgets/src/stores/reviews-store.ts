import { createStore } from "zustand/vanilla";
import { getApiClient } from "../api/client";
import type { Review, ReviewsMeta } from "../types";
import type { ReviewFormData, ReviewsTabs } from "../types/reviews.types";

export interface ReviewsState {
  isOpen: boolean;
  activeTab: ReviewsTabs;
  formData: ReviewFormData;
  reviews: Review[];
  meta: ReviewsMeta | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSubmitting: boolean;
}

export interface ReviewsActions {
  handleToggle: () => void;
  setActiveTab: (tab: ReviewsTabs) => void;
  setFormData: (data: Partial<ReviewFormData>) => void;
  resetForm: () => void;
  fetchReviews: (options: {
    shop: string;
    apiBaseUrl: string;
    type?: "website" | "product";
    productId?: number;
  }) => Promise<void>;
  submitReview: (options: {
    shop: string;
    apiBaseUrl: string;
    productId?: number;
  }) => Promise<void>;
}

export type ReviewsStore = ReviewsState & ReviewsActions;

const defaultFormData: ReviewFormData = {
  rating: 0,
  title: "",
  body: "",
  images: [],
};

export const createReviewsStore = () => {
  return createStore<ReviewsStore>((set, get) => ({
    isOpen: false,
    activeTab: "reviews",
    formData: { ...defaultFormData },
    reviews: [],
    meta: null,
    isLoading: false,
    isError: false,
    error: null,
    isSubmitting: false,

    handleToggle: () => set((state) => ({ isOpen: !state.isOpen })),

    setActiveTab: (tab) => set({ activeTab: tab }),

    setFormData: (data) =>
      set((state) => ({ formData: { ...state.formData, ...data } })),

    resetForm: () =>
      set({ formData: { ...defaultFormData }, activeTab: "reviews" }),

    fetchReviews: async ({ shop, apiBaseUrl, type = "website", productId }) => {
      set({ isLoading: true, isError: false, error: null });
      try {
        const api = getApiClient(apiBaseUrl);
        const result = await api.getReviews(shop, { type, productId });
        set({
          reviews: result.reviews || [],
          meta: result.meta || null,
          isLoading: false,
        });
      } catch (error) {
        set({
          isError: true,
          error: error as Error,
          isLoading: false,
        });
      }
    },

    submitReview: async ({ shop, apiBaseUrl, productId }) => {
      const { formData } = get();
      if (formData.rating === 0) return;

      set({ isSubmitting: true });
      try {
        const api = getApiClient(apiBaseUrl);
        await api.submitReview(shop, {
          rating: formData.rating,
          title: formData.title || undefined,
          body: formData.body || undefined,
          images: formData.images.length > 0 ? formData.images : undefined,
          productId,
        });
        get().resetForm();
        get().fetchReviews({ shop, apiBaseUrl, type: "website", productId });
      } catch (error) {
        set({ isError: true, error: error as Error, isSubmitting: false });
      } finally {
        set({ isSubmitting: false });
      }
    },
  }));
};
