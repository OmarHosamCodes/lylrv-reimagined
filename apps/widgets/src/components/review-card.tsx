import { motion } from "framer-motion";
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
 * Review card with subtle hover lift and animated image gallery.
 */
export function ReviewCard({
  review,
  onImageClick,
  className,
}: ReviewCardProps) {
  const formattedAuthor = (() => {
    const authorName = review.author.includes("@")
      ? review.author.split("@")[0]
      : review.author;
    const name = authorName ?? "";
    return name.length > 20 ? `${name.slice(0, 15)}...` : name;
  })();

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "rounded-xl border border-border/60 bg-card p-4",
        "transition-shadow duration-300 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]",
        className,
      )}
    >
      {/* Header: Avatar + Author Info + Rating */}
      <div className="relative mb-3 flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Avatar with ring */}
          <img
            src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(review.author)}`}
            alt={`${formattedAuthor}'s avatar`}
            className="h-10 w-10 flex-shrink-0 rounded-full bg-muted ring-2 ring-border/40"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-card-foreground truncate text-[0.9rem]">
                {formattedAuthor}
              </span>
              {review.verified && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 flex-shrink-0 text-blue-500"
                  aria-label="Verified"
                  role="img"
                >
                  <title>Verified Review</title>
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">
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
        <h3
          className="mb-1.5 text-[0.95rem] font-semibold text-card-foreground break-words leading-snug"
          title={review.title}
        >
          {review.title}
        </h3>
      )}

      {/* Body */}
      {review.body && (
        <p className="text-sm leading-relaxed text-muted-foreground break-words">
          {review.body}
        </p>
      )}

      {/* Images with hover scale */}
      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {review.images.slice(0, 3).map((img: string, i: number) => (
            <motion.button
              key={i}
              type="button"
              onClick={() => onImageClick?.(img)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-border/60"
            >
              <img
                src={img}
                alt={`Review ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </motion.button>
          ))}
          {review.images.length > 3 && (
            <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted text-xs font-medium text-muted-foreground">
              +{review.images.length - 3}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
