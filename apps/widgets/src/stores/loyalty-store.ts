import { createStore } from "zustand/vanilla";
import { getApiClient } from "../api/client";
import type { CustomerData, LoyaltyTab } from "../types/loyalty.types";

export interface LoyaltyState {
	isOpen: boolean;
	activeTab: LoyaltyTab;
	copiedCode: boolean;
	selectedRedeem: number | null;
	customer: CustomerData | null;
	isLoading: boolean;
	isError: boolean;
	error: Error | null;
	isRedeeming: boolean;
}

export interface LoyaltyActions {
	handleToggle: () => void;
	setActiveTab: (tab: LoyaltyTab) => void;
	handleCopyReferral: (code: string | null) => Promise<void>;
	handleRedeem: (value: number) => void;
	handleConfirmRedeem: (options: {
		shop: string;
		email: string;
		apiBaseUrl: string;
	}) => Promise<void>;
	fetchCustomer: (options: {
		shop: string;
		email: string;
		apiBaseUrl: string;
	}) => Promise<void>;
}

export type LoyaltyStore = LoyaltyState & LoyaltyActions;

export const createLoyaltyStore = () => {
	return createStore<LoyaltyStore>((set, get) => ({
		isOpen: false,
		activeTab: "home",
		copiedCode: false,
		selectedRedeem: null,
		customer: null,
		isLoading: false,
		isError: false,
		error: null,
		isRedeeming: false,

		handleToggle: () => set((state) => ({ isOpen: !state.isOpen })),

		setActiveTab: (tab) => set({ activeTab: tab }),

		handleCopyReferral: async (code) => {
			if (code) {
				await navigator.clipboard.writeText(code);
				set({ copiedCode: true });
				setTimeout(() => set({ copiedCode: false }), 2000);
			}
		},

		handleRedeem: (value) => set({ selectedRedeem: value }),

		handleConfirmRedeem: async ({ shop, email, apiBaseUrl }) => {
			const { selectedRedeem } = get();
			if (!selectedRedeem) return;

			set({ isRedeeming: true });
			try {
				const api = getApiClient(apiBaseUrl);
				await api.redeemPoints(shop, email, selectedRedeem);
				set({ selectedRedeem: null });
				get().fetchCustomer({ shop, email, apiBaseUrl });
			} catch (error) {
				set({ isError: true, error: error as Error });
			} finally {
				set({ isRedeeming: false });
			}
		},

		fetchCustomer: async ({ shop, email, apiBaseUrl }) => {
			set({ isLoading: true, isError: false, error: null });
			try {
				const api = getApiClient(apiBaseUrl);
				const response = await api.getCustomer(shop, email);
				set({ customer: response.customer, isLoading: false });
			} catch (error) {
				set({ isError: true, error: error as Error, isLoading: false });
			}
		},
	}));
};
