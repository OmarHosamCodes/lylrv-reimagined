export interface Review {
	id: string;
	author: string;
	rating: number;
	title: string | null;
	body: string | null;
	images: string[] | null;
	verified: boolean;
	createdAt: string;
	type?: string;
}

export interface ReviewsMeta {
	total: number;
	averageRating: number;
	ratingDistribution: number[];
}

export interface ReviewFormData {
	rating: number;
	title: string;
	body: string;
	images: File[];
}

export type ReviewsTab = "reviews" | "questions" | "write";
