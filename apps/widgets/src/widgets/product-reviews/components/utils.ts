import type { Review } from "@/types";

/**
 * Extract and process all images from reviews
 */
export const getAllReviewsImages = (reviews: Review[]): string[] => {
    const images: string[] = [];
    for (const review of reviews) {
        if (review.images && Array.isArray(review.images)) {
            images.push(...review.images);
        }
    }
    return images;
};

/**
 * Check if reviews contain any images
 */
export const hasReviewImages = (reviews: Review[]): boolean => {
    return getAllReviewsImages(reviews).length > 0;
};

/**
 * Send message to parent window to show images
 */
export const showImagesInParent = (images: string[]): void => {
    // Send to parent window if inside iframe
    if (typeof window !== "undefined") {
        window.parent.postMessage(
            {
                "show-images": {
                    images: images.filter((image) => image.length > 0),
                },
            },
            "*",
        );
    }
};
