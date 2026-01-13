import { formatRelativeDate } from "@/utils";

export interface Question {
	id: string;
	author: string;
	body: string;
	answer: string | null;
	createdAt: string;
}

interface QuestionCardProps {
	question: Question;
	t: Record<string, string>;
}

export const QuestionCard = ({ question, t }: QuestionCardProps) => {
	const formattedAuthor = question.author;

	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<div className="relative mb-2 flex flex-row items-start justify-between">
				<div className="flex flex-row items-center justify-start gap-2">
					<img
						src={`https://avatar.iran.liara.run/username?username=${encodeURIComponent(question.author)}`}
						alt={formattedAuthor}
						className="h-10 w-10 rounded-full bg-muted object-cover"
					/>
					<div className="flex flex-col items-start justify-start">
						<h1 className="text-base font-bold text-card-foreground">
							{formattedAuthor}
						</h1>
						<p className="text-xs text-muted-foreground">
							{formatRelativeDate(question.createdAt)}
						</p>
					</div>
				</div>
			</div>
			<div className="flex flex-col gap-2">
				<h3 className="wrap-break-word text-lg font-semibold text-card-foreground">
					{question.body}
				</h3>
				<p className="wrap-break-word text-sm text-muted-foreground">
					{question.answer
						? question.answer
						: t.no_answer_yet || "No answer yet"}
				</p>
			</div>
		</div>
	);
};
