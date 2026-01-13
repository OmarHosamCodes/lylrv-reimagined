import { cn } from "./utils";

interface RatingDistributionProps {
	distribution: number[];
	total: number;
	className?: string;
}

/**
 * Rating distribution bars (5 to 1 stars) with animated progress
 */
export function RatingDistribution({
	distribution,
	total,
	className,
}: RatingDistributionProps) {
	return (
		<div className={cn("space-y-1.5", className)}>
			{[5, 4, 3, 2, 1].map((rating, index) => {
				const count = distribution[rating - 1] || 0;
				const percentage = total > 0 ? (count / total) * 100 : 0;
				const animationDelay = `${index * 100}ms`;

				return (
					<button
						key={rating}
						type="button"
						className="flex w-full items-center gap-2 text-xs transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded"
					>
						<span className="w-3 text-muted-foreground font-medium">
							{rating}
						</span>
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all ease-out"
								style={{
									width: `${percentage}%`,
									transitionDuration: "800ms",
									transitionDelay: animationDelay,
								}}
							/>
						</div>
						<span className="w-8 text-right text-muted-foreground tabular-nums">
							{count}
						</span>
					</button>
				);
			})}
		</div>
	);
}
