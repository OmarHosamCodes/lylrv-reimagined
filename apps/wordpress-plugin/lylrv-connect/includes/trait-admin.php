<?php
/**
 * Admin trait for Lylrv Connect Plugin.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Admin
{
    public static function register_settings()
    {
        register_setting(self::OPTION_GROUP, self::OPTION_API_KEY, [
            "sanitize_callback" => [__CLASS__, "sanitize_api_key"],
        ]);

        register_setting(self::OPTION_GROUP, self::OPTION_SAAS_URL, [
            "default" => "https://app.lylrv.com",
            "sanitize_callback" => [__CLASS__, "sanitize_saas_url"],
        ]);

        register_setting(self::OPTION_GROUP, self::OPTION_STOREFRONT_BASE, [
            "default" => "store",
            "sanitize_callback" => [__CLASS__, "sanitize_storefront_base"],
        ]);

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_STOREFRONT_PRODUCT_PAGE_ID,
            [
                "type" => "integer",
                "default" => 0,
                "sanitize_callback" => [__CLASS__, "sanitize_page_id"],
            ],
        );

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_STOREFRONT_CART_PAGE_ID,
            [
                "type" => "integer",
                "default" => 0,
                "sanitize_callback" => [__CLASS__, "sanitize_page_id"],
            ],
        );

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID,
            [
                "type" => "integer",
                "default" => 0,
                "sanitize_callback" => [__CLASS__, "sanitize_page_id"],
            ],
        );

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID,
            [
                "type" => "integer",
                "default" => 0,
                "sanitize_callback" => [__CLASS__, "sanitize_page_id"],
            ],
        );
    }

    public static function sanitize_api_key($value)
    {
        return sanitize_text_field(trim((string) $value));
    }

    public static function sanitize_saas_url($value)
    {
        $url = esc_url_raw(trim((string) $value));

        if (empty($url)) {
            return "https://app.lylrv.com";
        }

        return untrailingslashit($url);
    }

    public static function sanitize_storefront_base($value)
    {
        $base = sanitize_title((string) $value);
        return empty($base) ? "store" : $base;
    }

    public static function sanitize_page_id($value)
    {
        return absint($value);
    }

    public static function register_menu()
    {
        add_options_page(
            "Lylrv Connect Settings",
            "Lylrv Connect",
            "manage_options",
            "lylrv-connect",
            [__CLASS__, "render_options_page"],
        );
    }

    public static function render_options_page()
    {
        $api_key = get_option(self::OPTION_API_KEY, "");
        $saas_url = get_option(self::OPTION_SAAS_URL, "https://app.lylrv.com");
        $storefront_base = (string) get_option(
            self::OPTION_STOREFRONT_BASE,
            "store",
        );
        $storefront_product_page_id = absint(
            get_option(self::OPTION_STOREFRONT_PRODUCT_PAGE_ID, 0),
        );
        $storefront_cart_page_id = absint(
            get_option(self::OPTION_STOREFRONT_CART_PAGE_ID, 0),
        );
        $storefront_checkout_page_id = absint(
            get_option(self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID, 0),
        );
        $storefront_thank_you_page_id = absint(
            get_option(self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID, 0),
        );
        $connection_ready = self::is_connection_ready();
        ?>
        <?php self::render_admin_styles(); ?>
        <div class="wrap lylrv-connect-admin-page">
            <div class="lylrv-connect-admin">
                <section class="lylrv-connect-hero">
                    <div class="lylrv-connect-hero__copy">
                        <span class="lylrv-connect-eyebrow"><?php echo esc_html__(
                            "WordPress Integration",
                            "lylrv-connect",
                        ); ?></span>
                        <h1><?php echo esc_html__(
                            "Lylrv Connect Settings",
                            "lylrv-connect",
                        ); ?></h1>
                        <p class="lylrv-connect-hero__description"><?php echo esc_html__(
                            "Connect WordPress to your Lylrv workspace, load embeddable widgets, and assign pages for the native storefront routes.",
                            "lylrv-connect",
                        ); ?></p>
                        <div class="lylrv-connect-hero__meta">
                            <?php self::render_status_badge(
                                $connection_ready
                                    ? __("Connected", "lylrv-connect")
                                    : __("Needs setup", "lylrv-connect"),
                                $connection_ready ? "success" : "warning",
                            ); ?>
                            <?php self::render_status_badge(
                                sprintf(
                                    /* translators: %s: storefront base slug */
                                    __("Base: /%s/", "lylrv-connect"),
                                    $storefront_base,
                                ),
                                "primary",
                            ); ?>
                        </div>
                    </div>
                    <div class="lylrv-connect-hero__actions">
                        <div class="lylrv-connect-glass-card">
                            <span class="lylrv-connect-glass-card__label"><?php echo esc_html__(
                                "Application URL",
                                "lylrv-connect",
                            ); ?></span>
                            <a class="lylrv-connect-link" href="<?php echo esc_url(
                                $saas_url,
                            ); ?>" target="_blank" rel="noreferrer noopener"><?php echo esc_html(
    $saas_url,
); ?></a>
                            <p><?php echo esc_html__(
                                "Widgets and storefront data are loaded from this Lylrv environment.",
                                "lylrv-connect",
                            ); ?></p>
                        </div>
                    </div>
                </section>

                <section class="lylrv-connect-metrics" aria-label="<?php echo esc_attr__(
                    "Overview",
                    "lylrv-connect",
                ); ?>">
                    <?php self::render_metric_card(
                        __("Connection", "lylrv-connect"),
                        $connection_ready
                            ? __("Ready", "lylrv-connect")
                            : __("Incomplete", "lylrv-connect"),
                        $connection_ready
                            ? __("API key and SaaS URL are configured.", "lylrv-connect")
                            : __("Add your workspace credentials to enable widgets and storefront requests.", "lylrv-connect"),
                        $connection_ready ? "success" : "warning",
                    ); ?>
                    <?php self::render_metric_card(
                        __("Storefront Base", "lylrv-connect"),
                        "/" . $storefront_base . "/",
                        __("Used for product, cart, checkout, and thank-you routes.", "lylrv-connect"),
                        "primary",
                    ); ?>
                    <?php self::render_metric_card(
                        __("Product Route", "lylrv-connect"),
                        self::get_route_summary($storefront_product_page_id),
                        __("Optional page assignment for storefront product rendering.", "lylrv-connect"),
                        "neutral",
                    ); ?>
                    <?php self::render_metric_card(
                        __("Checkout Route", "lylrv-connect"),
                        self::get_route_summary($storefront_checkout_page_id),
                        __("Optional page assignment for the checkout experience.", "lylrv-connect"),
                        "neutral",
                    ); ?>
                </section>

                <div class="lylrv-connect-layout-grid">
                    <form method="post" action="options.php" class="lylrv-connect-panel lylrv-connect-panel--form">
                        <?php settings_fields(self::OPTION_GROUP); ?>

                        <div class="lylrv-connect-panel__header">
                            <div>
                                <h2><?php echo esc_html__(
                                    "Connection Settings",
                                    "lylrv-connect",
                                ); ?></h2>
                                <p><?php echo esc_html__(
                                    "Point WordPress at the correct Lylrv workspace before loading widgets or storefront data.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                            <?php self::render_status_badge(
                                $connection_ready
                                    ? __("Live", "lylrv-connect")
                                    : __("Not ready", "lylrv-connect"),
                                $connection_ready ? "success" : "warning",
                            ); ?>
                        </div>

                        <div class="lylrv-connect-field-grid">
                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_API_KEY,
                                ); ?>"><?php echo esc_html__(
    "API Key",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="text"
                                    id="<?php echo esc_attr(
                                        self::OPTION_API_KEY,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_API_KEY,
                                    ); ?>"
                                    value="<?php echo esc_attr($api_key); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--mono"
                                    spellcheck="false"
                                    autocomplete="off"
                                />
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "Enter the Lylrv API key for the workspace this site should use.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_SAAS_URL,
                                ); ?>"><?php echo esc_html__(
    "SaaS Application URL",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="url"
                                    id="<?php echo esc_attr(
                                        self::OPTION_SAAS_URL,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_SAAS_URL,
                                    ); ?>"
                                    value="<?php echo esc_attr($saas_url); ?>"
                                    class="lylrv-connect-input"
                                />
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "The base URL for your Lylrv app, for example https://app.lylrv.com.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-panel__header lylrv-connect-panel__header--subsection">
                            <div>
                                <h2><?php echo esc_html__(
                                    "Native Storefront",
                                    "lylrv-connect",
                                ); ?></h2>
                                <p><?php echo esc_html__(
                                    "Assign block-editor pages for the product, cart, checkout, and thank-you routes, or let the plugin render its fallback templates.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-field-grid lylrv-connect-field-grid--single">
                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_STOREFRONT_BASE,
                                ); ?>"><?php echo esc_html__(
    "Storefront Base Slug",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="text"
                                    id="<?php echo esc_attr(
                                        self::OPTION_STOREFRONT_BASE,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_STOREFRONT_BASE,
                                    ); ?>"
                                    value="<?php echo esc_attr(
                                        $storefront_base,
                                    ); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--mono"
                                />
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "Default is store, which creates routes such as /store/product-slug/, /store/cart/, and /store/checkout/.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-field-grid">
                            <?php self::render_page_picker(
                                self::OPTION_STOREFRONT_PRODUCT_PAGE_ID,
                                __("Product Page", "lylrv-connect"),
                                $storefront_product_page_id,
                            ); ?>
                            <?php self::render_page_picker(
                                self::OPTION_STOREFRONT_CART_PAGE_ID,
                                __("Cart Page", "lylrv-connect"),
                                $storefront_cart_page_id,
                            ); ?>
                            <?php self::render_page_picker(
                                self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID,
                                __("Checkout Page", "lylrv-connect"),
                                $storefront_checkout_page_id,
                            ); ?>
                            <?php self::render_page_picker(
                                self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID,
                                __("Thank-You Page", "lylrv-connect"),
                                $storefront_thank_you_page_id,
                            ); ?>
                        </div>

                        <div class="lylrv-connect-form-actions">
                            <button type="submit" class="lylrv-connect-button lylrv-connect-button--primary"><?php echo esc_html__(
                                "Save Changes",
                                "lylrv-connect",
                            ); ?></button>
                        </div>
                    </form>

                    <div class="lylrv-connect-panel-stack">
                        <section class="lylrv-connect-panel">
                            <div class="lylrv-connect-panel__header">
                                <div>
                                    <h2><?php echo esc_html__(
                                        "Connection Status",
                                        "lylrv-connect",
                                    ); ?></h2>
                                    <p><?php echo esc_html__(
                                        "Current workspace status and the URLs this plugin will use on the frontend.",
                                        "lylrv-connect",
                                    ); ?></p>
                                </div>
                            </div>

                            <dl class="lylrv-connect-status-list">
                                <div>
                                    <dt><?php echo esc_html__(
                                        "Site URL",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd><?php echo esc_html(
                                        home_url("/"),
                                    ); ?></dd>
                                </div>
                                <div>
                                    <dt><?php echo esc_html__(
                                        "Connection Ready",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd>
                                        <?php self::render_status_badge(
                                            $connection_ready
                                                ? __("Yes", "lylrv-connect")
                                                : __("No", "lylrv-connect"),
                                            $connection_ready
                                                ? "success"
                                                : "warning",
                                        ); ?>
                                    </dd>
                                </div>
                                <div>
                                    <dt><?php echo esc_html__(
                                        "Cart URL",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd><?php echo esc_html(
                                        self::get_storefront_path("cart"),
                                    ); ?></dd>
                                </div>
                                <div>
                                    <dt><?php echo esc_html__(
                                        "Checkout URL",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd><?php echo esc_html(
                                        self::get_storefront_path("checkout"),
                                    ); ?></dd>
                                </div>
                            </dl>
                        </section>

                        <section class="lylrv-connect-panel">
                            <div class="lylrv-connect-panel__header">
                                <div>
                                    <h2><?php echo esc_html__(
                                        "Widget Embeds",
                                        "lylrv-connect",
                                    ); ?></h2>
                                    <p><?php echo esc_html__(
                                        "Use the shortcode below when you want to place a widget directly inside post or page content.",
                                        "lylrv-connect",
                                    ); ?></p>
                                </div>
                            </div>

                            <div class="lylrv-connect-empty-state lylrv-connect-empty-state--left">
                                <p class="lylrv-connect-empty-state__title"><code>[lylrv_widget name="reviews"]</code></p>
                                <p><?php echo esc_html__(
                                    "Replace the name with any supported widget container, such as loyalty or product-reviews.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    private static function render_page_picker($option_name, $label, $selected)
    {
        ?>
        <div class="lylrv-connect-field-group">
            <label class="lylrv-connect-label" for="<?php echo esc_attr(
                $option_name,
            ); ?>"><?php echo esc_html($label); ?></label>
            <?php wp_dropdown_pages([
                "name" => $option_name,
                "id" => $option_name,
                "show_option_none" => __(
                    "Use plugin fallback layout",
                    "lylrv-connect",
                ),
                "option_none_value" => 0,
                "selected" => $selected,
                "class" => "lylrv-connect-input",
            ]); ?>
        </div>
        <?php
    }

    private static function get_route_summary($page_id)
    {
        if ($page_id < 1) {
            return __("Fallback", "lylrv-connect");
        }

        $page = get_post($page_id);
        if (!$page instanceof WP_Post) {
            return __("Fallback", "lylrv-connect");
        }

        return get_the_title($page);
    }

    private static function render_admin_styles()
    {
        ?>
        <style>
            .lylrv-connect-admin-page {
                margin: 20px 20px 0 2px;
            }

            .lylrv-connect-admin {
                --lylrv-bg: #faf8f5;
                --lylrv-surface: #fffdf9;
                --lylrv-surface-strong: #fffaf3;
                --lylrv-text: #231a13;
                --lylrv-muted: #6d6158;
                --lylrv-border: rgba(88, 62, 39, 0.14);
                --lylrv-primary: #c56f26;
                --lylrv-primary-strong: #a85b1a;
                --lylrv-primary-soft: rgba(197, 111, 38, 0.12);
                --lylrv-success: #1f8f63;
                --lylrv-success-soft: rgba(31, 143, 99, 0.12);
                --lylrv-warning: #a86a18;
                --lylrv-warning-soft: rgba(168, 106, 24, 0.14);
                color: var(--lylrv-text);
                font-family: "Geist", "Segoe UI", sans-serif;
            }

            .lylrv-connect-admin *,
            .lylrv-connect-admin *::before,
            .lylrv-connect-admin *::after {
                box-sizing: border-box;
            }

            .lylrv-connect-admin a {
                color: inherit;
            }

            .lylrv-connect-admin code {
                border-radius: 999px;
                background: rgba(35, 26, 19, 0.06);
                color: var(--lylrv-text);
                font-size: 12px;
                padding: 4px 10px;
            }

            .lylrv-connect-hero {
                position: relative;
                overflow: hidden;
                display: grid;
                grid-template-columns: minmax(0, 1.65fr) minmax(260px, 0.9fr);
                gap: 24px;
                padding: 32px;
                border: 1px solid var(--lylrv-border);
                border-radius: 24px;
                background:
                    radial-gradient(circle at top left, rgba(197, 111, 38, 0.18), transparent 38%),
                    radial-gradient(circle at bottom right, rgba(31, 143, 99, 0.12), transparent 32%),
                    linear-gradient(135deg, #fff9f2 0%, #fffdf9 44%, #f7f1ea 100%);
                box-shadow: 0 24px 48px -28px rgba(35, 26, 19, 0.28);
            }

            .lylrv-connect-hero::after {
                content: "";
                position: absolute;
                inset: 12px;
                border: 1px solid rgba(255, 255, 255, 0.45);
                border-radius: 18px;
                pointer-events: none;
            }

            .lylrv-connect-eyebrow {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border-radius: 999px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.74);
                color: var(--lylrv-primary-strong);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.16em;
                text-transform: uppercase;
            }

            .lylrv-connect-hero h1,
            .lylrv-connect-panel__header h2,
            .lylrv-connect-metric__value {
                font-family: "Bricolage Grotesque", "Avenir Next", "Segoe UI", sans-serif;
                letter-spacing: -0.03em;
            }

            .lylrv-connect-hero h1 {
                margin: 14px 0 0;
                font-size: clamp(2rem, 3vw, 3.25rem);
                line-height: 1.02;
                font-weight: 800;
            }

            .lylrv-connect-hero__description {
                max-width: 760px;
                margin: 14px 0 0;
                color: var(--lylrv-muted);
                font-size: 15px;
                line-height: 1.7;
            }

            .lylrv-connect-hero__meta {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
                margin-top: 20px;
            }

            .lylrv-connect-hero__actions {
                display: flex;
                align-items: stretch;
            }

            .lylrv-connect-glass-card {
                position: relative;
                z-index: 1;
                width: 100%;
                align-self: end;
                padding: 20px;
                border: 1px solid rgba(255, 255, 255, 0.65);
                border-radius: 20px;
                background: rgba(255, 253, 249, 0.72);
                backdrop-filter: blur(10px);
                box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.65);
            }

            .lylrv-connect-glass-card__label {
                display: block;
                color: var(--lylrv-muted);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.14em;
                text-transform: uppercase;
            }

            .lylrv-connect-glass-card p {
                margin: 12px 0 0;
                color: var(--lylrv-muted);
                line-height: 1.6;
            }

            .lylrv-connect-link {
                display: inline-block;
                margin-top: 10px;
                color: var(--lylrv-text);
                font-size: 18px;
                font-weight: 700;
                text-decoration: none;
                word-break: break-word;
            }

            .lylrv-connect-link:hover,
            .lylrv-connect-link:focus {
                color: var(--lylrv-primary-strong);
            }

            .lylrv-connect-metrics {
                display: grid;
                grid-template-columns: repeat(4, minmax(0, 1fr));
                gap: 16px;
                margin-top: 20px;
            }

            .lylrv-connect-metric {
                position: relative;
                overflow: hidden;
                padding: 18px;
                border: 1px solid var(--lylrv-border);
                border-radius: 20px;
                background: var(--lylrv-surface);
                box-shadow: 0 16px 40px -30px rgba(35, 26, 19, 0.28);
            }

            .lylrv-connect-metric::before {
                content: "";
                position: absolute;
                left: 18px;
                top: 0;
                width: 48px;
                height: 3px;
                border-radius: 999px;
                background: var(--lylrv-primary);
            }

            .lylrv-connect-metric--success::before {
                background: var(--lylrv-success);
            }

            .lylrv-connect-metric--warning::before {
                background: var(--lylrv-warning);
            }

            .lylrv-connect-metric--neutral::before {
                background: rgba(35, 26, 19, 0.18);
            }

            .lylrv-connect-metric__label {
                color: var(--lylrv-muted);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
            }

            .lylrv-connect-metric__value {
                display: block;
                margin-top: 12px;
                font-size: 28px;
                font-weight: 800;
                line-height: 1.05;
            }

            .lylrv-connect-metric__note {
                display: block;
                margin-top: 8px;
                color: var(--lylrv-muted);
                font-size: 13px;
                line-height: 1.6;
            }

            .lylrv-connect-layout-grid {
                display: grid;
                grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.9fr);
                gap: 20px;
                margin-top: 20px;
                align-items: start;
            }

            .lylrv-connect-panel-stack {
                display: grid;
                gap: 20px;
            }

            .lylrv-connect-panel {
                padding: 24px;
                border: 1px solid var(--lylrv-border);
                border-radius: 24px;
                background:
                    radial-gradient(circle at top right, rgba(197, 111, 38, 0.06), transparent 32%),
                    var(--lylrv-surface);
                box-shadow: 0 20px 44px -34px rgba(35, 26, 19, 0.24);
            }

            .lylrv-connect-panel--form {
                margin: 0;
            }

            .lylrv-connect-panel__header {
                display: flex;
                gap: 16px;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 18px;
            }

            .lylrv-connect-panel__header--subsection {
                margin-top: 26px;
                padding-top: 26px;
                border-top: 1px solid rgba(88, 62, 39, 0.1);
            }

            .lylrv-connect-panel__header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 800;
                line-height: 1.1;
            }

            .lylrv-connect-panel__header p {
                max-width: 58ch;
                margin: 8px 0 0;
                color: var(--lylrv-muted);
                line-height: 1.6;
            }

            .lylrv-connect-field-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 18px;
            }

            .lylrv-connect-field-grid--single {
                grid-template-columns: minmax(0, 1fr);
                margin-bottom: 18px;
            }

            .lylrv-connect-field-group {
                display: grid;
                gap: 8px;
            }

            .lylrv-connect-label {
                font-size: 13px;
                font-weight: 700;
                line-height: 1.4;
            }

            .lylrv-connect-help {
                margin: 0;
                color: var(--lylrv-muted);
                font-size: 12px;
                line-height: 1.6;
            }

            .lylrv-connect-input,
            .lylrv-connect-admin select,
            .lylrv-connect-admin textarea {
                width: 100%;
                min-height: 46px;
                margin: 0;
                padding: 0 14px;
                border: 1px solid rgba(88, 62, 39, 0.16);
                border-radius: 14px;
                background: #fffdfa;
                color: var(--lylrv-text);
                box-shadow: inset 0 1px 2px rgba(35, 26, 19, 0.04);
                font-size: 14px;
                line-height: 1.4;
            }

            .lylrv-connect-input:focus,
            .lylrv-connect-admin select:focus,
            .lylrv-connect-admin textarea:focus {
                border-color: rgba(197, 111, 38, 0.5);
                box-shadow:
                    0 0 0 4px rgba(197, 111, 38, 0.12),
                    inset 0 1px 2px rgba(35, 26, 19, 0.04);
                outline: none;
            }

            .lylrv-connect-input--mono {
                font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
            }

            .lylrv-connect-form-actions {
                display: flex;
                justify-content: flex-start;
                margin-top: 26px;
            }

            .lylrv-connect-button {
                appearance: none;
                display: inline-flex;
                justify-content: center;
                align-items: center;
                min-height: 44px;
                padding: 0 18px;
                border: 1px solid transparent;
                border-radius: 14px;
                font-size: 13px;
                font-weight: 700;
                line-height: 1;
                text-decoration: none;
                cursor: pointer;
                transition:
                    transform 0.18s ease,
                    box-shadow 0.18s ease,
                    border-color 0.18s ease,
                    background-color 0.18s ease,
                    color 0.18s ease;
            }

            .lylrv-connect-button:hover,
            .lylrv-connect-button:focus {
                transform: translateY(-1px);
                outline: none;
            }

            .lylrv-connect-button--primary {
                background: linear-gradient(135deg, var(--lylrv-primary), #dd8c45);
                color: #fff;
                box-shadow: 0 18px 36px -24px rgba(197, 111, 38, 0.9);
            }

            .lylrv-connect-badge {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                border-radius: 999px;
                padding: 7px 11px;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                white-space: nowrap;
            }

            .lylrv-connect-badge::before {
                content: "";
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: currentColor;
                opacity: 0.85;
            }

            .lylrv-connect-badge--primary {
                background: var(--lylrv-primary-soft);
                color: var(--lylrv-primary-strong);
            }

            .lylrv-connect-badge--success {
                background: var(--lylrv-success-soft);
                color: var(--lylrv-success);
            }

            .lylrv-connect-badge--warning {
                background: var(--lylrv-warning-soft);
                color: var(--lylrv-warning);
            }

            .lylrv-connect-badge--neutral {
                background: rgba(35, 26, 19, 0.06);
                color: var(--lylrv-muted);
            }

            .lylrv-connect-status-list {
                display: grid;
                gap: 12px;
                margin: 0;
            }

            .lylrv-connect-status-list > div {
                display: grid;
                gap: 6px;
                padding: 14px 16px;
                border: 1px solid rgba(88, 62, 39, 0.1);
                border-radius: 16px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(250, 248, 245, 0.85));
            }

            .lylrv-connect-status-list dt {
                color: var(--lylrv-muted);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-transform: uppercase;
            }

            .lylrv-connect-status-list dd {
                margin: 0;
                color: var(--lylrv-text);
                font-size: 14px;
                line-height: 1.6;
                word-break: break-word;
            }

            .lylrv-connect-empty-state {
                padding: 28px;
                border: 1px dashed rgba(88, 62, 39, 0.18);
                border-radius: 18px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(250, 248, 245, 0.9));
                text-align: center;
            }

            .lylrv-connect-empty-state--left {
                text-align: left;
            }

            .lylrv-connect-empty-state__title {
                margin: 0 0 8px;
                font-size: 15px;
                font-weight: 700;
            }

            .lylrv-connect-empty-state p:last-child {
                margin: 0;
                color: var(--lylrv-muted);
                line-height: 1.6;
            }

            @media (max-width: 1280px) {
                .lylrv-connect-metrics {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }

            @media (max-width: 1080px) {
                .lylrv-connect-hero,
                .lylrv-connect-layout-grid,
                .lylrv-connect-field-grid {
                    grid-template-columns: minmax(0, 1fr);
                }
            }

            @media (max-width: 782px) {
                .lylrv-connect-admin-page {
                    margin-right: 10px;
                }

                .lylrv-connect-hero,
                .lylrv-connect-panel {
                    padding: 20px;
                    border-radius: 20px;
                }

                .lylrv-connect-metrics {
                    grid-template-columns: minmax(0, 1fr);
                }

                .lylrv-connect-panel__header {
                    flex-direction: column;
                    align-items: flex-start;
                }
            }
        </style>
        <?php
    }

    private static function render_metric_card($label, $value, $note, $tone)
    {
        ?>
        <article class="lylrv-connect-metric lylrv-connect-metric--<?php echo esc_attr(
            $tone,
        ); ?>">
            <span class="lylrv-connect-metric__label"><?php echo esc_html(
                $label,
            ); ?></span>
            <span class="lylrv-connect-metric__value"><?php echo esc_html(
                $value,
            ); ?></span>
            <span class="lylrv-connect-metric__note"><?php echo esc_html(
                $note,
            ); ?></span>
        </article>
        <?php
    }

    private static function render_status_badge($label, $tone)
    {
        ?>
        <span class="lylrv-connect-badge lylrv-connect-badge--<?php echo esc_attr(
            $tone,
        ); ?>"><?php echo esc_html($label); ?></span>
        <?php
    }
}
