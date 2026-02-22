import { Button } from "@lylrv/ui/button";
import { Input } from "@lylrv/ui/input";
import { Label } from "@lylrv/ui/label";
import { Textarea } from "@lylrv/ui/textarea";
import { AnimatePresence, motion } from "framer-motion";
import { CameraIcon } from "lucide-react";
import { StarRating } from "@/components";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import type { ReviewFormData } from "@/types";

interface AddReviewProps {
  t: Record<string, string>;
  isLoggedIn: boolean;
  hasPurchased: boolean;
  reviewPoints: number;
  reviewWithImagesPoints: number;
  formData: ReviewFormData;
  canSubmit: boolean;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onInputChange: (field: "title" | "body", value: string) => void;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddReview = ({
  t,
  isLoggedIn,
  hasPurchased,
  reviewPoints,
  reviewWithImagesPoints,
  formData,
  canSubmit,
  isSubmitting,
  onRatingChange,
  onInputChange,
  onAddImages,
  onRemoveImage,
  onSubmit,
  onCancel,
}: AddReviewProps) => {
  if (!isLoggedIn) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.spring}
        className="ly-widget-card rounded-2xl p-6 text-center"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {t.sign_in || "Sign in"} to write a review
        </p>
        <Button>{t.sign_in || "Sign In"}</Button>
      </motion.div>
    );
  }

  if (!hasPurchased) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={transitions.spring}
        className="ly-widget-card rounded-2xl p-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          Only verified purchasers can write reviews.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="ly-widget-card space-y-4 rounded-2xl p-5"
    >
      <motion.h3
        variants={staggerItem}
        className="font-semibold text-foreground"
      >
        {t.add_product_review_page_title || "Write a Product Review"}
      </motion.h3>

      {/* Points earned message */}
      <motion.div
        variants={staggerItem}
        className="rounded-xl border border-brand-amber/20 bg-brand-amber/10 p-3 text-sm text-brand-amber"
      >
        <span className="font-medium">
          {t.you_will_gain || "You'll earn"}{" "}
          <strong>
            {reviewPoints}-{reviewWithImagesPoints}
          </strong>{" "}
          {t.points || "points"}!
        </span>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Label>Rating *</Label>
        <div className="mt-1.5">
          <StarRating
            rating={formData.rating}
            size="lg"
            interactive
            onRate={onRatingChange}
            className="text-yellow-400"
          />
        </div>
      </motion.div>

      <motion.div variants={staggerItem}>
        <Label htmlFor="review-title">
          {t.add_product_review_title || "Review Title"}
        </Label>
        <Input
          id="review-title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onInputChange("title", e.target.value)
          }
          placeholder="Summarize your experience"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Label htmlFor="review-body">
          {t.add_product_review_body || "Your Review"}
        </Label>
        <Textarea
          id="review-body"
          value={formData.body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onInputChange("body", e.target.value)
          }
          rows={4}
          placeholder="Tell others about your experience with this product..."
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <Label>
          {t.add_product_review_images || "Add Photos"} (+
          {reviewWithImagesPoints - reviewPoints} pts)
        </Label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <motion.label
            whileHover={{
              borderColor: "var(--color-primary)",
              backgroundColor: "var(--color-accent)",
            }}
            className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-white/80 bg-white/55 px-4 py-3 text-center transition-colors"
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onAddImages(e.target.files)}
            />
            <CameraIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add Photos</span>
          </motion.label>
          <AnimatePresence>
            {formData.images.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={transitions.springStiff}
                className="relative h-14 w-14"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt=""
                  className="h-full w-full rounded-lg object-cover ring-1 ring-white/70"
                />
                <motion.button
                  type="button"
                  onClick={() => onRemoveImage(i)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground shadow-sm"
                >
                  x
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div variants={staggerItem} className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit} className="flex-1">
          <AnimatePresence mode="wait">
            <motion.span
              key={isSubmitting ? "submitting" : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={transitions.snappy}
            >
              {isSubmitting
                ? "Submitting..."
                : t.write_review || "Submit Review"}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    </motion.div>
  );
};
