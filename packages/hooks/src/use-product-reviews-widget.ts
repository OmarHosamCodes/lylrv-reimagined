import type { ReviewsTab, WidgetConfig } from "@lylrv/state";
import { useCallback, useState } from "react";
import { useReviews, useSubmitReview } from "./queries/use-reviews";
import { useLocalizations } from "./use-localizations";
import { useWidgetTheme } from "./use-widget-theme";

interface UseProductReviewsWidgetOptions {
  shop: string;
  productId: number;
  apiBaseUrl: string;
}

interface ProductReviewFormData {
  rating: number;
  title: string;
  body: string;
  images: File[];
}

export function useProductReviewsWidget(
  config: WidgetConfig,
  options: UseProductReviewsWidgetOptions,
) {
  const { shop, productId, apiBaseUrl } = options;

  const [activeTab, setActiveTab] = useState<ReviewsTab | "questions">(
    "reviews",
  );
  const [formData, setFormData] = useState<ProductReviewFormData>({
    rating: 0,
    title: "",
    body: "",
    images: [],
  });
  const [imageViewerOpen, setImageViewerOpen] = useState<string | null>(null);

  const t = useLocalizations(config);
  const theme = useWidgetTheme(config);

  const isLoggedIn = config.user?.isLoggedIn || false;
  const hasPurchased = config.context?.product?.hasPurchased || false;

  const interactions = config.clientConfig?.interactions || [];
  const reviewInteraction = interactions.find((i) => i.trigger === "review");
  const reviewWithImagesInteraction = interactions.find(
    (i) => i.trigger === "reviewImgs",
  );

  const reviewPoints = reviewInteraction?.pointsGained || 50;
  const reviewWithImagesPoints =
    reviewWithImagesInteraction?.pointsGained || 100;

  const { reviews, meta, isLoading, error, refetch } = useReviews({
    shop,
    apiBaseUrl,
    type: "product",
    productId,
  });

  const { mutate: submitReview, isPending: isSubmitting } = useSubmitReview({
    shop,
    apiBaseUrl,
    onSuccess: () => {
      setFormData({ rating: 0, title: "", body: "", images: [] });
      setActiveTab("reviews");
      refetch();
    },
  });

  const handleRatingChange = useCallback((rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  }, []);

  const handleInputChange = useCallback(
    (field: keyof ProductReviewFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const handleAddImages = useCallback((files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles].slice(0, 5),
    }));
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    if (formData.rating === 0) return;
    submitReview({
      rating: formData.rating,
      title: formData.title,
      body: formData.body,
      images: formData.images.length > 0 ? formData.images : undefined,
    });
  }, [formData, submitReview]);

  const canSubmit = formData.rating > 0 && isLoggedIn && hasPurchased;

  return {
    t,
    theme,
    isLoggedIn,
    hasPurchased,
    reviewPoints,
    reviewWithImagesPoints,
    activeTab,
    setActiveTab,
    reviews,
    meta,
    isLoading,
    error,
    imageViewerOpen,
    setImageViewerOpen,
    formData,
    handleRatingChange,
    handleInputChange,
    handleAddImages,
    handleRemoveImage,
    handleSubmit,
    canSubmit,
    isSubmitting,
  };
}
