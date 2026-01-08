import type { ReactNode } from "react";
import { cn } from "./utils";

interface FloatingButtonProps {
	onClick: () => void;
	icon: ReactNode;
	label: string;
	badge?: string | number;
	className?: string;
}

/**
 * Floating action button for widget triggers
 */
export function FloatingButton({
	onClick,
	icon,
	label,
	badge,
	className,
}: FloatingButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			className={cn(
				"relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg",
				"bg-primary text-primary-foreground",
				"transition-transform hover:scale-105 active:scale-95",
				"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				className,
			)}
		>
			{icon}
			{badge !== undefined && (
				<span
					className={cn(
						"absolute -right-1 -top-1 flex min-w-5 items-center justify-center",
						"rounded-full bg-accent px-1.5 py-0.5 text-xs font-bold text-accent-foreground",
						"shadow-sm",
					)}
				>
					{badge}
				</span>
			)}
		</button>
	);
}
