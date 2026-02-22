import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { DEFAULT_PRIMARY_COLOR, DEFAULT_TEXT_COLOR } from "../constants";
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
  const isRTL = config.clientConfig?.language?.direction === "rtl";
  const themeStyles = {
    "--primary": DEFAULT_PRIMARY_COLOR,
    "--primary-foreground": DEFAULT_TEXT_COLOR,
    "--ring": DEFAULT_PRIMARY_COLOR,
    "--accent": "color-mix(in oklch, var(--primary) 18%, transparent)",
    "--accent-foreground": DEFAULT_PRIMARY_COLOR,
  } as React.CSSProperties;

  return (
    <QueryClientProvider client={queryClient}>
      <WidgetContext.Provider value={{ config, apiBaseUrl }}>
        <div
          style={themeStyles}
          dir={isRTL ? "rtl" : "ltr"}
          className="font-sans antialiased text-foreground"
        >
          {children}
        </div>
      </WidgetContext.Provider>
    </QueryClientProvider>
  );
}
