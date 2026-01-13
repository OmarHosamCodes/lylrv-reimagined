import type { Question } from "./QuestionCard";
import { QuestionCard } from "./QuestionCard";

interface QuestionsListProps {
	questions: Question[];
	t: Record<string, string>;
}

export const QuestionsList = ({ questions, t }: QuestionsListProps) => {
	if (questions.length === 0) {
		return (
			<p className="py-4 text-center text-muted-foreground">
				{t.no_questions_yet || "No questions yet"}
			</p>
		);
	}

	return (
		<div className="space-y-2">
			{questions.map((question, index) => (
				<QuestionCard key={index.toString()} question={question} t={t} />
			))}
		</div>
	);
};
