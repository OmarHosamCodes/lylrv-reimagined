import { Button } from "@lylrv/ui/button";
import { motion } from "framer-motion";
import { StarRating } from "@/components";
import { staggerContainer, staggerItem, transitions } from "@/lib/transitions";
import type { WidgetTheme } from "@/types";
import { ReviewImageGallery } from "./ReviewImageGallery";

interface ProductReviewsHeaderProps {
	avgRating: number;
	totalReviews: number;
	t: Record<string, string>;
	theme: WidgetTheme;
	isReviewsContainImages: boolean;
	allReviewsImages: string[];
	onToggleReviewForm: () => void;
	onToggleQuestionForm: () => void;
}

/**
 * Header for product reviews — large rating number with staggered entrance
 */
export const ProductReviewsHeader = ({
	avgRating,
	totalReviews,
	t,
	theme,
	isReviewsContainImages,
	allReviewsImages,
	onToggleReviewForm,
	onToggleQuestionForm,
}: ProductReviewsHeaderProps) => {
	return (
		<motion.section
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="flex w-full flex-row items-center justify-between"
		>
			<section className="flex w-full flex-col items-start justify-start">
				{/* Review Header */}
				<motion.div
					variants={staggerItem}
					className="flex w-full flex-col items-start justify-start gap-1"
				>
					<h1 className="text-[1.75rem] font-bold leading-7 tracking-tight">
						{t.reviews_system_header || "Customer Reviews"}
					</h1>
					<section className="flex flex-row items-center gap-2">
						<StarRating rating={avgRating} className="text-yellow-400" />
						<p className="text-base text-muted-foreground">
							({totalReviews} {t.total_reviews || "Reviews"})
						</p>
					</section>
				</motion.div>

				{/* Big Rating Number — dramatic entrance */}
				<motion.h1
					variants={{
						hidden: { opacity: 0, scale: 0.8, y: 20 },
						visible: {
							opacity: 1,
							scale: 1,
							y: 0,
							transition: { ...transitions.springBouncy, delay: 0.15 },
						},
					}}
					className="mt-3 w-full text-start text-[5.625rem] font-extralight tracking-tighter text-secondary leading-none"
				>
					{avgRating.toFixed(1)}
				</motion.h1>

				{/* Actions and Gallery */}
				<motion.div
					variants={staggerItem}
					className="flex min-w-28 w-full flex-wrap gap-4"
				>
					<div className="flex flex-col justify-between gap-2">
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button className="text-base" onClick={onToggleReviewForm}>
								{t.add_product_review || "Write a Review"}
							</Button>
						</motion.div>
						<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
							<Button
								variant="outline"
								className="text-base"
								onClick={onToggleQuestionForm}
							>
								{t.add_question || "Ask a Question"}
							</Button>
						</motion.div>
					</div>
					{isReviewsContainImages && (
						<ReviewImageGallery allReviewsImages={allReviewsImages} t={t} />
					)}
				</motion.div>
			</section>
		</motion.section>
	);
};
