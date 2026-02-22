import { cn } from "./utils";

interface RatingDistributionProps {
  distribution: number[];
  total: number;
  className?: string;
}

export function RatingDistribution({
  distribution,
  total,
  className,
}: RatingDistributionProps) {
  return (
    <div
      className={cn(
        "space-y-1.5 p-3",
        "rounded-lg border bg-card shadow-sm",
        className,
      )}
    >
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating - 1] || 0;
        const percentage = total > 0 ? (count / total) * 100 : 0;

        return (
          <button
            key={rating}
            type="button"
            className="flex w-full items-center gap-2 text-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 rounded"
          >
            <span className="w-3 text-muted-foreground font-medium tabular-nums">
              {rating}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-brand-amber"
                style={{ width: `${percentage}%` }}
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
