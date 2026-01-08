import { cn } from "./utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> { }

/**
 * Input component for widgets
 */
export function Input({ className, type, ...props }: InputProps) {
	return (
		<input
			type={type}
			className={cn(
				"h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm",
				"placeholder:text-muted-foreground",
				"focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				className,
			)}
			{...props}
		/>
	);
}

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

/**
 * Textarea component for widgets
 */
export function Textarea({ className, ...props }: TextareaProps) {
	return (
		<textarea
			className={cn(
				"w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm",
				"placeholder:text-muted-foreground",
				"focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"resize-none",
				className,
			)}
			{...props}
		/>
	);
}
