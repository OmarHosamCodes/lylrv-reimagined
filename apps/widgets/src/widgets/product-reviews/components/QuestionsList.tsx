import type { Question } from "./QuestionCard";
import { QuestionCard } from "./QuestionCard";

interface QuestionsListProps {
  questions: Question[];
  t: Record<string, string>;
}

export const QuestionsList = ({ questions, t }: QuestionsListProps) => {
  if (questions.length === 0) {
    return (
      <p className="rounded-lg border bg-card py-6 text-center text-muted-foreground shadow-sm">
        {t.no_questions_yet || "No questions yet"}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {questions.map((question, index) => (
        <QuestionCard key={index.toString()} question={question} t={t} />
      ))}
    </div>
  );
};
