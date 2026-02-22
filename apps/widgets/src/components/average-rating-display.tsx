import { StarRating } from "./star-rating";
import { cn } from "./utils";

interface AverageRatingDisplayProps {
  avgRating: number;
  className?: string;
}

export function AverageRatingDisplay({
  avgRating,
  className,
}: AverageRatingDisplayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 p-4",
        "rounded-lg border bg-card shadow-sm",
        className,
      )}
    >
      <span className="text-5xl font-light text-foreground leading-tight tracking-tight tabular-nums">
        {avgRating.toFixed(1)}
      </span>
      <StarRating rating={Math.round(avgRating)} size="sm" />
    </div>
  );
}
