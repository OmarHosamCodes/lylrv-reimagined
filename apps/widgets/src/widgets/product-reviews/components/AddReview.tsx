import { CameraIcon } from "lucide-react";
import { Button, Input, Label, StarRating, Textarea } from "@/components";
import type { ReviewFormData } from "@/types";

interface AddReviewProps {
  t: Record<string, string>;
  isLoggedIn: boolean;
  hasPurchased: boolean;
  reviewPoints: number;
  reviewWithImagesPoints: number;
  formData: ReviewFormData;
  canSubmit: boolean;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onInputChange: (field: "title" | "body", value: string) => void;
  onAddImages: (files: FileList | null) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const AddReview = ({
  t,
  isLoggedIn,
  hasPurchased,
  reviewPoints,
  reviewWithImagesPoints,
  formData,
  canSubmit,
  isSubmitting,
  onRatingChange,
  onInputChange,
  onAddImages,
  onRemoveImage,
  onSubmit,
  onCancel,
}: AddReviewProps) => {
  if (!isLoggedIn) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
        <p className="mb-4 text-sm text-muted-foreground">
          {t.sign_in || "Sign in"} to write a review
        </p>
        <Button>{t.sign_in || "Sign In"}</Button>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          Only verified purchasers can write reviews.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-5 shadow-sm">
      <h3 className="font-semibold text-foreground">
        {t.add_product_review_page_title || "Write a Product Review"}
      </h3>

      <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        <span className="font-medium">
          {t.you_will_gain || "You'll earn"} {" "}
          <strong>
            {reviewPoints}-{reviewWithImagesPoints}
          </strong>{" "}
          {t.points || "points"}!
        </span>
      </div>

      <div>
        <Label>Rating *</Label>
        <div className="mt-1.5">
          <StarRating
            rating={formData.rating}
            size="lg"
            interactive
            onRate={onRatingChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="review-title">
          {t.add_product_review_title || "Review Title"}
        </Label>
        <Input
          id="review-title"
          value={formData.title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onInputChange("title", e.target.value)
          }
          placeholder="Summarize your experience"
        />
      </div>

      <div>
        <Label htmlFor="review-body">
          {t.add_product_review_body || "Your Review"}
        </Label>
        <Textarea
          id="review-body"
          value={formData.body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onInputChange("body", e.target.value)
          }
          rows={4}
          placeholder="Tell others about your experience with this product..."
        />
      </div>

      <div>
        <Label>
          {t.add_product_review_images || "Add Photos"} (+
          {reviewWithImagesPoints - reviewPoints} pts)
        </Label>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed bg-muted/30 px-4 py-3 text-center transition-colors hover:bg-muted/40">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onAddImages(e.target.files)}
            />
            <CameraIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Add Photos</span>
          </label>
          {formData.images.map((file, i) => (
            <div key={i} className="relative h-14 w-14">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full rounded-md object-cover ring-1 ring-border"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground shadow-sm"
              >
                x
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={!canSubmit} className="flex-1">
          {isSubmitting ? "Submitting..." : t.write_review || "Submit Review"}
        </Button>
      </div>
    </div>
  );
};
