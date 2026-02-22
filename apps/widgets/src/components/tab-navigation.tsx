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
      <div
        className={cn(
          "mx-4 mt-3 flex rounded-2xl border border-white/60 bg-white/55 p-1 shadow-[0_14px_28px_-24px_rgba(0,0,0,0.8)] backdrop-blur-sm",
          className,
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold tracking-wide uppercase transition-colors duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 rounded-xl bg-white/95 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.9)]"
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
