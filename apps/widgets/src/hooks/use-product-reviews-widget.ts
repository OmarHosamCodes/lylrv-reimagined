import { useCallback, useState } from "react";
import type { WidgetConfig } from "../types";
import type { ReviewsTab } from "../types/reviews.types";
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
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState<string | null>(null);

  const t = useLocalizations(config);
  const theme = useWidgetTheme(config);

  const isLoggedIn = config.user?.isLoggedIn || false;
  const hasPurchased = config.context?.product?.hasPurchased || false;

  // Get interaction points for reviews
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
      setFormData({ rating: 0, title: "", body: "" });
      setImageFiles([]);
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
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  }, []);

  const handleRemoveImage = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(() => {
    if (formData.rating === 0) return;
    submitReview({
      rating: formData.rating,
      title: formData.title,
      body: formData.body,
      images: imageFiles.length > 0 ? imageFiles : undefined,
    });
  }, [formData, imageFiles, submitReview]);

  const canSubmit = formData.rating > 0 && isLoggedIn && hasPurchased;

  return {
    // Localization and theme
    t,
    theme,

    // User state
    isLoggedIn,
    hasPurchased,

    // Points
    reviewPoints,
    reviewWithImagesPoints,

    // Tab state
    activeTab,
    setActiveTab,

    // Reviews data
    reviews,
    meta,
    isLoading,
    error,

    // Image viewer
    imageViewerOpen,
    setImageViewerOpen,

    // Form state
    formData,
    imageFiles,
    handleRatingChange,
    handleInputChange,
    handleAddImages,
    handleRemoveImage,
    handleSubmit,
    canSubmit,
    isSubmitting,
  };
}
