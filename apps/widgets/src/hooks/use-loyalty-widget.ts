import { useState } from "react";
import type { LoyaltyTab } from "../types/loyalty.types";
import { useLoyalty, useRedeemPoints } from "./queries";

interface UseLoyaltyWidgetOptions {
  shop: string;
  email: string | null | undefined;
  apiBaseUrl: string;
  isLoggedIn: boolean;
  userPoints?: number;
  userReferralCode?: string | null;
}

export function useLoyaltyWidget({
  shop,
  email,
  apiBaseUrl,
  isLoggedIn,
  userPoints = 0,
  userReferralCode = null,
}: UseLoyaltyWidgetOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<LoyaltyTab>("home");
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedRedeem, setSelectedRedeem] = useState<number | null>(null);

  // Fetch customer data when logged in and panel is open
  const { customer, isLoading, refetch } = useLoyalty({
    shop,
    email,
    apiBaseUrl,
    enabled: isLoggedIn && isOpen && !!email,
  });

  // Redeem mutation
  const redeemMutation = useRedeemPoints({
    shop,
    email: email || "",
    apiBaseUrl,
    onSuccess: () => {
      setSelectedRedeem(null);
      refetch();
    },
  });

  // Merge customer data with WordPress-injected data
  const points = customer?.totalPoints ?? userPoints;
  const referralCode = customer?.referralCode ?? userReferralCode;

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleCopyReferral = async () => {
    if (referralCode) {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRedeem = (value: number) => {
    setSelectedRedeem(value);
  };

  const handleConfirmRedeem = () => {
    if (selectedRedeem) {
      redeemMutation.mutate(selectedRedeem);
    }
  };

  return {
    // State
    isOpen,
    activeTab,
    copiedCode,
    selectedRedeem,
    isLoading,

    // Data
    points,
    referralCode,
    customer,
    recentActivity: customer?.recentActivity || [],
    activeCoupons: customer?.activeCoupons || [],

    // Actions
    handleToggle,
    handleCopyReferral,
    handleRedeem,
    handleConfirmRedeem,
    setActiveTab,

    // Mutation state
    isRedeeming: redeemMutation.isPending,
  };
}
