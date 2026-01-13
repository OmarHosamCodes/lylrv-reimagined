import { showImagesInParent } from "./utils";

interface ReviewImageGalleryProps {
	allReviewsImages: string[];
	t: Record<string, string>;
}

/**
 * Component for displaying review images gallery with view all functionality
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
		<div className="flex max-h-20 flex-row gap-1 overflow-x-scroll">
			{allReviewsImages
				.filter((image) => image.length > 0)
				.slice(0, 3)
				.map((image, index) => (
					/* biome-ignore lint/a11y/useKeyWithClickEvents: simple click handler */
					<img
						key={index.toString()}
						src={image}
						alt={`Review ${index.toString()}`}
						className="h-20 w-20 cursor-pointer rounded-lg object-cover"
						loading="lazy"
						onClick={handleViewAllImages}
					/>
				))}

			<div
				className="flex h-20 w-20 cursor-pointer select-none items-center justify-center rounded-lg bg-secondary text-white"
				onClick={handleViewAllImages}
				role="button"
				tabIndex={0}
				onKeyUp={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleViewAllImages();
					}
				}}
			>
				{t.view_all || "View All"}
			</div>
		</div>
	);
};
