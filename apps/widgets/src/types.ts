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
}

interface WidgetModule {
    mount: (container: HTMLElement, config: WidgetConfig) => void;
}

export { };

