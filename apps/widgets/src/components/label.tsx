import { cn } from "./utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * Label component for form fields
 */
export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "mb-1 block text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}
