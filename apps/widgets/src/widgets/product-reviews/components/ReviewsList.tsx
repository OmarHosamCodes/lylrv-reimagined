import { ReviewCard } from "@/components";
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
      <div className="rounded-lg border bg-card py-8 text-center shadow-sm">
        <p className="text-muted-foreground">
          {t.no_reviews_yet || "No reviews yet for this product."}
        </p>
        {onWriteReview && (
          <button
            type="button"
            onClick={onWriteReview}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            {t.be_first_to_review || "Be the first to review"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} onImageClick={onImageClick} />
      ))}
    </div>
  );
};
