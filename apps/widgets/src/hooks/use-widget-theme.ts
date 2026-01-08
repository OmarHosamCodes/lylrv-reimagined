import { useMemo } from "react";
import type { WidgetConfig, WidgetTheme } from "../types";
import { getWidgetTheme } from "../utils";

/**
 * Hook to extract theme from widget config
 */
export function useWidgetTheme(config: WidgetConfig): WidgetTheme {
	return useMemo(() => getWidgetTheme(config), [config]);
}
