import { motion } from "framer-motion";
import { ReviewCard } from "@/components";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import type { Review } from "@/types";

interface ReviewsListProps {
  reviews: Review[];
  t: Record<string, string>;
  onImageClick?: (url: string) => void;
  onWriteReview?: () => void;
}

export const ReviewsList = ({
  reviews,
  t,
  onImageClick,
  onWriteReview,
}: ReviewsListProps) => {
  if (reviews.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transitions.smooth}
        className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_18px_35px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm py-8 text-center"
      >
        <p className="text-muted-foreground">
          {t.no_reviews_yet || "No reviews yet for this product."}
        </p>
        {onWriteReview && (
          <motion.button
            type="button"
            onClick={onWriteReview}
            whileHover={{ x: 4 }}
            transition={transitions.snappy}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            {t.be_first_to_review || "Be the first to review"} →
          </motion.button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {reviews.map((review) => (
        <motion.div key={review.id} variants={staggerItem}>
          <ReviewCard review={review} onImageClick={onImageClick} />
        </motion.div>
      ))}
    </motion.div>
  );
};
