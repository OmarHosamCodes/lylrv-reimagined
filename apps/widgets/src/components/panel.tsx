import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { transitions } from "../lib/transitions";
import { cn } from "./utils";

interface PanelProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

/**
 * Centered dialog panel with animated backdrop overlay.
 * Uses spring physics for a premium-feeling open/close.
 */
export function Panel({ children, isOpen, onClose, className }: PanelProps) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transitions.smooth}
            className="fixed inset-0 bg-[radial-gradient(circle_at_12%_14%,rgba(255,255,255,0.35)_0%,rgba(22,19,15,0.74)_58%)] backdrop-blur-[5px]"
            onClick={onClose}
            onKeyDown={(e) => e.key === "Escape" && onClose?.()}
            role="button"
            tabIndex={0}
            aria-label="Close dialog"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 26 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 16 }}
            transition={transitions.spring}
            className={cn("ly-widget-shell relative z-10 w-80", className)}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface PanelHeaderProps {
  children: ReactNode;
  className?: string;
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-white/55 bg-gradient-to-r from-brand-amber/95 via-brand-gold/90 to-brand-amber/95 p-5 text-center text-primary-foreground",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface PanelContentProps {
  children: ReactNode;
  className?: string;
}

export function PanelContent({ children, className }: PanelContentProps) {
  return (
    <div className={cn("overflow-y-auto p-4 relative z-10", className)}>
      {children}
    </div>
  );
}

interface PanelFooterProps {
  children: ReactNode;
  className?: string;
}

export function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <div
      className={cn(
        "relative z-10 border-t border-white/55 bg-white/45 p-3 text-center backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}
