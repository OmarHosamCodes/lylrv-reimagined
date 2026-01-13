import { Button } from "@lylrv/ui/button";
import { Label } from "@lylrv/ui/label";
import { Textarea } from "@lylrv/ui/textarea";
import { useState } from "react";

interface AddQuestionProps {
	t: Record<string, string>;
	onSubmit: (body: string) => void;
	isLoading?: boolean;
}

export const AddQuestion = ({
	t,
	onSubmit,
	isLoading = false,
}: AddQuestionProps) => {
	const [body, setBody] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (body.trim().length >= 3) {
			onSubmit(body);
			setBody("");
		}
	};

	return (
		<div className="rounded-lg border border-border bg-card p-4">
			<h3 className="mb-4 text-center font-semibold">
				{t.add_question_page_title || "Ask a Question"}
			</h3>
			<form onSubmit={handleSubmit} className="flex flex-col gap-3">
				<Label htmlFor="question-body">
					{t.add_question_body || "Your Question"}
				</Label>
				<Textarea
					id="question-body"
					value={body}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
						setBody(e.target.value)
					}
					placeholder={
						t.add_question_placeholder || "What would you like to know?"
					}
					className="w-full rounded"
					rows={4}
				/>
				<Button
					type="submit"
					className="w-full"
					disabled={isLoading || body.trim().length < 3}
				>
					{t.add_question || "Submit Question"}
				</Button>
			</form>
		</div>
	);
};
