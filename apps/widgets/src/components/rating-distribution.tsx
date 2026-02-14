import { motion } from "framer-motion";
import { staggerContainer, transitions } from "../lib/transitions";
import { cn } from "./utils";

interface RatingDistributionProps {
	distribution: number[];
	total: number;
	className?: string;
}

/**
 * Rating distribution bars with staggered entrance animation.
 * Bars fill progressively with spring physics.
 */
export function RatingDistribution({
	distribution,
	total,
	className,
}: RatingDistributionProps) {
	return (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className={cn("space-y-1.5", className)}
		>
			{[5, 4, 3, 2, 1].map((rating, index) => {
				const count = distribution[rating - 1] || 0;
				const percentage = total > 0 ? (count / total) * 100 : 0;

				return (
					<motion.button
						key={rating}
						type="button"
						variants={{
							hidden: { opacity: 0, x: -8 },
							visible: {
								opacity: 1,
								x: 0,
								transition: { ...transitions.spring, delay: index * 0.05 },
							},
						}}
						whileHover={{ scale: 1.02 }}
						transition={transitions.snappy}
						className="flex w-full items-center gap-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded"
					>
						<span className="w-3 text-muted-foreground font-medium tabular-nums">
							{rating}
						</span>
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted/80">
							<motion.div
								className="h-full rounded-full bg-primary"
								initial={{ width: 0 }}
								animate={{ width: `${percentage}%` }}
								transition={{
									...transitions.spring,
									delay: 0.2 + index * 0.08,
								}}
							/>
						</div>
						<span className="w-8 text-right text-muted-foreground tabular-nums">
							{count}
						</span>
					</motion.button>
				);
			})}
		</motion.div>
	);
}
