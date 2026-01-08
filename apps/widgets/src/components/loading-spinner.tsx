import { cn } from "./utils";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "h-4 w-4 border",
	md: "h-8 w-8 border-2",
	lg: "h-12 w-12 border-3",
};

/**
 * Loading spinner component
 */
export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
	return (
		<div
			className={cn(
				"animate-spin rounded-full border-muted",
				"border-t-primary",
				sizeClasses[size],
				className,
			)}
		/>
	);
}

interface LoadingStateProps {
	className?: string;
}

/**
 * Full loading state with centered spinner
 */
export function LoadingState({ className }: LoadingStateProps) {
	return (
		<div className={cn("flex items-center justify-center py-8", className)}>
			<LoadingSpinner />
		</div>
	);
}
