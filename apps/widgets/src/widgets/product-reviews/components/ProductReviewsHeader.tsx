import { Button, StarRating } from "@/components";
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
    <section className="flex w-full flex-row items-center justify-between rounded-lg border bg-card p-5 shadow-sm max-sm:p-4">
      <section className="flex w-full flex-col items-start justify-start">
        <div className="flex w-full flex-col items-start justify-start gap-1">
          <h1 className="text-[1.75rem] leading-7 font-bold tracking-tight text-foreground">
            {t.reviews_system_header || "Customer Reviews"}
          </h1>
          <section className="mt-1 inline-flex items-center gap-1 rounded-full border bg-muted/30 px-3 py-1 text-[11px] font-medium text-muted-foreground">
            <StarRating rating={avgRating} />
            <p className="text-xs text-muted-foreground">
              ({totalReviews} {t.total_reviews || "Reviews"})
            </p>
          </section>
        </div>

        <h1 className="mt-3 w-full text-start text-6xl leading-none font-light tracking-tight text-foreground max-sm:text-5xl">
          {avgRating.toFixed(1)}
        </h1>

        <div className="flex min-w-28 w-full flex-wrap gap-4">
          <div className="flex flex-col justify-between gap-2">
            <Button className="text-base" onClick={onToggleReviewForm}>
              {t.add_product_review || "Write a Review"}
            </Button>
            <Button
              variant="outline"
              className="text-base"
              onClick={onToggleQuestionForm}
            >
              {t.add_question || "Ask a Question"}
            </Button>
          </div>
          {isReviewsContainImages && (
            <ReviewImageGallery allReviewsImages={allReviewsImages} t={t} />
          )}
        </div>
      </section>
    </section>
  );
};
