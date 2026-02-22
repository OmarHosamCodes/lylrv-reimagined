import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { transitions } from "../lib/transitions";
import { cn } from "./utils";

interface FloatingButtonProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  badge?: string | number;
  className?: string;
}

/**
 * Floating action button with spring-animated hover and tap feedback.
 * Badge pulses on mount to draw attention.
 */
export function FloatingButton({
  onClick,
  icon,
  label,
  badge,
  className,
}: FloatingButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={label}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ ...transitions.springBouncy, delay: 0.3 }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.96, y: 0 }}
      className={cn(
        "group ly-widget-fab",
        "focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        "focus:outline-none",
        "cursor-pointer select-none",
        className,
      )}
    >
      <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/65 text-primary shadow-inner">
        {icon}
      </span>
      <span className="relative z-10 hidden max-w-[9rem] truncate text-left text-[13px] leading-4 sm:block">
        {label}
      </span>
      {badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...transitions.springBouncy, delay: 0.6 }}
          className={cn(
            "absolute -right-1.5 -top-1.5 z-20 flex min-w-6 items-center justify-center",
            "rounded-full bg-foreground px-1.5 py-0.5 text-[11px] font-bold text-background",
            "shadow-sm ring-2 ring-white/70",
          )}
        >
          {badge}
        </motion.span>
      )}
    </motion.button>
  );
}
