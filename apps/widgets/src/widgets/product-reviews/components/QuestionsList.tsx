import { motion } from "framer-motion";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import type { Question } from "./QuestionCard";
import { QuestionCard } from "./QuestionCard";

interface QuestionsListProps {
  questions: Question[];
  t: Record<string, string>;
}

export const QuestionsList = ({ questions, t }: QuestionsListProps) => {
  if (questions.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={transitions.smooth}
        className="rounded-2xl border border-white/60 bg-white/70 shadow-[0_18px_35px_-28px_rgba(0,0,0,0.95)] backdrop-blur-sm py-6 text-center text-muted-foreground"
      >
        {t.no_questions_yet || "No questions yet"}
      </motion.p>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      {questions.map((question, index) => (
        <motion.div key={index.toString()} variants={staggerItem}>
          <QuestionCard question={question} t={t} />
        </motion.div>
      ))}
    </motion.div>
  );
};
