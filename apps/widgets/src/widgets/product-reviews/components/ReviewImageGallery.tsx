import { showImagesInParent } from "./utils";

interface ReviewImageGalleryProps {
  allReviewsImages: string[];
  t: Record<string, string>;
}

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
          <button
            key={index.toString()}
            type="button"
            onClick={handleViewAllImages}
            className="h-20 w-20 shrink-0 overflow-hidden rounded-md border shadow-sm"
          >
            <img
              src={image}
              alt={`Review ${index.toString()}`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}

      <button
        type="button"
        onClick={handleViewAllImages}
        className="flex h-20 w-20 shrink-0 cursor-pointer select-none items-center justify-center rounded-md border bg-background text-sm font-medium"
      >
        {t.view_all || "View All"}
      </button>
    </div>
  );
};
