import { createStore } from "zustand/vanilla";
import { getApiClient } from "../api/client";
export interface ProductReviewFormData {
	rating: number;
	title: string;
	body: string;
	images?: File[];
}

import type { Review, ReviewsMeta } from "../types";

export interface ProductReviewsState {
	activeTab: "reviews" | "questions" | "write";
	formData: ProductReviewFormData;
	imageFiles: File[];
	imageViewerOpen: string | null;
	reviews: Review[];
	meta: ReviewsMeta | null;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	isSubmitting: boolean;
}

export interface ProductReviewsActions {
	setActiveTab: (tab: "reviews" | "questions" | "write") => void;
	setFormData: (data: Partial<ProductReviewFormData>) => void;
	setImageFiles: (files: File[]) => void;
	addImages: (files: FileList | null) => void;
	removeImage: (index: number) => void;
	setImageViewerOpen: (url: string | null) => void;
	resetForm: () => void;
	fetchReviews: (options: {
		shop: string;
		apiBaseUrl: string;
		productId: number;
	}) => Promise<void>;
	submitReview: (options: {
		shop: string;
		apiBaseUrl: string;
		productId: number;
	}) => Promise<void>;
}

export type ProductReviewsStore = ProductReviewsState & ProductReviewsActions;

const defaultFormData: ProductReviewFormData = {
	rating: 0,
	title: "",
	body: "",
};

export const createProductReviewsStore = () => {
	return createStore<ProductReviewsStore>((set, get) => ({
		activeTab: "reviews",
		formData: { ...defaultFormData },
		imageFiles: [],
		imageViewerOpen: null,
		reviews: [],
		meta: null,
		isLoading: false,
		isError: false,
		error: null,
		isSubmitting: false,

		setActiveTab: (tab) => set({ activeTab: tab }),

		setFormData: (data) =>
			set((state) => ({ formData: { ...state.formData, ...data } })),

		setImageFiles: (files) => set({ imageFiles: files }),

		addImages: (fileList) => {
			if (!fileList) return;
			const newFiles = Array.from(fileList);
			set((state) => ({
				imageFiles: [...state.imageFiles, ...newFiles].slice(0, 5),
			}));
		},

		removeImage: (index) =>
			set((state) => ({
				imageFiles: state.imageFiles.filter((_, i) => i !== index),
			})),

		setImageViewerOpen: (url) => set({ imageViewerOpen: url }),

		resetForm: () =>
			set({
				formData: { ...defaultFormData },
				imageFiles: [],
				activeTab: "reviews",
			}),

		fetchReviews: async ({ shop, apiBaseUrl, productId }) => {
			set({ isLoading: true, isError: false, error: null });
			try {
				const api = getApiClient(apiBaseUrl);
				const result = await api.getReviews(shop, {
					type: "product",
					productId,
				});
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
			const { formData, imageFiles } = get();
			if (formData.rating === 0) return;

			set({ isSubmitting: true });
			try {
				const api = getApiClient(apiBaseUrl);
				await api.submitReview(shop, {
					rating: formData.rating,
					title: formData.title || undefined,
					body: formData.body || undefined,
					images: imageFiles.length > 0 ? imageFiles : undefined,
					productId,
				});
				get().resetForm();
				get().fetchReviews({ shop, apiBaseUrl, productId });
			} catch (error) {
				set({ isError: true, error: error as Error, isSubmitting: false });
			} finally {
				set({ isSubmitting: false });
			}
		},
	}));
};
