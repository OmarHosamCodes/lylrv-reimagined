import { motion } from "framer-motion";
import { useState } from "react";
import { transitions } from "../lib/transitions";
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
  lg: "h-7 w-7",
};

const StarSvg = ({
  isFilled,
  sizeClass,
}: {
  isFilled: boolean;
  sizeClass: string;
}) => (
  <motion.svg
    className={cn(sizeClass, "transition-colors duration-200")}
    fill="currentColor"
    viewBox="0 0 20 20"
    animate={{
      color: isFilled
        ? "color-mix(in oklch, var(--color-brand-amber) 85%, #f5b84a)"
        : "var(--color-muted-foreground)",
    }}
    transition={transitions.snappy}
    aria-hidden
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </motion.svg>
);

/**
 * Star rating with animated fill on hover/select.
 * Interactive mode uses spring animations for satisfying feedback.
 */
export function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onRate,
  className,
}: StarRatingProps) {
  const sizeClass = sizeClasses[size];
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  if (interactive) {
    return (
      <fieldset
        className={cn("flex gap-0.5 border-none p-0 m-0", className)}
        onMouseLeave={() => setHoverRating(0)}
      >
        <legend className="sr-only">Rating</legend>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayRating;
          return (
            <motion.button
              key={star}
              type="button"
              onClick={() => onRate?.(star)}
              onMouseEnter={() => setHoverRating(star)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              transition={transitions.springStiff}
              className="cursor-pointer focus:outline-none"
              aria-label={`Rate ${star} stars`}
            >
              <StarSvg isFilled={isFilled} sizeClass={sizeClass} />
            </motion.button>
          );
        })}
      </fieldset>
    );
  }

  return (
    <div
      role="img"
      aria-label={`${rating} out of 5 stars`}
      className={cn("flex gap-0.5", className)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <span key={star}>
            <StarSvg isFilled={isFilled} sizeClass={sizeClass} />
          </span>
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
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}
