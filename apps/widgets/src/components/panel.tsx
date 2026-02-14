import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { transitions } from "../lib/transitions";
import { cn } from "./utils";

interface PanelProps {
	children: ReactNode;
	isOpen: boolean;
	onClose?: () => void;
	className?: string;
}

/**
 * Centered dialog panel with animated backdrop overlay.
 * Uses spring physics for a premium-feeling open/close.
 */
export function Panel({ children, isOpen, onClose, className }: PanelProps) {
	return (
		<AnimatePresence mode="wait">
			{isOpen && (
				<div className="fixed inset-0 z-[10000] flex items-center justify-center">
					{/* Backdrop overlay with blur */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={transitions.smooth}
						className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
						onClick={onClose}
						onKeyDown={(e) => e.key === "Escape" && onClose?.()}
						role="button"
						tabIndex={0}
						aria-label="Close dialog"
					/>
					{/* Dialog content — spring-animated entrance */}
					<motion.div
						initial={{ opacity: 0, scale: 0.94, y: 24 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.96, y: 12 }}
						transition={transitions.spring}
						className={cn(
							"relative z-10 w-80 overflow-hidden rounded-2xl",
							"bg-card text-card-foreground",
							"shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)]",
							className,
						)}
					>
						{children}
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
}

interface PanelHeaderProps {
	children: ReactNode;
	className?: string;
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
	return (
		<div
			className={cn(
				"bg-primary p-4 text-center text-primary-foreground",
				className,
			)}
		>
			{children}
		</div>
	);
}

interface PanelContentProps {
	children: ReactNode;
	className?: string;
}

export function PanelContent({ children, className }: PanelContentProps) {
	return (
		<div className={cn("max-h-80 overflow-y-auto p-4", className)}>
			{children}
		</div>
	);
}

interface PanelFooterProps {
	children: ReactNode;
	className?: string;
}

export function PanelFooter({ children, className }: PanelFooterProps) {
	return (
		<div
			className={cn("border-t border-border/50 p-2.5 text-center", className)}
		>
			{children}
		</div>
	);
}
