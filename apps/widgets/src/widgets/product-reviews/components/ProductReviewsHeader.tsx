import { motion } from "framer-motion";
import { Button, StarRating } from "@/components";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import { ReviewImageGallery } from "./ReviewImageGallery";

interface ProductReviewsHeaderProps {
  avgRating: number;
  totalReviews: number;
  t: Record<string, string>;
  isReviewsContainImages: boolean;
  allReviewsImages: string[];
  onToggleReviewForm: () => void;
  onToggleQuestionForm: () => void;
}

/**
 * Header for product reviews — large rating number with staggered entrance
 */
export const ProductReviewsHeader = ({
  avgRating,
  totalReviews,
  t,
  isReviewsContainImages,
  allReviewsImages,
  onToggleReviewForm,
  onToggleQuestionForm,
}: ProductReviewsHeaderProps) => {
  return (
    <motion.section
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_18px_35px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm flex w-full flex-row items-center justify-between p-5 max-sm:p-4"
    >
      <section className="flex w-full flex-col items-start justify-start">
        <motion.div
          variants={staggerItem}
          className="flex w-full flex-col items-start justify-start gap-1"
        >
          <h1 className="font-bold tracking-tight text-foreground text-[1.75rem] leading-7">
            {t.reviews_system_header || "Customer Reviews"}
          </h1>
          <section className="inline-flex items-center gap-1 rounded-full border border-brand-amber/20 bg-brand-amber/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-brand-amber mt-1">
            <StarRating rating={avgRating} className="text-yellow-400" />
            <p className="text-xs text-brand-amber">
              ({totalReviews} {t.total_reviews || "Reviews"})
            </p>
          </section>
        </motion.div>

        <motion.h1
          variants={{
            hidden: { opacity: 0, scale: 0.8, y: 20 },
            visible: {
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { ...transitions.springBouncy, delay: 0.15 },
            },
          }}
          className="mt-3 w-full text-start text-[5.2rem] font-extralight tracking-tighter text-foreground/80 leading-none max-sm:text-[4.1rem]"
        >
          {avgRating.toFixed(1)}
        </motion.h1>

        <motion.div
          variants={staggerItem}
          className="flex min-w-28 w-full flex-wrap gap-4"
        >
          <div className="flex flex-col justify-between gap-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="rounded-xl text-base shadow-md"
                onClick={onToggleReviewForm}
              >
                {t.add_product_review || "Write a Review"}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                className="rounded-xl border-white/70 bg-white/50 text-base"
                onClick={onToggleQuestionForm}
              >
                {t.add_question || "Ask a Question"}
              </Button>
            </motion.div>
          </div>
          {isReviewsContainImages && (
            <ReviewImageGallery allReviewsImages={allReviewsImages} t={t} />
          )}
        </motion.div>
      </section>
    </motion.section>
  );
};
