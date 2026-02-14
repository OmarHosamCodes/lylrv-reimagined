import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { transitions } from "../lib/transitions";
import { cn } from "./utils";

interface FloatingButtonProps {
	onClick: () => void;
	icon: ReactNode;
	label: string;
	badge?: string | number;
	className?: string;
}

/**
 * Floating action button with spring-animated hover and tap feedback.
 * Badge pulses on mount to draw attention.
 */
export function FloatingButton({
	onClick,
	icon,
	label,
	badge,
	className,
}: FloatingButtonProps) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			aria-label={label}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ ...transitions.springBouncy, delay: 0.3 }}
			whileHover={{ scale: 1.08 }}
			whileTap={{ scale: 0.92 }}
			className={cn(
				"relative flex h-14 w-14 items-center justify-center rounded-full",
				"bg-primary text-primary-foreground",
				"shadow-[0_8px_32px_-4px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.1)_inset]",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				"cursor-pointer",
				className,
			)}
		>
			{icon}
			{badge !== undefined && (
				<motion.span
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ ...transitions.springBouncy, delay: 0.6 }}
					className={cn(
						"absolute -right-1 -top-1 flex min-w-5 items-center justify-center",
						"rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground",
						"shadow-sm ring-2 ring-background",
					)}
				>
					{badge}
				</motion.span>
			)}
		</motion.button>
	);
}
