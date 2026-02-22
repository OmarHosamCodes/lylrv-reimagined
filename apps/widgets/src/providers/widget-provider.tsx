import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import type { WidgetConfig } from "../types";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface WidgetProviderProps {
  config: WidgetConfig;
  apiBaseUrl: string;
  children: ReactNode;
}

interface WidgetContextValue {
  config: WidgetConfig;
  apiBaseUrl: string;
}

import { createContext, useContext } from "react";

const WidgetContext = createContext<WidgetContextValue | null>(null);

export function useWidgetContext() {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error("useWidgetContext must be used within a WidgetProvider");
  }
  return context;
}

/**
 * Provider component that wraps widgets with React Query and context
 */
export function WidgetProvider({
  config,
  apiBaseUrl,
  children,
}: WidgetProviderProps) {
  const theme = config.clientConfig?.theme;
  const primaryColor =
    theme?.buttonBackgroundColor || config.styles.primaryColor || "#6366f1";
  const textColor = theme?.buttonTextColor || "#ffffff";
  const isRTL = config.clientConfig?.language?.direction === "rtl";

  // Create CSS custom properties for theming
  const themeStyles = {
    "--primary": primaryColor,
    "--primary-foreground": textColor,
    "--ring": primaryColor,
    // Derive other colors from primary
    "--accent": `color-mix(in oklch, ${primaryColor} 15%, transparent)`,
    "--accent-foreground": primaryColor,
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <WidgetContext.Provider value={{ config, apiBaseUrl }}>
        <div
          style={themeStyles}
          dir={isRTL ? "rtl" : "ltr"}
          className="font-sans antialiased"
        >
          {children}
        </div>
      </WidgetContext.Provider>
    </QueryClientProvider>
  );
}
