import { z } from "zod/v4";

export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required"),
  title: z.string().max(200, "Title must be 200 characters or less"),
  body: z.string().max(2000, "Review must be 2000 characters or less"),
  images: z
    .instanceof(File)
    .array()
    .max(5, "Maximum 5 images allowed")
    .optional(),
});

export const productReviewFormSchema = z.object({
  rating: z.number().min(1, "Rating is required"),
  title: z.string().max(200, "Title must be 200 characters or less"),
  body: z.string().max(2000, "Review must be 2000 characters or less"),
});

export const submitReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(2000).optional(),
  images: z.instanceof(File).array().max(5).optional(),
  productId: z.number().optional(),
});

export type ReviewFormInput = z.infer<typeof reviewFormSchema>;
export type ProductReviewFormInput = z.infer<typeof productReviewFormSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
