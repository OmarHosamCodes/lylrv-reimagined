<?php
/**
 * Admin trait for Lylrv Connect Plugin.
 *
 * Handles settings registration, sanitization, admin menu,
 * options page rendering, manual sync, and admin notices.
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

        register_setting(self::OPTION_GROUP, self::OPTION_SYNC_ENABLED, [
            "type" => "boolean",
            "default" => 1,
            "sanitize_callback" => [__CLASS__, "sanitize_sync_enabled"],
        ]);

        register_setting(self::OPTION_GROUP, self::OPTION_SYNC_BATCH_SIZE, [
            "type" => "integer",
            "default" => 25,
            "sanitize_callback" => [__CLASS__, "sanitize_batch_size"],
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

        register_setting(self::OPTION_GROUP, self::OPTION_REFERRAL_PARAM, [
            "default" => "ref",
            "sanitize_callback" => [__CLASS__, "sanitize_referral_param"],
        ]);

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_REFERRAL_COUPON_TYPE,
            [
                "default" => "fixed_cart",
                "sanitize_callback" => [
                    __CLASS__,
                    "sanitize_referral_coupon_type",
                ],
            ],
        );

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_REFERRAL_COUPON_AMOUNT,
            [
                "type" => "integer",
                "default" => 10,
                "sanitize_callback" => [
                    __CLASS__,
                    "sanitize_referral_coupon_amount",
                ],
            ],
        );

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
            [
                "type" => "integer",
                "default" => 30,
                "sanitize_callback" => [
                    __CLASS__,
                    "sanitize_referral_coupon_expiry_days",
                ],
            ],
        );

        register_setting(
            self::OPTION_GROUP,
            self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
            [
                "type" => "integer",
                "default" => 1,
                "sanitize_callback" => [
                    __CLASS__,
                    "sanitize_referral_coupon_usage_limit",
                ],
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

    public static function sanitize_sync_enabled($value)
    {
        return empty($value) ? 0 : 1;
    }

    public static function sanitize_batch_size($value)
    {
        $batch_size = absint($value);

        if ($batch_size < 1) {
            $batch_size = 25;
        }

        if ($batch_size > 100) {
            $batch_size = 100;
        }

        return $batch_size;
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

    public static function sanitize_referral_param($value)
    {
        $param = strtolower((string) $value);
        $param = preg_replace("/[^a-z0-9_-]/", "", $param);

        if (empty($param)) {
            return "ref";
        }

        return $param;
    }

    public static function sanitize_referral_coupon_type($value)
    {
        $allowed = ["fixed_cart", "percent", "fixed_product"];
        $type = sanitize_key((string) $value);

        if (!in_array($type, $allowed, true)) {
            return "fixed_cart";
        }

        return $type;
    }

    public static function sanitize_referral_coupon_amount($value)
    {
        $amount = absint($value);
        return $amount > 0 ? $amount : 10;
    }

    public static function sanitize_referral_coupon_expiry_days($value)
    {
        $days = absint($value);
        return $days > 3650 ? 3650 : $days;
    }

    public static function sanitize_referral_coupon_usage_limit($value)
    {
        $limit = absint($value);
        return $limit > 0 ? $limit : 1;
    }

    public static function ensure_sync_secret()
    {
        $secret = get_option(self::OPTION_SYNC_SECRET);

        if (empty($secret)) {
            update_option(self::OPTION_SYNC_SECRET, wp_generate_uuid4(), false);
        }
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
        $sync_enabled = (int) get_option(self::OPTION_SYNC_ENABLED, 1);
        $batch_size = (int) get_option(self::OPTION_SYNC_BATCH_SIZE, 25);
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
        $referral_param = self::get_referral_param_name();
        $coupon_type = self::get_referral_coupon_type();
        $coupon_amount = self::get_referral_coupon_amount();
        $coupon_expiry_days = self::get_referral_coupon_expiry_days();
        $coupon_usage_limit = self::get_referral_coupon_usage_limit();
        $woocommerce_ready = self::is_woocommerce_available();
        $settings_ready = self::is_sync_ready();
        $recent_referrals = self::get_recent_referral_orders();
        $last_customers_sync = self::format_sync_time(
            get_option(self::OPTION_LAST_CUSTOMERS_SYNC),
        );
        $last_orders_sync = self::format_sync_time(
            get_option(self::OPTION_LAST_ORDERS_SYNC),
        );
        $last_sync_error_raw = (string) get_option(
            self::OPTION_LAST_SYNC_ERROR,
        );
        $last_sync_error = self::format_error($last_sync_error_raw);
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
                            "Manage the storefront connection, automate WooCommerce sync, and control the local referral reward rules from a single branded control room.",
                            "lylrv-connect",
                        ); ?></p>
                        <div class="lylrv-connect-hero__meta">
                            <?php self::render_status_badge(
                                $settings_ready
                                    ? __("Sync ready", "lylrv-connect")
                                    : __("Needs setup", "lylrv-connect"),
                                $settings_ready ? "success" : "warning",
                            ); ?>
                            <?php self::render_status_badge(
                                $woocommerce_ready
                                    ? __("WooCommerce active", "lylrv-connect")
                                    : __(
                                        "WooCommerce unavailable",
                                        "lylrv-connect",
                                    ),
                                $woocommerce_ready ? "success" : "warning",
                            ); ?>
                            <?php self::render_status_badge(
                                $sync_enabled
                                    ? __("Auto sync enabled", "lylrv-connect")
                                    : __("Auto sync paused", "lylrv-connect"),
                                $sync_enabled ? "primary" : "neutral",
                            ); ?>
                        </div>
                    </div>
                    <div class="lylrv-connect-hero__actions">
                        <div class="lylrv-connect-glass-card">
                            <span class="lylrv-connect-glass-card__label"><?php echo esc_html__(
                                "Destination",
                                "lylrv-connect",
                            ); ?></span>
                            <a class="lylrv-connect-link" href="<?php echo esc_url(
                                $saas_url,
                            ); ?>" target="_blank" rel="noreferrer noopener"><?php echo esc_html(
    $saas_url,
); ?></a>
                            <p><?php echo esc_html__(
                                "The same warm, card-based UI language used across the Lylrv apps, adapted for WordPress admin.",
                                "lylrv-connect",
                            ); ?></p>
                        </div>
                    </div>
                </section>

                <?php if (!$woocommerce_ready): ?>
                    <div class="lylrv-connect-inline-alert lylrv-connect-inline-alert--warning">
                        <strong><?php echo esc_html__(
                            "WooCommerce not detected.",
                            "lylrv-connect",
                        ); ?></strong>
                        <span><?php echo esc_html__(
                            "Widget injection still works, but order sync and referral rewards require WooCommerce.",
                            "lylrv-connect",
                        ); ?></span>
                    </div>
                <?php endif; ?>

                <section class="lylrv-connect-metrics" aria-label="<?php echo esc_attr__(
                    "Overview",
                    "lylrv-connect",
                ); ?>">
                    <?php self::render_metric_card(
                        __("Configuration", "lylrv-connect"),
                        $settings_ready
                            ? __("Ready", "lylrv-connect")
                            : __("Incomplete", "lylrv-connect"),
                        $settings_ready
                            ? __(
                                "Credentials and sync settings are valid.",
                                "lylrv-connect",
                            )
                            : __(
                                "Add a valid API key and SaaS URL to sync.",
                                "lylrv-connect",
                            ),
                        $settings_ready ? "success" : "warning",
                    ); ?>
                    <?php self::render_metric_card(
                        __("WooCommerce", "lylrv-connect"),
                        $woocommerce_ready
                            ? __("Connected", "lylrv-connect")
                            : __("Optional", "lylrv-connect"),
                        $woocommerce_ready
                            ? __(
                                "Orders and rewards can sync normally.",
                                "lylrv-connect",
                            )
                            : __(
                                "Required for order and referral reward flows.",
                                "lylrv-connect",
                            ),
                        $woocommerce_ready ? "success" : "neutral",
                    ); ?>
                    <?php self::render_metric_card(
                        __("Batch Size", "lylrv-connect"),
                        (string) $batch_size,
                        __("Records sent per sync request.", "lylrv-connect"),
                        "primary",
                    ); ?>
                    <?php self::render_metric_card(
                        __("Referral Key", "lylrv-connect"),
                        "?" . $referral_param,
                        __(
                            "Incoming referral links are captured from this parameter.",
                            "lylrv-connect",
                        ),
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
                                    "Point WordPress at the correct Lylrv workspace and control how sync jobs behave.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                            <?php self::render_status_badge(
                                $sync_enabled
                                    ? __("Live", "lylrv-connect")
                                    : __("Paused", "lylrv-connect"),
                                $sync_enabled ? "success" : "warning",
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
                                    "Enter the Lylrv API key for the client you want to sync.",
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
                                    "The URL where the Lylrv application is hosted, for example https://app.lylrv.com.",
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
                                    "Assign block-editor pages for the SaaS-backed storefront routes. These pages are rendered under a separate storefront URL base and stay independent from WooCommerce.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-field-grid">
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
                                    "Default is store, producing routes like /store/product-slug/, /store/cart/, and /store/checkout/.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-field-grid">
                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_STOREFRONT_PRODUCT_PAGE_ID,
                                ); ?>"><?php echo esc_html__(
    "Product Page",
    "lylrv-connect",
); ?></label>
                                <?php wp_dropdown_pages([
                                    "name" =>
                                        self::OPTION_STOREFRONT_PRODUCT_PAGE_ID,
                                    "id" =>
                                        self::OPTION_STOREFRONT_PRODUCT_PAGE_ID,
                                    "show_option_none" => __(
                                        "Use plugin fallback layout",
                                        "lylrv-connect",
                                    ),
                                    "option_none_value" => 0,
                                    "selected" => $storefront_product_page_id,
                                    "class" => "lylrv-connect-input",
                                ]); ?>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_STOREFRONT_CART_PAGE_ID,
                                ); ?>"><?php echo esc_html__(
    "Cart Page",
    "lylrv-connect",
); ?></label>
                                <?php wp_dropdown_pages([
                                    "name" =>
                                        self::OPTION_STOREFRONT_CART_PAGE_ID,
                                    "id" =>
                                        self::OPTION_STOREFRONT_CART_PAGE_ID,
                                    "show_option_none" => __(
                                        "Use plugin fallback layout",
                                        "lylrv-connect",
                                    ),
                                    "option_none_value" => 0,
                                    "selected" => $storefront_cart_page_id,
                                    "class" => "lylrv-connect-input",
                                ]); ?>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID,
                                ); ?>"><?php echo esc_html__(
    "Checkout Page",
    "lylrv-connect",
); ?></label>
                                <?php wp_dropdown_pages([
                                    "name" =>
                                        self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID,
                                    "id" =>
                                        self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID,
                                    "show_option_none" => __(
                                        "Use plugin fallback layout",
                                        "lylrv-connect",
                                    ),
                                    "option_none_value" => 0,
                                    "selected" => $storefront_checkout_page_id,
                                    "class" => "lylrv-connect-input",
                                ]); ?>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID,
                                ); ?>"><?php echo esc_html__(
    "Thank-You Page",
    "lylrv-connect",
); ?></label>
                                <?php wp_dropdown_pages([
                                    "name" =>
                                        self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID,
                                    "id" =>
                                        self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID,
                                    "show_option_none" => __(
                                        "Use plugin fallback layout",
                                        "lylrv-connect",
                                    ),
                                    "option_none_value" => 0,
                                    "selected" => $storefront_thank_you_page_id,
                                    "class" => "lylrv-connect-input",
                                ]); ?>
                            </div>
                        </div>

                        <div class="lylrv-connect-toggle-card">
                            <label class="lylrv-connect-toggle" for="<?php echo esc_attr(
                                self::OPTION_SYNC_ENABLED,
                            ); ?>">
                                <input
                                    type="checkbox"
                                    id="<?php echo esc_attr(
                                        self::OPTION_SYNC_ENABLED,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_SYNC_ENABLED,
                                    ); ?>"
                                    value="1"
                                    <?php checked(1, $sync_enabled); ?>
                                />
                                <span class="lylrv-connect-toggle__track" aria-hidden="true"></span>
                                <span class="lylrv-connect-toggle__content">
                                    <span class="lylrv-connect-toggle__title"><?php echo esc_html__(
                                        "WooCommerce Sync",
                                        "lylrv-connect",
                                    ); ?></span>
                                    <span class="lylrv-connect-toggle__description"><?php echo esc_html__(
                                        "Sync WooCommerce customers, orders, and referral rewards to Lylrv automatically.",
                                        "lylrv-connect",
                                    ); ?></span>
                                </span>
                            </label>
                        </div>

                        <div class="lylrv-connect-field-grid lylrv-connect-field-grid--single">
                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_SYNC_BATCH_SIZE,
                                ); ?>"><?php echo esc_html__(
    "Sync Batch Size",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    id="<?php echo esc_attr(
                                        self::OPTION_SYNC_BATCH_SIZE,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_SYNC_BATCH_SIZE,
                                    ); ?>"
                                    value="<?php echo esc_attr(
                                        (string) $batch_size,
                                    ); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--small"
                                />
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "How many records to send in each sync request. Lower this if your host has strict request limits.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-panel__header lylrv-connect-panel__header--subsection">
                            <div>
                                <h2><?php echo esc_html__(
                                    "Referral Engine",
                                    "lylrv-connect",
                                ); ?></h2>
                                <p><?php echo esc_html__(
                                    "Define how referral links are captured and how rewards are generated for successful referrals.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>
                        </div>

                        <div class="lylrv-connect-field-grid">
                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_REFERRAL_PARAM,
                                ); ?>"><?php echo esc_html__(
    "Referral Query Parameter",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="text"
                                    id="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_PARAM,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_PARAM,
                                    ); ?>"
                                    value="<?php echo esc_attr(
                                        $referral_param,
                                    ); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--mono"
                                />
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "Incoming referral links will be captured from this query string key. Example: ?ref=ABC123",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_REFERRAL_COUPON_TYPE,
                                ); ?>"><?php echo esc_html__(
    "Reward Coupon Type",
    "lylrv-connect",
); ?></label>
                                <select
                                    id="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_TYPE,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_TYPE,
                                    ); ?>"
                                    class="lylrv-connect-input"
                                >
                                    <option value="fixed_cart" <?php selected(
                                        "fixed_cart",
                                        $coupon_type,
                                    ); ?>><?php echo esc_html__(
    "Fixed cart discount",
    "lylrv-connect",
); ?></option>
                                    <option value="percent" <?php selected(
                                        "percent",
                                        $coupon_type,
                                    ); ?>><?php echo esc_html__(
    "Percentage discount",
    "lylrv-connect",
); ?></option>
                                    <option value="fixed_product" <?php selected(
                                        "fixed_product",
                                        $coupon_type,
                                    ); ?>><?php echo esc_html__(
    "Fixed product discount",
    "lylrv-connect",
); ?></option>
                                </select>
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "The reward coupon that gets issued to the referrer after the first referred order reaches completed.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_REFERRAL_COUPON_AMOUNT,
                                ); ?>"><?php echo esc_html__(
    "Reward Coupon Amount",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="number"
                                    min="1"
                                    id="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_AMOUNT,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_AMOUNT,
                                    ); ?>"
                                    value="<?php echo esc_attr(
                                        (string) $coupon_amount,
                                    ); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--small"
                                />
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
                                ); ?>"><?php echo esc_html__(
    "Reward Coupon Expiry (Days)",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="number"
                                    min="0"
                                    max="3650"
                                    id="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
                                    ); ?>"
                                    value="<?php echo esc_attr(
                                        (string) $coupon_expiry_days,
                                    ); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--small"
                                />
                                <p class="lylrv-connect-help"><?php echo esc_html__(
                                    "Set to 0 for no expiry.",
                                    "lylrv-connect",
                                ); ?></p>
                            </div>

                            <div class="lylrv-connect-field-group">
                                <label class="lylrv-connect-label" for="<?php echo esc_attr(
                                    self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
                                ); ?>"><?php echo esc_html__(
    "Reward Coupon Usage Limit",
    "lylrv-connect",
); ?></label>
                                <input
                                    type="number"
                                    min="1"
                                    id="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
                                    ); ?>"
                                    name="<?php echo esc_attr(
                                        self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
                                    ); ?>"
                                    value="<?php echo esc_attr(
                                        (string) $coupon_usage_limit,
                                    ); ?>"
                                    class="lylrv-connect-input lylrv-connect-input--small"
                                />
                            </div>
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
                                        "Sync Status",
                                        "lylrv-connect",
                                    ); ?></h2>
                                    <p><?php echo esc_html__(
                                        "Current connection health and the latest sync activity.",
                                        "lylrv-connect",
                                    ); ?></p>
                                </div>
                                <?php self::render_status_badge(
                                    $settings_ready
                                        ? __("Healthy", "lylrv-connect")
                                        : __(
                                            "Attention needed",
                                            "lylrv-connect",
                                        ),
                                    $settings_ready ? "success" : "warning",
                                ); ?>
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
                                        "Configuration Ready",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd>
                                        <?php self::render_status_badge(
                                            $settings_ready
                                                ? __("Yes", "lylrv-connect")
                                                : __("No", "lylrv-connect"),
                                            $settings_ready
                                                ? "success"
                                                : "warning",
                                        ); ?>
                                    </dd>
                                </div>
                                <div>
                                    <dt><?php echo esc_html__(
                                        "Last Customers Sync",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd><?php echo esc_html(
                                        $last_customers_sync,
                                    ); ?></dd>
                                </div>
                                <div>
                                    <dt><?php echo esc_html__(
                                        "Last Orders Sync",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd><?php echo esc_html(
                                        $last_orders_sync,
                                    ); ?></dd>
                                </div>
                                <div class="lylrv-connect-status-list__error">
                                    <dt><?php echo esc_html__(
                                        "Last Error",
                                        "lylrv-connect",
                                    ); ?></dt>
                                    <dd class="<?php echo esc_attr(
                                        empty($last_sync_error_raw)
                                            ? ""
                                            : "lylrv-connect-status-list__error-text",
                                    ); ?>"><?php echo esc_html(
    $last_sync_error,
); ?></dd>
                                </div>
                            </dl>
                        </section>

                        <section class="lylrv-connect-panel">
                            <div class="lylrv-connect-panel__header">
                                <div>
                                    <h2><?php echo esc_html__(
                                        "Manual Sync",
                                        "lylrv-connect",
                                    ); ?></h2>
                                    <p><?php echo esc_html__(
                                        "Use these controls to backfill historical data or force a resync after changing settings.",
                                        "lylrv-connect",
                                    ); ?></p>
                                </div>
                            </div>

                            <div class="lylrv-connect-sync-actions">
                                <?php self::render_manual_sync_form(
                                    "customers",
                                    __("Sync Customers", "lylrv-connect"),
                                    !$settings_ready,
                                ); ?>
                                <?php self::render_manual_sync_form(
                                    "orders",
                                    __("Sync Orders", "lylrv-connect"),
                                    !$settings_ready || !$woocommerce_ready,
                                ); ?>
                                <?php self::render_manual_sync_form(
                                    "all",
                                    __("Sync Everything", "lylrv-connect"),
                                    !$settings_ready || !$woocommerce_ready,
                                ); ?>
                            </div>
                        </section>
                    </div>
                </div>

                <section class="lylrv-connect-panel lylrv-connect-panel--table">
                    <div class="lylrv-connect-panel__header">
                        <div>
                            <h2><?php echo esc_html__(
                                "Recent Referral Orders",
                                "lylrv-connect",
                            ); ?></h2>
                            <p><?php echo esc_html__(
                                "A quick look at recently captured referral orders and the reward state attached to each one.",
                                "lylrv-connect",
                            ); ?></p>
                        </div>
                        <?php if ($woocommerce_ready): ?>
                            <?php self::render_status_badge(
                                sprintf(
                                    /* translators: %d: number of orders */
                                    _n(
                                        "%d order",
                                        "%d orders",
                                        count($recent_referrals),
                                        "lylrv-connect",
                                    ),
                                    count($recent_referrals),
                                ),
                                "neutral",
                            ); ?>
                        <?php else: ?>
                            <?php self::render_status_badge(
                                __("WooCommerce required", "lylrv-connect"),
                                "warning",
                            ); ?>
                        <?php endif; ?>
                    </div>

                    <?php if (!$woocommerce_ready): ?>
                        <div class="lylrv-connect-empty-state">
                            <p class="lylrv-connect-empty-state__title"><?php echo esc_html__(
                                "Referral activity will appear here once WooCommerce is active.",
                                "lylrv-connect",
                            ); ?></p>
                            <p><?php echo esc_html__(
                                "Install and activate WooCommerce to enable order sync and referral reward issuance.",
                                "lylrv-connect",
                            ); ?></p>
                        </div>
                    <?php elseif (!empty($recent_referrals)): ?>
                        <div class="lylrv-connect-table-wrap">
                            <table class="lylrv-connect-table">
                                <thead>
                                    <tr>
                                        <th><?php echo esc_html__(
                                            "Order",
                                            "lylrv-connect",
                                        ); ?></th>
                                        <th><?php echo esc_html__(
                                            "Buyer",
                                            "lylrv-connect",
                                        ); ?></th>
                                        <th><?php echo esc_html__(
                                            "Code",
                                            "lylrv-connect",
                                        ); ?></th>
                                        <th><?php echo esc_html__(
                                            "Status",
                                            "lylrv-connect",
                                        ); ?></th>
                                        <th><?php echo esc_html__(
                                            "Coupon",
                                            "lylrv-connect",
                                        ); ?></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php foreach (
                                        $recent_referrals
                                        as $referral_order
                                    ): ?>
                                        <?php
                                        $status_value = (string) $referral_order->get_meta(
                                            self::ORDER_META_REFERRAL_STATUS,
                                        );
                                        $status_label = self::format_referral_status(
                                            $status_value,
                                        );
                                        $coupon_code =
                                            (string) $referral_order->get_meta(
                                                self::ORDER_META_REWARD_COUPON_CODE,
                                            ) ?:
                                            "—";
                                        ?>
                                        <tr>
                                            <td>
                                                <span class="lylrv-connect-table__primary">#<?php echo esc_html(
                                                    (string) $referral_order->get_id(),
                                                ); ?></span>
                                            </td>
                                            <td><?php echo esc_html(
                                                self::normalize_email(
                                                    $referral_order->get_billing_email(),
                                                ) ?:
                                                __("Unknown", "lylrv-connect"),
                                            ); ?></td>
                                            <td><code><?php echo esc_html(
                                                (string) $referral_order->get_meta(
                                                    self::ORDER_META_REFERRAL_CODE,
                                                ),
                                            ); ?></code></td>
                                            <td>
                                                <?php self::render_status_badge(
                                                    $status_label,
                                                    self::get_referral_status_tone(
                                                        $status_value,
                                                    ),
                                                ); ?>
                                            </td>
                                            <td>
                                                <span class="lylrv-connect-code-pill"><?php echo esc_html(
                                                    $coupon_code,
                                                ); ?></span>
                                            </td>
                                        </tr>
                                    <?php endforeach; ?>
                                </tbody>
                            </table>
                        </div>
                    <?php else: ?>
                        <div class="lylrv-connect-empty-state">
                            <p class="lylrv-connect-empty-state__title"><?php echo esc_html__(
                                "No referral orders have been captured yet.",
                                "lylrv-connect",
                            ); ?></p>
                            <p><?php echo esc_html__(
                                "When customers arrive through referral links and place their first qualifying order, the activity will appear here.",
                                "lylrv-connect",
                            ); ?></p>
                        </div>
                    <?php endif; ?>
                </section>
            </div>
        </div>
        <?php
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
                --lylrv-danger: #b54e39;
                --lylrv-danger-soft: rgba(181, 78, 57, 0.12);
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

            .lylrv-connect-inline-alert {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                align-items: center;
                margin-top: 18px;
                padding: 14px 16px;
                border: 1px solid var(--lylrv-border);
                border-radius: 16px;
                background: var(--lylrv-surface);
            }

            .lylrv-connect-inline-alert--warning {
                border-color: rgba(168, 106, 24, 0.22);
                background: linear-gradient(135deg, #fff8eb, #fffdf9);
            }

            .lylrv-connect-inline-alert strong {
                font-size: 13px;
            }

            .lylrv-connect-inline-alert span {
                color: var(--lylrv-muted);
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

            .lylrv-connect-panel--table {
                margin-top: 20px;
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
                margin-top: 18px;
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

            .lylrv-connect-input--small {
                max-width: 140px;
            }

            .lylrv-connect-input--mono {
                font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
            }

            .lylrv-connect-toggle-card {
                margin-top: 18px;
                padding: 16px;
                border: 1px solid rgba(88, 62, 39, 0.1);
                border-radius: 18px;
                background: linear-gradient(135deg, rgba(197, 111, 38, 0.06), rgba(255, 255, 255, 0.92));
            }

            .lylrv-connect-toggle {
                position: relative;
                display: grid;
                grid-template-columns: 56px minmax(0, 1fr);
                gap: 14px;
                align-items: center;
                cursor: pointer;
            }

            .lylrv-connect-toggle input {
                position: absolute;
                opacity: 0;
                pointer-events: none;
            }

            .lylrv-connect-toggle__track {
                position: relative;
                display: block;
                width: 56px;
                height: 32px;
                border-radius: 999px;
                background: rgba(35, 26, 19, 0.15);
                transition: background-color 0.2s ease;
            }

            .lylrv-connect-toggle__track::after {
                content: "";
                position: absolute;
                top: 4px;
                left: 4px;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background: #fff;
                box-shadow: 0 3px 10px rgba(35, 26, 19, 0.2);
                transition: transform 0.2s ease;
            }

            .lylrv-connect-toggle input:checked + .lylrv-connect-toggle__track {
                background: linear-gradient(135deg, var(--lylrv-primary), #d88943);
            }

            .lylrv-connect-toggle input:checked + .lylrv-connect-toggle__track::after {
                transform: translateX(24px);
            }

            .lylrv-connect-toggle input:focus + .lylrv-connect-toggle__track {
                box-shadow: 0 0 0 4px rgba(197, 111, 38, 0.15);
            }

            .lylrv-connect-toggle__content {
                display: grid;
                gap: 6px;
            }

            .lylrv-connect-toggle__title {
                display: block;
                font-size: 14px;
                font-weight: 700;
            }

            .lylrv-connect-toggle__description {
                display: block;
                color: var(--lylrv-muted);
                line-height: 1.6;
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

            .lylrv-connect-button:disabled,
            .lylrv-connect-button[disabled] {
                transform: none;
                opacity: 0.48;
                cursor: not-allowed;
                box-shadow: none;
            }

            .lylrv-connect-button--primary {
                background: linear-gradient(135deg, var(--lylrv-primary), #dd8c45);
                color: #fff;
                box-shadow: 0 18px 36px -24px rgba(197, 111, 38, 0.9);
            }

            .lylrv-connect-button--secondary {
                width: 100%;
                border-color: rgba(88, 62, 39, 0.12);
                background: #fffdfa;
                color: var(--lylrv-text);
                box-shadow: 0 10px 22px -20px rgba(35, 26, 19, 0.35);
            }

            .lylrv-connect-button--secondary:hover,
            .lylrv-connect-button--secondary:focus {
                border-color: rgba(197, 111, 38, 0.28);
                background: #fff8f1;
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

            .lylrv-connect-badge--danger {
                background: var(--lylrv-danger-soft);
                color: var(--lylrv-danger);
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

            .lylrv-connect-status-list__error {
                border-color: rgba(181, 78, 57, 0.18);
                background: linear-gradient(180deg, rgba(253, 233, 229, 0.45), rgba(255, 253, 249, 0.94));
            }

            .lylrv-connect-status-list__error-text {
                color: var(--lylrv-danger);
                font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
                font-size: 12px;
            }

            .lylrv-connect-sync-actions {
                display: grid;
                gap: 14px;
            }

            .lylrv-connect-sync-form {
                display: grid;
                gap: 12px;
                padding: 16px;
                border: 1px solid rgba(88, 62, 39, 0.1);
                border-radius: 18px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(250, 248, 245, 0.92));
            }

            .lylrv-connect-sync-form__title {
                font-size: 14px;
                font-weight: 700;
            }

            .lylrv-connect-sync-form__description {
                color: var(--lylrv-muted);
                font-size: 12px;
                line-height: 1.6;
            }

            .lylrv-connect-table-wrap {
                overflow-x: auto;
                margin-top: 4px;
            }

            .lylrv-connect-table {
                width: 100%;
                border-collapse: separate;
                border-spacing: 0;
                min-width: 720px;
            }

            .lylrv-connect-table thead th {
                padding: 0 14px 12px;
                color: var(--lylrv-muted);
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.12em;
                text-align: left;
                text-transform: uppercase;
            }

            .lylrv-connect-table tbody td {
                padding: 14px;
                border-top: 1px solid rgba(88, 62, 39, 0.08);
                font-size: 13px;
                vertical-align: middle;
            }

            .lylrv-connect-table tbody tr:hover {
                background: rgba(197, 111, 38, 0.04);
            }

            .lylrv-connect-table__primary {
                font-weight: 700;
            }

            .lylrv-connect-code-pill {
                display: inline-flex;
                align-items: center;
                min-height: 30px;
                padding: 0 10px;
                border-radius: 999px;
                background: rgba(35, 26, 19, 0.06);
                font-family: "Geist Mono", "SFMono-Regular", Consolas, monospace;
                font-size: 12px;
            }

            .lylrv-connect-empty-state {
                padding: 28px;
                border: 1px dashed rgba(88, 62, 39, 0.18);
                border-radius: 18px;
                background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(250, 248, 245, 0.9));
                text-align: center;
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

            .notice.lylrv-connect-notice {
                border: 0;
                border-radius: 16px;
                box-shadow: 0 18px 32px -24px rgba(35, 26, 19, 0.34);
                margin: 16px 20px 0 0;
                overflow: hidden;
            }

            .notice.lylrv-connect-notice p {
                margin: 0;
                padding: 14px 18px;
                font-size: 13px;
                line-height: 1.6;
            }

            .notice.lylrv-connect-notice.notice-success {
                background: linear-gradient(135deg, rgba(31, 143, 99, 0.12), #fffdf9 64%);
            }

            .notice.lylrv-connect-notice.notice-warning {
                background: linear-gradient(135deg, rgba(168, 106, 24, 0.14), #fffdf9 64%);
            }

            .notice.lylrv-connect-notice.notice-error {
                background: linear-gradient(135deg, rgba(181, 78, 57, 0.14), #fffdf9 64%);
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

                .lylrv-connect-toggle {
                    grid-template-columns: minmax(0, 1fr);
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

    private static function get_referral_status_tone($status)
    {
        $status = sanitize_key((string) $status);

        if ("" === $status || "captured" === $status || "pending" === $status) {
            return "primary";
        }

        if (
            false !== strpos($status, "complete") ||
            false !== strpos($status, "reward") ||
            false !== strpos($status, "issued") ||
            false !== strpos($status, "approved")
        ) {
            return "success";
        }

        if (
            false !== strpos($status, "reject") ||
            false !== strpos($status, "fail") ||
            false !== strpos($status, "revoke") ||
            false !== strpos($status, "cancel")
        ) {
            return "danger";
        }

        return "neutral";
    }

    private static function render_manual_sync_form(
        $resource,
        $label,
        $disabled,
    ) {
        $description = __(
            "Force a complete sync for all supported records.",
            "lylrv-connect",
        );

        if ("customers" === $resource) {
            $description = __(
                "Backfill customer identities, profiles, and synced customer data.",
                "lylrv-connect",
            );
        } elseif ("orders" === $resource) {
            $description = __(
                "Push WooCommerce orders and referral reward events to Lylrv.",
                "lylrv-connect",
            );
        }
        ?>
        <form method="post" action="<?php echo esc_url(
            admin_url("admin-post.php"),
        ); ?>" class="lylrv-connect-sync-form">
            <?php wp_nonce_field(self::MANUAL_SYNC_ACTION); ?>
            <input type="hidden" name="action" value="<?php echo esc_attr(
                self::MANUAL_SYNC_ACTION,
            ); ?>" />
            <input type="hidden" name="resource" value="<?php echo esc_attr(
                $resource,
            ); ?>" />
            <div>
                <div class="lylrv-connect-sync-form__title"><?php echo esc_html(
                    $label,
                ); ?></div>
                <div class="lylrv-connect-sync-form__description"><?php echo esc_html(
                    $description,
                ); ?></div>
            </div>
            <button
                type="submit"
                class="lylrv-connect-button lylrv-connect-button--secondary"
                <?php disabled($disabled); ?>
            ><?php echo esc_html($label); ?></button>
        </form>
        <?php
    }

    public static function render_admin_notice()
    {
        if (!is_admin() || !current_user_can("manage_options")) {
            return;
        }

        $screen = get_current_screen();
        if (!$screen || "settings_page_lylrv-connect" !== $screen->id) {
            return;
        }

        $notice = get_transient(self::get_notice_key());
        if (empty($notice) || !is_array($notice)) {
            return;
        }

        delete_transient(self::get_notice_key());
        $type = !empty($notice["type"]) ? $notice["type"] : "success";
        $message = !empty($notice["message"]) ? $notice["message"] : "";

        if (empty($message)) {
            return;
        }
        ?>
        <div class="notice notice-<?php echo esc_attr(
            $type,
        ); ?> is-dismissible lylrv-connect-notice">
            <p><?php echo esc_html($message); ?></p>
        </div>
        <?php
    }

    public static function handle_manual_sync()
    {
        if (!current_user_can("manage_options")) {
            wp_die(
                esc_html__("You are not allowed to do that.", "lylrv-connect"),
            );
        }

        check_admin_referer(self::MANUAL_SYNC_ACTION);

        $resource = "all";
        if (isset($_POST["resource"])) {
            $resource = sanitize_key(wp_unslash($_POST["resource"]));
        }

        $notice = [
            "type" => "success",
            "message" => __("Sync completed.", "lylrv-connect"),
        ];

        if (!self::is_sync_ready()) {
            $notice = [
                "type" => "error",
                "message" => __(
                    "Add a valid API key and SaaS URL before syncing.",
                    "lylrv-connect",
                ),
            ];
        } else {
            if (function_exists("set_time_limit")) {
                @set_time_limit(0);
            }

            if ("customers" === $resource) {
                $result = self::full_sync_users();
            } elseif ("orders" === $resource) {
                $result = self::full_sync_orders();
            } else {
                $user_result = self::full_sync_users();
                $order_result = self::full_sync_orders();

                if (is_wp_error($user_result)) {
                    $result = $user_result;
                } elseif (is_wp_error($order_result)) {
                    $result = $order_result;
                } else {
                    $result = [
                        "customers" =>
                            $user_result["customers"] +
                            $order_result["customers"],
                        "orders" => $order_result["orders"],
                    ];
                }
            }

            if (is_wp_error($result)) {
                $notice = [
                    "type" => "error",
                    "message" => $result->get_error_message(),
                ];
            } else {
                $message = sprintf(
                    /* translators: 1: customer count, 2: order count */
                    __(
                        'Sync finished. Customers sent: %1$d. Orders sent: %2$d.',
                        "lylrv-connect",
                    ),
                    isset($result["customers"])
                        ? (int) $result["customers"]
                        : 0,
                    isset($result["orders"]) ? (int) $result["orders"] : 0,
                );

                $notice = [
                    "type" => "success",
                    "message" => $message,
                ];
            }
        }

        set_transient(self::get_notice_key(), $notice, MINUTE_IN_SECONDS);
        wp_safe_redirect(admin_url("options-general.php?page=lylrv-connect"));
        exit();
    }
}
