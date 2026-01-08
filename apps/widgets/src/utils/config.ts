import { DEFAULT_PRIMARY_COLOR, DEFAULT_TEXT_COLOR } from "../constants";
import type { ConfigVariable, WidgetConfig, WidgetTheme } from "../types";

/**
 * Extract theme from widget config
 */
export function getWidgetTheme(config: WidgetConfig): WidgetTheme {
	const theme = config.clientConfig?.theme;
	return {
		primaryColor:
			theme?.buttonBackgroundColor ||
			config.styles.primaryColor ||
			DEFAULT_PRIMARY_COLOR,
		textColor: theme?.buttonTextColor || DEFAULT_TEXT_COLOR,
		position: config.styles.position || "right",
		isRTL: config.clientConfig?.language?.direction === "rtl",
	};
}

/**
 * Get a variable value from config variables
 */
export function getVariable(
	variables: ConfigVariable[] | undefined,
	name: string,
	defaultValue = "",
): string {
	return variables?.find((v) => v.name === name)?.value || defaultValue;
}

/**
 * Parse comma-separated number values from a variable
 */
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
