import type { ReactNode } from "react";
import { cn } from "./utils";

interface PanelProps {
	children: ReactNode;
	isOpen: boolean;
	position?: "left" | "right";
	isRTL?: boolean;
	className?: string;
}

/**
 * Slide-up panel for widget content
 */
export function Panel({
	children,
	isOpen,
	position = "right",
	isRTL = false,
	className,
}: PanelProps) {
	if (!isOpen) return null;

	// Determine horizontal position based on RTL and position setting
	const horizontalStyle = isRTL
		? position === "right"
			? { left: 0 }
			: { right: 0 }
		: position === "right"
			? { right: 0 }
			: { left: 0 };

	return (
		<div
			className={cn(
				"absolute bottom-16 w-80 overflow-hidden rounded-xl shadow-2xl",
				"bg-card text-card-foreground",
				"animate-in slide-in-from-bottom-4 fade-in duration-200",
				className,
			)}
			style={horizontalStyle}
		>
			{children}
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
