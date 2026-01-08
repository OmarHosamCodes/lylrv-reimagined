import type { Review } from "../types/reviews.types";
import { formatRelativeDate } from "../utils";
import { StarRating } from "./star-rating";
import { cn } from "./utils";

interface ReviewCardProps {
	review: Review;
	onImageClick?: (imageUrl: string) => void;
	className?: string;
}

/**
 * Card displaying a single review
 */
export function ReviewCard({
	review,
	onImageClick,
	className,
}: ReviewCardProps) {
	return (
		<div className={cn("rounded-lg border border-border bg-card p-4", className)}>
			{/* Header: Rating + Verified Badge */}
			<div className="mb-2 flex items-start justify-between">
				<div>
					<StarRating rating={review.rating} size="md" />
					{review.title && (
						<p className="mt-1 font-semibold text-card-foreground">
							{review.title}
						</p>
					)}
				</div>
				{review.verified && (
					<span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
						✓ Verified
					</span>
				)}
			</div>

			{/* Body */}
			{review.body && (
				<p className="text-sm text-muted-foreground">{review.body}</p>
			)}

			{/* Images */}
			{review.images && review.images.length > 0 && (
				<div className="mt-3 flex gap-2">
					{review.images.slice(0, 3).map((img: string, i: number) => (
						<button
							key={i}
							type="button"
							onClick={() => onImageClick?.(img)}
							className="h-16 w-16 overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
						>
							<img
								src={img}
								alt={`Review image ${i + 1}`}
								className="h-full w-full object-cover"
							/>
						</button>
					))}
					{review.images.length > 3 && (
						<span className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
							+{review.images.length - 3}
						</span>
					)}
				</div>
			)}

			{/* Footer: Author + Date */}
			<div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
				<span>{review.author}</span>
				<span>{formatRelativeDate(review.createdAt)}</span>
			</div>
		</div>
	);
}
