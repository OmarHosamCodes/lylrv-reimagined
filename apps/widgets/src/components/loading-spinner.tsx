import { motion } from "framer-motion";
import { cn } from "./utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-3",
};

/**
 * Loading spinner with Framer Motion rotation
 */
export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 0.8,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
      className={cn(
        "rounded-full border-muted",
        "border-t-primary",
        sizeClasses[size],
        className,
      )}
    />
  );
}

interface LoadingStateProps {
  className?: string;
}

/**
 * Full loading state with animated spinner entrance
 */
export function LoadingState({ className }: LoadingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-center justify-center py-8", className)}
    >
      <LoadingSpinner />
    </motion.div>
  );
}
