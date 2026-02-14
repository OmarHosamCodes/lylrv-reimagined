import {
	createFileRoute,
	Link,
	Outlet,
	useNavigate,
} from "@tanstack/react-router";
import { useEffect } from "react";

import { authClient } from "~/auth/client";
import { useActiveClient } from "~/lib/use-active-client";

export const Route = createFileRoute("/dashboard")({
	component: DashboardLayout,
});

function DashboardLayout() {
	const { data: session, isPending } = authClient.useSession();
	const navigate = useNavigate();
	const { clients, activeClientId, setActiveClientId } = useActiveClient();

	useEffect(() => {
		if (!isPending && !session) {
			navigate({ to: "/", replace: true });
		}
	}, [isPending, navigate, session]);

	if (!session) {
		return null;
	}

	const userInitials = session.user.name
		? session.user.name
				.split(" ")
				.map((name) => name[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "U";

	return (
		<div className="flex min-h-screen bg-background">
			<aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
				<div className="flex h-16 items-center gap-2.5 px-6">
					<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
						<svg
							width="16"
							height="16"
							viewBox="0 0 18 18"
							fill="none"
							className="text-sidebar-primary-foreground"
						>
							<title>Lylrv logo</title>
							<path
								d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z"
								fill="currentColor"
							/>
						</svg>
					</div>
					<div className="flex flex-col">
						<span className="font-display text-lg font-bold tracking-tight text-sidebar-foreground">
							Lylrv
						</span>
						<span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/50">
							Admin
						</span>
					</div>
				</div>

				<nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
					<NavItem to="/dashboard" label="Overview" />
					<NavItem to="/dashboard/customers" label="Customers" />
					<NavItem to="/dashboard/loyalty" label="Loyalty" />
					<NavItem to="/dashboard/reviews" label="Reviews" />
					<NavItem to="/dashboard/referrals" label="Referrals" />
					<NavItem to="/dashboard/orders" label="Orders" />
					<NavItem to="/dashboard/settings" label="Settings" />
				</nav>

				<div className="border-t border-sidebar-border p-3">
					<div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
						<div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-semibold text-sidebar-primary">
							{userInitials}
						</div>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-sidebar-foreground">
								{session.user.name}
							</p>
							<p className="truncate text-[11px] text-sidebar-foreground/60">
								{session.user.email}
							</p>
						</div>
					</div>
				</div>
			</aside>

			<main className="ml-64 flex flex-1 flex-col">
				<header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/85 px-8 backdrop-blur-xl">
					<div className="text-sm font-medium text-muted-foreground">
						Client Workspace
					</div>
					<div className="flex items-center gap-3">
						<select
							className="h-9 min-w-56 rounded-md border border-input bg-background px-3 text-sm outline-none ring-primary/20 transition focus:ring-2"
							value={activeClientId ?? ""}
							onChange={(event) => setActiveClientId(event.target.value)}
						>
							{!clients.length ? (
								<option value="">No clients yet</option>
							) : null}
							{clients.map((client) => (
								<option key={client.id} value={client.id}>
									{client.name ?? client.email}
								</option>
							))}
						</select>
					</div>
				</header>

				<div className="flex-1 px-8 py-8">
					<Outlet />
				</div>
			</main>
		</div>
	);
}

function NavItem({ to, label }: { to: string; label: string }) {
	return (
		<Link
			to={to}
			activeProps={{
				className: "bg-sidebar-accent text-sidebar-accent-foreground",
			}}
			className="rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
		>
			{label}
		</Link>
	);
}
