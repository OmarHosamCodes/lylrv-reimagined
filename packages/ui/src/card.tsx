import { cn } from "@lylrv/ui";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card"
			className={cn(
				"bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-sm transition-shadow duration-300 hover:shadow-md",
				className,
			)}
			{...props}
		/>
	);
}

export function CardHeader({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-header"
			className={cn("flex flex-col gap-1.5 px-6 pt-6 pb-0", className)}
			{...props}
		/>
	);
}

export function CardTitle({
	className,
	...props
}: React.ComponentProps<"h3">) {
	return (
		<h3
			data-slot="card-title"
			className={cn(
				"text-lg leading-tight font-semibold tracking-tight",
				className,
			)}
			{...props}
		/>
	);
}

export function CardDescription({
	className,
	...props
}: React.ComponentProps<"p">) {
	return (
		<p
			data-slot="card-description"
			className={cn("text-muted-foreground text-sm", className)}
			{...props}
		/>
	);
}

export function CardContent({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-content"
			className={cn("px-6 py-4", className)}
			{...props}
		/>
	);
}

export function CardFooter({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="card-footer"
			className={cn("flex items-center px-6 pt-0 pb-6", className)}
			{...props}
		/>
	);
}

export function GlassCard({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="glass-card"
			className={cn(
				"relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-xl transition-all duration-300",
				"before:pointer-events-none before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/10 before:via-transparent before:to-transparent before:opacity-60",
				"hover:border-white/20 hover:bg-white/[0.07] hover:shadow-xl",
				className,
			)}
			{...props}
		/>
	);
}

export function StatCard({
	title,
	value,
	description,
	icon,
	trend,
	className,
}: {
	title: string;
	value: string;
	description?: string;
	icon?: React.ReactNode;
	trend?: { value: string; positive: boolean };
	className?: string;
}) {
	return (
		<Card className={cn("group", className)}>
			<CardContent className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex flex-col gap-1">
						<span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
							{title}
						</span>
						<span className="text-foreground text-3xl font-bold tracking-tight">
							{value}
						</span>
						{description && (
							<span className="text-muted-foreground mt-0.5 text-sm">
								{description}
							</span>
						)}
						{trend && (
							<span
								className={cn(
									"mt-1 inline-flex items-center gap-1 text-xs font-medium",
									trend.positive ? "text-emerald-500" : "text-red-400",
								)}
							>
								<svg
									width="12"
									height="12"
									viewBox="0 0 12 12"
									fill="none"
									className={cn(!trend.positive && "rotate-180")}
								>
									<path
										d="M6 2.5L9.5 6.5H2.5L6 2.5Z"
										fill="currentColor"
									/>
								</svg>
								{trend.value}
							</span>
						)}
					</div>
					{icon && (
						<div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
							{icon}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
