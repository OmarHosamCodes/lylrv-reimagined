import type { ReactNode } from "react";
import { cn } from "./utils";

interface Tab {
	id: string;
	label: ReactNode;
}

interface TabNavigationProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	className?: string;
}

/**
 * Tab navigation component
 */
export function TabNavigation({
	tabs,
	activeTab,
	onTabChange,
	className,
}: TabNavigationProps) {
	return (
		<div className={cn("flex border-b border-border", className)}>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id;
				return (
					<button
						key={tab.id}
						type="button"
						onClick={() => onTabChange(tab.id)}
						className={cn(
							"flex-1 py-2 text-sm font-medium transition-colors",
							"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
							isActive
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground",
						)}
					>
						{tab.label}
					</button>
				);
			})}
		</div>
	);
}
