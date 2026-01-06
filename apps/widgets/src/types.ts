interface LylrvWindow extends Window {
    __LYLRV_LOADED__?: boolean;
    __LYLRV_CONFIG__?: WidgetConfig;
    LylrvWidgets?: Record<string, WidgetModule>;
}

interface WidgetConfig {
    enabled: boolean;
    widgets: string[];
    styles: {
        primaryColor: string;
        position: "left" | "right";
    };
    clientId?: string;
    // Injected context
    user?: UserDetails;
    context?: WidgetContext;
}

export interface UserDetails {
    isLoggedIn: boolean;
    email?: string | null;
    name?: string | null;
}

export interface WidgetContext {
    product?: {
        id: number;
        hasPurchased: boolean;
    } | null;
}

interface WidgetModule {
    mount: (container: HTMLElement, config: WidgetConfig) => void;
}
