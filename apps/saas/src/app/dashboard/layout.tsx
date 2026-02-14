import { cn } from "@lylrv/ui";
import Link from "next/link";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await getSession();

	if (!session) {
		redirect("/");
	}

	const userInitials = session.user.name
		? session.user.name
				.split(" ")
				.map((n) => n[0])
				.join("")
				.toUpperCase()
				.slice(0, 2)
		: "U";

	return (
		<div className="flex min-h-screen">
			{/* Sidebar */}
			<aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
				{/* Logo */}
				<div className="flex h-16 items-center gap-2.5 px-6">
					<div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary">
						<svg
							width="16"
							height="16"
							viewBox="0 0 18 18"
							fill="none"
							className="text-sidebar-primary-foreground"
						>
							<path
								d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z"
								fill="currentColor"
							/>
						</svg>
					</div>
					<span className="font-display text-lg font-bold tracking-tight text-sidebar-foreground">
						Lylrv
					</span>
				</div>

				{/* Navigation */}
				<nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
					<span className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40">
						Overview
					</span>

					<NavItem href="/dashboard" icon={<DashboardIcon />} label="Dashboard" />

					<span className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40">
						Manage
					</span>

					<NavItem
						href="/dashboard/customers"
						icon={<CustomersIcon />}
						label="Customers"
					/>
					<NavItem
						href="/dashboard/loyalty"
						icon={<LoyaltyIcon />}
						label="Loyalty"
					/>
					<NavItem
						href="/dashboard/reviews"
						icon={<ReviewsIcon />}
						label="Reviews"
					/>
					<NavItem
						href="/dashboard/referrals"
						icon={<ReferralsIcon />}
						label="Referrals"
					/>
					<NavItem
						href="/dashboard/orders"
						icon={<OrdersIcon />}
						label="Orders"
					/>

					<span className="mb-1 mt-5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/40">
						Configure
					</span>

					<NavItem
						href="/dashboard/widgets"
						icon={<WidgetsIcon />}
						label="Widgets"
					/>
					<NavItem
						href="/dashboard/settings"
						icon={<SettingsIcon />}
						label="Settings"
					/>
				</nav>

				{/* User section */}
				<div className="border-t border-sidebar-border p-3">
					<div className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-sidebar-accent">
						<div className="flex size-8 items-center justify-center rounded-full bg-sidebar-primary/10 text-xs font-semibold text-sidebar-primary">
							{userInitials}
						</div>
						<div className="flex min-w-0 flex-1 flex-col">
							<span className="truncate text-sm font-medium text-sidebar-foreground">
								{session.user.name ?? "User"}
							</span>
							<span className="truncate text-[11px] text-sidebar-foreground/50">
								{session.user.email}
							</span>
						</div>
					</div>
				</div>
			</aside>

			{/* Main content */}
			<main className="ml-64 flex flex-1 flex-col">
				{/* Top bar */}
				<header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-8 backdrop-blur-xl">
					<div />
					<div className="flex items-center gap-3">
						<button
							type="button"
							className="relative flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						>
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="1.5"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
								<path d="M13.73 21a2 2 0 0 1-3.46 0" />
							</svg>
							<span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
						</button>
					</div>
				</header>

				{/* Page content */}
				<div className="flex-1 px-8 py-8">{children}</div>
			</main>
		</div>
	);
}

/* ── Nav Item ── */
function NavItem({
	href,
	icon,
	label,
}: {
	href: string;
	icon: React.ReactNode;
	label: string;
}) {
	return (
		<Link
			href={href}
			className={cn(
				"group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200",
				"hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
				"[&.active]:bg-sidebar-accent [&.active]:text-sidebar-accent-foreground",
			)}
		>
			<span className="flex size-5 items-center justify-center text-sidebar-foreground/50 transition-colors duration-200 group-hover:text-sidebar-primary">
				{icon}
			</span>
			{label}
		</Link>
	);
}

/* ── Icons ── */
function DashboardIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="7" height="9" x="3" y="3" rx="1" />
			<rect width="7" height="5" x="14" y="3" rx="1" />
			<rect width="7" height="9" x="14" y="12" rx="1" />
			<rect width="7" height="5" x="3" y="16" rx="1" />
		</svg>
	);
}

function CustomersIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</svg>
	);
}

function LoyaltyIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
		</svg>
	);
}

function ReviewsIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</svg>
	);
}

function ReferralsIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="18" cy="5" r="3" />
			<circle cx="6" cy="12" r="3" />
			<circle cx="18" cy="19" r="3" />
			<line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
			<line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
		</svg>
	);
}

function OrdersIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="m7.5 4.27 9 5.15" />
			<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
			<path d="m3.3 7 8.7 5 8.7-5" />
			<path d="M12 22V12" />
		</svg>
	);
}

function WidgetsIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
			<path d="M3 9h18" />
			<path d="M9 21V9" />
		</svg>
	);
}

function SettingsIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</svg>
	);
}
