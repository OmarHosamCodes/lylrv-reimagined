import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { TabNavigation } from "@/components";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
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

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={transitions.smooth}
          className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_18px_35px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm mt-2 p-4"
        >
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
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {[1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    variants={staggerItem}
                    className="h-20 rounded-xl bg-muted/60 animate-pulse"
                  />
                ))}
              </motion.div>
            ) : (
              <QuestionsList questions={questions} t={t} />
            ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
