import { cn } from "./utils";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/**
 * Label component for form fields
 */
export function Label({ className, htmlFor, ...props }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "mb-1 block text-sm font-medium text-foreground",
        className,
      )}
      {...props}
    />
  );
}
