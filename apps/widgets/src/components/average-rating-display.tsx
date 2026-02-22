import { motion } from "framer-motion";
import { transitions } from "../lib/transitions";
import { StarRating } from "./star-rating";
import { cn } from "./utils";

interface AverageRatingDisplayProps {
  avgRating: number;
  className?: string;
}

/**
 * Large average rating display with animated entrance.
 */
export function AverageRatingDisplay({
  avgRating,
  className,
}: AverageRatingDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transitions.spring}
      className={cn(
        // Card shell — replaces .ly-widget-card
        "flex flex-col items-center gap-1 p-4",
        "rounded-2xl border border-white/60 bg-white/70",
        "shadow-[0_18px_35px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm",
        className,
      )}
    >
      <span className="text-5xl font-light text-foreground leading-tight tracking-tight tabular-nums">
        {avgRating.toFixed(1)}
      </span>
      <StarRating rating={Math.round(avgRating)} size="sm" />
    </motion.div>
  );
}
