import { Button } from "@lylrv/ui/button";
import { motion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import type { ReviewFormData } from "@/types";
import { AddQuestion } from "./AddQuestion";
import { AddReview } from "./AddReview";

interface FormDisplayProps {
  showForm: "review" | "question" | null;
  t: Record<string, string>;
  isLoggedIn: boolean;
  hasPurchased: boolean;
  hasUserAlreadyReviewed?: boolean;
  reviewPoints: number;
  reviewWithImagesPoints: number;
  formData: ReviewFormData;
  canSubmit: boolean;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onInputChange: (field: "title" | "body", value: string) => void;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onSubmitReview: () => void;
  onCancel: () => void;
  onSubmitQuestion: (body: string) => void;
}

export const FormDisplay = ({
  showForm,
  t,
  isLoggedIn,
  hasPurchased,
  hasUserAlreadyReviewed,
  reviewPoints,
  reviewWithImagesPoints,
  formData,
  canSubmit,
  isSubmitting,
  onRatingChange,
  onInputChange,
  onAddImages,
  onRemoveImage,
  onSubmitReview,
  onCancel,
  onSubmitQuestion,
}: FormDisplayProps) => {
  if (!showForm) return null;

  if (showForm === "question") {
    if (!isLoggedIn) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transitions.spring}
          className="rounded-xl border border-border/60 bg-card p-6 text-center"
        >
          <p className="mb-4 text-sm text-muted-foreground">
            {t.sign_in || "Sign in"} to ask a question
          </p>
          <Button>{t.sign_in || "Sign In"}</Button>
        </motion.div>
      );
    }
    return <AddQuestion t={t} onSubmit={onSubmitQuestion} />;
  }

  if (showForm === "review") {
    if (hasUserAlreadyReviewed) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transitions.spring}
          className="rounded-xl border border-border/60 bg-card p-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {t.already_reviewed || "You have already reviewed this product."}
          </p>
        </motion.div>
      );
    }

    return (
      <AddReview
        t={t}
        isLoggedIn={isLoggedIn}
        hasPurchased={hasPurchased}
        reviewPoints={reviewPoints}
        reviewWithImagesPoints={reviewWithImagesPoints}
        formData={formData}
        canSubmit={canSubmit}
        isSubmitting={isSubmitting}
        onRatingChange={onRatingChange}
        onInputChange={onInputChange}
        onAddImages={onAddImages}
        onRemoveImage={onRemoveImage}
        onSubmit={onSubmitReview}
        onCancel={onCancel}
      />
    );
  }

  return null;
};
