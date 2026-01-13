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
 * Card displaying a single review with avatar, author info, and rating
 */
export function ReviewCard({
	review,
	onImageClick,
	className,
}: ReviewCardProps) {
	// Format author name (truncate if too long, extract from email if needed)
	const formattedAuthor = (() => {
		const authorName = review.author.includes("@")
			? review.author.split("@")[0]
			: review.author;
		return authorName.length > 20
			? `${authorName.slice(0, 15)}...`
			: authorName;
	})();

	return (
		<div
			className={cn(
				"rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:shadow-sm hover:bg-muted/30",
				className,
			)}
		>
			{/* Header: Avatar + Author Info + Rating */}
			<div className="relative mb-3 flex items-start justify-between">
				{/* Left side: Avatar + Author + Date */}
				<div className="flex items-start gap-3">
					{/* Avatar */}
					<img
						src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(review.author)}`}
						alt={formattedAuthor}
						className="h-10 w-10 flex-shrink-0 rounded-full bg-muted"
					/>
					<div className="flex flex-col min-w-0">
						<div className="flex items-center gap-1.5">
							<span className="font-semibold text-card-foreground truncate">
								{formattedAuthor}
							</span>
							{review.verified && (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-4 w-4 flex-shrink-0 text-blue-500"
									aria-label="Verified Review"
								>
									<path
										fillRule="evenodd"
										d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
										clipRule="evenodd"
									/>
								</svg>
							)}
						</div>
						<span className="text-xs text-muted-foreground">
							{formatRelativeDate(review.createdAt)}
						</span>
					</div>
				</div>

				{/* Right side: Star Rating */}
				<div className="flex-shrink-0">
					<StarRating rating={review.rating} size="md" />
				</div>
			</div>

			{/* Title */}
			{review.title && (
				<h3 className="mb-1 text-base font-semibold text-card-foreground break-words">
					{review.title}
				</h3>
			)}

			{/* Body */}
			{review.body && (
				<p className="text-sm leading-relaxed text-muted-foreground break-words">
					{review.body}
				</p>
			)}

			{/* Images */}
			{review.images && review.images.length > 0 && (
				<div className="mt-3 flex gap-2 overflow-x-auto">
					{review.images.slice(0, 3).map((img: string, i: number) => (
						<button
							key={i}
							type="button"
							onClick={() => onImageClick?.(img)}
							className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
						>
							<img
								src={img}
								alt={`Review image ${i + 1}`}
								className="h-full w-full object-cover"
							/>
						</button>
					))}
					{review.images.length > 3 && (
						<span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs text-muted-foreground">
							+{review.images.length - 3}
						</span>
					)}
				</div>
			)}
		</div>
	);
}
