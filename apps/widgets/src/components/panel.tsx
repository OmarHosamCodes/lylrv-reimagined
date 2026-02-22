import type { ReactNode } from "react";
import { cn } from "./utils";

interface PanelProps {
  children: ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  className?: string;
}

export function Panel({ children, isOpen, onClose, className }: PanelProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/40"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose?.()}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />
      <section
        className={cn(
          "relative z-10 w-80 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-lg",
          className,
        )}
      >
        {children}
      </section>
    </div>
  );
}

interface PanelHeaderProps {
  children: ReactNode;
  className?: string;
}

export function PanelHeader({ children, className }: PanelHeaderProps) {
  return (
    <div className={cn("border-b bg-muted/40 p-4 text-center", className)}>
      {children}
    </div>
  );
}

interface PanelContentProps {
  children: ReactNode;
  className?: string;
}

export function PanelContent({ children, className }: PanelContentProps) {
  return <div className={cn("overflow-y-auto p-4", className)}>{children}</div>;
}

interface PanelFooterProps {
  children: ReactNode;
  className?: string;
}

export function PanelFooter({ children, className }: PanelFooterProps) {
  return (
    <div className={cn("border-t bg-muted/30 p-3 text-center", className)}>
      {children}
    </div>
  );
}
