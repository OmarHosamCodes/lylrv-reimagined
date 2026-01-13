import { TabNavigation } from "@/components";
import type { Review } from "@/types";
import { useState } from "react";
import type { Question } from "./QuestionCard";
import { QuestionsList } from "./QuestionsList";
import { ReviewsList } from "./ReviewsList";

interface ProductReviewsTabsProps {
	reviews: Review[];
	questions: Question[];
	t: Record<string, string>;
	onImageClick?: (url: string) => void;
	onWriteReview?: () => void;
	questionsLoading?: boolean;
}

export const ProductReviewsTabs = ({
	reviews,
	questions,
	t,
	onImageClick,
	onWriteReview,
	questionsLoading = false,
}: ProductReviewsTabsProps) => {
	const [activeTab, setActiveTab] = useState("reviews");

	const tabs = [
		{
			id: "reviews",
			label: `${t.reviews_tab_title || "Reviews"} (${reviews.length})`,
		},
		{
			id: "questions",
			label: t.questions_tab_title || "Questions",
		},
	];

	return (
		<div className="w-full space-y-4">
			<TabNavigation
				tabs={tabs}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>

			<div className="mt-4">
				{activeTab === "reviews" && (
					<ReviewsList
						reviews={reviews}
						t={t}
						onImageClick={onImageClick}
						onWriteReview={onWriteReview}
					/>
				)}

				{activeTab === "questions" && (
					<>
						{questionsLoading ? (
							<div className="space-y-4">
								<div className="h-20 animate-pulse rounded-md bg-muted" />
								<div className="h-20 animate-pulse rounded-md bg-muted" />
								<div className="h-20 animate-pulse rounded-md bg-muted" />
							</div>
						) : (
							<QuestionsList questions={questions} t={t} />
						)}
					</>
				)}
			</div>
		</div>
	);
};
