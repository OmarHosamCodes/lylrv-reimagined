import { useState } from "react";
import type { ReviewFormData, ReviewsTab } from "@lylrv/state";
import { useReviews, useSubmitReview } from "./queries";

interface UseReviewsWidgetOptions {
  shop: string;
  apiBaseUrl: string;
  type?: "website" | "product";
  productId?: number;
  enabled?: boolean;
}

export function useReviewsWidget({
  shop,
  apiBaseUrl,
  type = "website",
  productId,
  enabled = true,
}: UseReviewsWidgetOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ReviewsTab>("reviews");
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: 0,
    title: "",
    body: "",
    images: [],
  });

  const { reviews, meta, isLoading, refetch } = useReviews({
    shop,
    apiBaseUrl,
    type,
    productId,
    enabled: enabled && isOpen,
  });

  const submitMutation = useSubmitReview({
    shop,
    apiBaseUrl,
    productId,
    onSuccess: () => {
      setFormData({ rating: 0, title: "", body: "", images: [] });
      setActiveTab("reviews");
      refetch();
    },
  });

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleRatingChange = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleInputChange = (field: keyof ReviewFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (formData.rating === 0) return;
    submitMutation.mutate({
      rating: formData.rating,
      title: formData.title || undefined,
      body: formData.body || undefined,
      images: formData.images.length > 0 ? formData.images : undefined,
    });
  };

  const canSubmit = formData.rating > 0 && !submitMutation.isPending;

  return {
    isOpen,
    activeTab,
    formData,
    isLoading,
    reviews,
    meta,
    handleToggle,
    setActiveTab,
    handleRatingChange,
    handleInputChange,
    handleSubmit,
    canSubmit,
    isSubmitting: submitMutation.isPending,
  };
}
