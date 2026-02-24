import { DEFAULT_LOCALIZATIONS, type WidgetConfig } from "@lylrv/state";
import { useMemo } from "react";

type Localizations = Record<string, string>;

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
  }, [
    config.clientConfig?.language?.local,
    config.clientConfig?.localizations,
  ]);
}

export function t(
  localizations: Localizations,
  key: string,
  fallback: string,
): string {
  return localizations[key] || fallback;
}
