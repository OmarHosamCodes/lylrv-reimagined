import { cn } from "./utils";

interface RatingDistributionProps {
	distribution: number[];
	total: number;
	className?: string;
}

/**
 * Rating distribution bars (5 to 1 stars)
 */
export function RatingDistribution({
	distribution,
	total,
	className,
}: RatingDistributionProps) {
	return (
		<div className={cn("space-y-1", className)}>
			{[5, 4, 3, 2, 1].map((rating) => {
				const count = distribution[rating - 1] || 0;
				const percentage = total > 0 ? (count / total) * 100 : 0;

				return (
					<div key={rating} className="flex items-center gap-2 text-xs">
						<span className="w-3 text-muted-foreground">{rating}</span>
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all duration-300"
								style={{ width: `${percentage}%` }}
							/>
						</div>
						<span className="w-6 text-right text-muted-foreground">
							{count}
						</span>
					</div>
				);
			})}
		</div>
	);
}
