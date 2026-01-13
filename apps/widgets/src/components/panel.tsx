import type { ReactNode } from "react";
import { cn } from "./utils";

interface PanelProps {
	children: ReactNode;
	isOpen: boolean;
	onClose?: () => void;
	className?: string;
}

/**
 * Centered dialog panel with backdrop overlay
 */
export function Panel({ children, isOpen, onClose, className }: PanelProps) {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[10000] flex items-center justify-center">
			{/* Backdrop overlay */}
			<div
				className="fixed inset-0 bg-black/50 animate-in fade-in duration-200"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose?.()}
				role="button"
				tabIndex={0}
				aria-label="Close dialog"
			/>
			{/* Dialog content */}
			<div
				className={cn(
					"relative z-10 w-80 overflow-hidden rounded-xl shadow-2xl",
					"bg-card text-card-foreground",
					"animate-in slide-in-from-bottom-4 fade-in duration-200",
					className,
				)}
			>
				{children}
			</div>
		</div>
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
		<div className={cn("border-t border-border p-2 text-center", className)}>
			{children}
		</div>
	);
}
