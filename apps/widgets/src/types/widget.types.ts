// Client Config Types from DB
export interface ClientConfigTheme {
  color: string;
  mainButtonIcon: string;
  buttonTextColor: string;
  secondaryButtonIcon: string;
  buttonBackgroundColor: string;
}

export interface ClientConfigLanguage {
  local: string;
  direction: "ltr" | "rtl";
}

export interface EarnSection {
  title: string;
  earnAmount: string;
  description: string;
}

export interface ConfigVariable {
  name: string;
  value: string;
}

export interface Interaction {
  trigger: string;
  pointsGained: number;
}

export interface Condition {
  status: string;
  maxAmount: number;
  minAmount: number;
  pointsGained: number;
}

export interface WidgetClientConfig {
  theme: ClientConfigTheme;
  language: ClientConfigLanguage;
  localizations: Record<string, Record<string, string>>;
  earnSections: EarnSection[];
  variables: ConfigVariable[];
  interactions: Interaction[];
  conditions: Condition[];
}

// User context injected by WordPress plugin
export interface UserDetails {
  isLoggedIn: boolean;
  email?: string | null;
  name?: string | null;
  points?: number;
  referralCode?: string | null;
}

export interface WidgetContext {
  product?: {
    id: number;
    hasPurchased: boolean;
  } | null;
}

// Main widget config from API
export interface WidgetConfig {
  enabled: boolean;
  widgets: string[];
  styles: {
    primaryColor?: string;
    position: "left" | "right";
  };
  shop?: string;
  clientId?: string;
  clientConfig?: WidgetClientConfig | null;
  // Injected context from WordPress
  user?: UserDetails;
  context?: WidgetContext;
}

export interface WidgetModule {
  mount: (container: HTMLElement, config: WidgetConfig) => void;
}

// Widget Theme derived from config
export interface WidgetTheme {
  primaryColor: string;
  textColor: string;
  position: "left" | "right";
  isRTL: boolean;
}

declare global {
  interface Window {
    __LYLRV_LOADED__?: boolean;
    __LYLRV_CONFIG__?: WidgetConfig;
    LylrvWidgets?: Record<string, WidgetModule>;
    LYLRV_WP_DATA?: {
      user?: UserDetails;
      context?: WidgetContext;
    };
  }
}
