import { motion } from "framer-motion";
import { transitions } from "@/lib/transitions";
import { showImagesInParent } from "./utils";

interface ReviewImageGalleryProps {
  allReviewsImages: string[];
  t: Record<string, string>;
}

/**
 * Review images gallery with hover animations
 */
export const ReviewImageGallery = ({
  allReviewsImages,
  t,
}: ReviewImageGalleryProps) => {
  const handleViewAllImages = () => {
    showImagesInParent(allReviewsImages);
  };

  if (allReviewsImages.length === 0) {
    return null;
  }

  return (
    <div className="flex max-h-20 flex-row gap-1.5 overflow-x-scroll">
      {allReviewsImages
        .filter((image) => image.length > 0)
        .slice(0, 3)
        .map((image, index) => (
          <motion.button
            key={index.toString()}
            type="button"
            onClick={handleViewAllImages}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={transitions.springStiff}
            className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40"
          >
            <img
              src={image}
              alt={`Review ${index.toString()}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </motion.button>
        ))}

      <motion.button
        type="button"
        onClick={handleViewAllImages}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={transitions.springStiff}
        className="flex h-20 w-20 flex-shrink-0 cursor-pointer select-none items-center justify-center rounded-xl bg-secondary text-white text-sm font-medium"
      >
        {t.view_all || "View All"}
      </motion.button>
    </div>
  );
};
