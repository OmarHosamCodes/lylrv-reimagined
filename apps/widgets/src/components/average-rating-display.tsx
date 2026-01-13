import { StarRating } from "./star-rating";
import { cn } from "./utils";

interface AverageRatingDisplayProps {
	avgRating: number;
	className?: string;
}

/**
 * Large average rating display with number and star rating
 */
export function AverageRatingDisplay({
	avgRating,
	className,
}: AverageRatingDisplayProps) {
	return (
		<div className={cn("flex flex-col items-center", className)}>
			<span className="text-5xl font-light text-foreground/80 leading-tight tracking-tight">
				{avgRating.toFixed(1)}
			</span>
			<StarRating rating={Math.round(avgRating)} size="sm" />
		</div>
	);
}
