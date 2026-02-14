import { cn } from "@lylrv/ui";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const badgeVariants = cva(
	"inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium tracking-wide transition-colors select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3",
	{
		variants: {
			variant: {
				default:
					"bg-primary/12 text-primary border border-primary/20 dark:bg-primary/15 dark:border-primary/25",
				secondary:
					"bg-secondary text-secondary-foreground border border-border",
				destructive:
					"bg-destructive/12 text-destructive border border-destructive/20 dark:bg-destructive/15 dark:border-destructive/25",
				outline:
					"border border-border text-foreground/80",
				success:
					"bg-emerald-500/12 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
				warning:
					"bg-amber-500/12 text-amber-700 border border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
				ghost:
					"text-muted-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

export function Badge({
	className,
	variant,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
	return (
		<span
			data-slot="badge"
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	);
}

export { badgeVariants };
