import { useMemo } from "react";
import { DEFAULT_LOCALIZATIONS } from "../constants";
import type { WidgetConfig } from "../types";

type Localizations = Record<string, string>;

/**
 * Hook to get localized text from widget config
 */
export function useLocalizations(config: WidgetConfig): Localizations {
	return useMemo(() => {
		const locale = config.clientConfig?.language?.local || "en";
		const localizations = config.clientConfig?.localizations || {};
		return (
			localizations[locale] ||
			localizations.en ||
			DEFAULT_LOCALIZATIONS.en ||
			{}
		);
	}, [config.clientConfig?.language?.local, config.clientConfig?.localizations]);
}

/**
 * Helper function to get a localized string with a fallback
 */
export function t(
	localizations: Localizations,
	key: string,
	fallback: string,
): string {
	return localizations[key] || fallback;
}
