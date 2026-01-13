import { StarRating } from "@/components";
import type { WidgetTheme } from "@/types";
import { Button } from "@lylrv/ui/button";
import { ReviewImageGallery } from "./ReviewImageGallery";

interface ProductReviewsHeaderProps {
	avgRating: number;
	totalReviews: number;
	t: Record<string, string>;
	theme: WidgetTheme;
	isReviewsContainImages: boolean;
	allReviewsImages: string[];
	onToggleReviewForm: () => void;
	onToggleQuestionForm: () => void;
}

/**
 * Header component for product reviews page containing rating display and action buttons
 */
export const ProductReviewsHeader = ({
	avgRating,
	totalReviews,
	t,
	theme,
	isReviewsContainImages,
	allReviewsImages,
	onToggleReviewForm,
	onToggleQuestionForm,
}: ProductReviewsHeaderProps) => {
	return (
		<section className="flex w-full flex-row items-center justify-between">
			<section className="flex w-full flex-col items-start justify-start">
				{/* Review Header Part (formerly ReviewHeader variant="page") */}
				<div className="flex w-full flex-col items-start justify-start gap-1">
					<h1 className="text-[1.75rem] font-semibold leading-6">
						{t.reviews_system_header || "Customer Reviews"}
					</h1>
					<section className="flex flex-row items-center gap-2">
						<StarRating rating={avgRating} className="text-yellow-400" />
						<p className="text-base text-muted-foreground">
							({totalReviews} {t.total_reviews || "Reviews"})
						</p>
					</section>
				</div>

				{/* Big Rating Number */}
				<h1 className="mt-3 w-full text-start text-[5.625rem] font-normal tracking-tight text-secondary">
					{avgRating.toFixed(1)}
				</h1>

				{/* Actions and Gallery */}
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
