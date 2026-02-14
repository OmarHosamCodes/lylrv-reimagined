import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { useTRPC } from "~/lib/trpc";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard/reviews")({
	component: ReviewsPage,
});

function ReviewsPage() {
	const trpc = useTRPC();
	const { activeClientId } = useActiveClient();
	const reviewsQuery = useQuery(
		trpc.dashboard.reviews.queryOptions({
			clientId: activeClientId,
			limit: 100,
		}),
	);

	const rows = reviewsQuery.data?.rows ?? [];

	return (
		<div className="flex flex-col gap-5">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Product and website reviews captured in the backend schema.
				</p>
			</div>

			<div className="space-y-3">
				{rows.length ? (
					rows.map((row) => (
						<div key={row.id} className="rounded-xl border bg-card p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-semibold">
										{row.title ?? "Untitled review"}
									</p>
									<p className="text-xs text-muted-foreground">
										{row.author ?? row.email ?? "Anonymous"} - {row.type}
									</p>
								</div>
								<div className="text-right text-sm">
									<p className="font-semibold">{row.rating ?? "0"}/5</p>
									<p className="text-xs text-muted-foreground">
										{formatDate(row.createdAt)}
									</p>
								</div>
							</div>
							<p className="mt-3 text-sm text-muted-foreground">
								{row.body ?? "No review body"}
							</p>
						</div>
					))
				) : (
					<div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
						No reviews found.
					</div>
				)}
			</div>
		</div>
	);
}

function formatDate(dateValue: string | null) {
	if (!dateValue) {
		return "—";
	}

	return new Date(dateValue).toLocaleDateString();
}
