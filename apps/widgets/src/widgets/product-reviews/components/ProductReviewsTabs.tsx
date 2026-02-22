import { useState } from "react";
import { TabNavigation } from "@/components";
import type { Review } from "@/types";
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

      <div className="mt-2 rounded-lg border bg-card p-4 shadow-sm">
        {activeTab === "reviews" && (
          <ReviewsList
            reviews={reviews}
            t={t}
            onImageClick={onImageClick}
            onWriteReview={onWriteReview}
          />
        )}

        {activeTab === "questions" &&
          (questionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          ) : (
            <QuestionsList questions={questions} t={t} />
          ))}
      </div>
    </div>
  );
};
