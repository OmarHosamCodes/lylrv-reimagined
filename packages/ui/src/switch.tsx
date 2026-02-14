"use client";

import { cn } from "@lylrv/ui";
import { Switch as SwitchPrimitive } from "radix-ui";

export function Switch({
	className,
	...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			className={cn(
				"peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent shadow-xs transition-all duration-300 ease-out outline-none",
				"focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:border-ring",
				"disabled:cursor-not-allowed disabled:opacity-50",
				"data-[state=checked]:bg-primary data-[state=checked]:border-primary/20",
				"data-[state=unchecked]:bg-muted data-[state=unchecked]:border-border",
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className={cn(
					"pointer-events-none block size-4.5 rounded-full ring-0 transition-all duration-300 ease-out",
					"data-[state=checked]:translate-x-[1.25rem] data-[state=unchecked]:translate-x-0.5",
					"data-[state=checked]:bg-primary-foreground data-[state=checked]:shadow-md",
					"data-[state=unchecked]:bg-muted-foreground/60 data-[state=unchecked]:shadow-sm",
					"data-[state=checked]:scale-110 data-[state=unchecked]:scale-100",
				)}
			/>
		</SwitchPrimitive.Root>
	);
}
