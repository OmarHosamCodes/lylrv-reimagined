import { LayoutGroup, motion } from "framer-motion";
import type { ReactNode } from "react";
import { transitions } from "../lib/transitions";
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
 * Tab navigation with shared layout animation for the active indicator.
 * The indicator slides between tabs using layoutId for butter-smooth transitions.
 */
export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
  className,
}: TabNavigationProps) {
  return (
    <LayoutGroup>
      <div className={cn("flex border-b border-border/60", className)}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex-1 py-2.5 text-sm font-medium transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-x-0 bottom-0 h-0.5 bg-primary rounded-full"
                  transition={transitions.springStiff}
                />
              )}
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
