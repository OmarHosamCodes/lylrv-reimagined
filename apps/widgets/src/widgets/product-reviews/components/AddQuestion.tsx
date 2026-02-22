import { Button } from "@lylrv/ui/button";
import { Label } from "@lylrv/ui/label";
import { Textarea } from "@lylrv/ui/textarea";
import { motion } from "framer-motion";
import { useState } from "react";
import { staggerContainer, staggerItem } from "@/lib/transitions";

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
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="ly-widget-card rounded-2xl p-5"
    >
      <motion.h3
        variants={staggerItem}
        className="mb-4 text-center font-semibold"
      >
        {t.add_question_page_title || "Ask a Question"}
      </motion.h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <motion.div variants={staggerItem}>
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
            className="w-full rounded-lg"
            rows={4}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || body.trim().length < 3}
          >
            {t.add_question || "Submit Question"}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
