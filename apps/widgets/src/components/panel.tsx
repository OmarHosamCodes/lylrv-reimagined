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
        <div className="fixed inset-0 z-10000 flex items-center justify-center">
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
            className={cn(
              "relative z-10 w-80",
              // Glass shell — replaces .ly-widget-shell
              "overflow-hidden rounded-[26px] border border-white/55",
              "bg-linear-to-br from-white/95 via-brand-surface/95 to-brand-warm/60",
              "text-foreground",
              "shadow-[0_30px_75px_-25px_color-mix(in_oklch,var(--color-brand-amber)_45%,black)]",
              "[backdrop-filter:blur(18px)]",
              className,
            )}
          >
            {/* Ambient glow overlay */}
            <div
              className="pointer-events-none absolute inset-x-[-10%] top-[-40%] h-[240px]"
              style={{
                background: [
                  "radial-gradient(circle at 20% 20%, color-mix(in oklch, var(--color-brand-gold) 55%, transparent) 0%, transparent 58%)",
                  "radial-gradient(circle at 80% 10%, color-mix(in oklch, var(--color-brand-amber) 30%, transparent) 0%, transparent 64%)",
                ].join(", "),
                opacity: 0.7,
              }}
            />
            {/* Dot texture overlay */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(color-mix(in oklch, var(--color-foreground) 5%, transparent) 0.6px, transparent 0.6px)",
                backgroundSize: "3px 3px",
                opacity: 0.16,
              }}
            />
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
        "relative overflow-hidden border-b border-white/55",
        "bg-linear-to-r from-brand-amber/95 via-brand-gold/90 to-brand-amber/95",
        "p-5 text-center text-primary-foreground",
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
