import { cn } from "./utils";

interface StarRatingProps {
	rating: number;
	size?: "sm" | "md" | "lg";
	interactive?: boolean;
	onRate?: (rating: number) => void;
	className?: string;
}

const sizeClasses = {
	sm: "h-4 w-4",
	md: "h-5 w-5",
	lg: "h-6 w-6",
};

/**
 * Star rating display/input component
 */
export function StarRating({
	rating,
	size = "sm",
	interactive = false,
	onRate,
	className,
}: StarRatingProps) {
	const sizeClass = sizeClasses[size];

	return (
		<div className={cn("flex gap-0.5", className)}>
			{[1, 2, 3, 4, 5].map((star) => {
				const isFilled = star <= rating;
				const StarComponent = interactive ? "button" : "span";

				return (
					<StarComponent
						key={star}
						type={interactive ? "button" : undefined}
						onClick={interactive ? () => onRate?.(star) : undefined}
						disabled={!interactive}
						className={cn(
							interactive
								? "cursor-pointer transition-transform hover:scale-110 focus:outline-none"
								: "cursor-default",
						)}
						aria-label={interactive ? `Rate ${star} stars` : undefined}
					>
						<svg
							className={cn(
								sizeClass,
								"transition-colors",
								isFilled ? "text-yellow-400" : "text-muted-foreground/30",
							)}
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
					</StarComponent>
				);
			})}
		</div>
	);
}

/**
 * Single star icon for use in badges/buttons
 */
export function StarIcon({ className }: { className?: string }) {
	return (
		<svg
			className={cn("h-5 w-5", className)}
			fill="currentColor"
			viewBox="0 0 20 20"
		>
			<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
		</svg>
	);
}
