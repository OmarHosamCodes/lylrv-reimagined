import type { ReactNode } from "react";
import { cn } from "./utils";

interface FloatingButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: string | number;
  className?: string;
}

export function FloatingButton({
  onClick,
  icon,
  label,
  badge,
  className,
}: FloatingButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-xl border bg-card px-3 py-2 text-sm font-medium text-card-foreground shadow-md",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "focus:outline-none",
        "cursor-pointer select-none",
        "bg-primary/25",
        className,
      )}
    >
      <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-md text-primary">
        {icon}
      </span>
      <span className="relative z-10 hidden max-w-36 truncate text-left text-[13px] leading-4 sm:block">
        {label}
      </span>
      {badge !== undefined && (
        <span
          className={cn(
            "absolute -right-1.5 -top-1.5 z-20 flex min-w-6 items-center justify-center",
            "rounded-full bg-foreground px-1.5 py-0.5 text-[11px] font-bold text-background",
            "shadow-sm ring-2 ring-background",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
