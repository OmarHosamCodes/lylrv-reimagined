import { DEFAULT_PRIMARY_COLOR, DEFAULT_TEXT_COLOR } from "./constants";
import type { ConfigVariable, WidgetConfig, WidgetTheme } from "./types";

export function getWidgetTheme(config: WidgetConfig): WidgetTheme {
  return {
    primaryColor: DEFAULT_PRIMARY_COLOR,
    textColor: DEFAULT_TEXT_COLOR,
    position: config.styles.position || "right",
    isRTL: config.clientConfig?.language?.direction === "rtl",
  };
}

export function getVariable(
  variables: ConfigVariable[] | undefined,
  name: string,
  defaultValue = "",
): string {
  return variables?.find((v) => v.name === name)?.value || defaultValue;
}

export function parseNumberList(
  variables: ConfigVariable[] | undefined,
  name: string,
  defaultValues: number[],
): number[] {
  const value = getVariable(variables, name);
  if (!value) return defaultValues;
  return value
    .split(",")
    .map((v) => Number.parseInt(v.trim(), 10))
    .filter((v) => !Number.isNaN(v));
}
