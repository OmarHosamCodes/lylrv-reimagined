import { getWidgetTheme, type WidgetConfig, type WidgetTheme } from "@lylrv/state";
import { useMemo } from "react";

export function useWidgetTheme(config: WidgetConfig): WidgetTheme {
  return useMemo(() => getWidgetTheme(config), [config]);
}
