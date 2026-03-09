<?php
/**
 * Plugin Name: Lylrv Connect
 * Plugin URI: https://lylrv.com
 * Description: Connects your WordPress site to Lylrv to display loyalty widgets and sync WooCommerce customers, orders, and referral rewards.
 * Version: 1.2.0
 * Author: Lylrv
 * Author URI: https://lylrv.com
 * License: GPLv2 or later
 * Text Domain: lylrv-connect
 */

if (!defined("ABSPATH")) {
    exit();
}

define("LYLRV_CONNECT_VERSION", "1.2.0");
define("LYLRV_CONNECT_PLUGIN_DIR", plugin_dir_path(__FILE__));
define("LYLRV_CONNECT_PLUGIN_URL", plugin_dir_url(__FILE__));

require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-helpers.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-admin.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-sync.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-widgets.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-referral.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-coupon-bridge.php";

final class Lylrv_Connect_Plugin
{
    use Lylrv_Connect_Helpers;
    use Lylrv_Connect_Admin;
    use Lylrv_Connect_Sync;
    use Lylrv_Connect_Widgets;
    use Lylrv_Connect_Referral;
    use Lylrv_Connect_Coupon_Bridge;

    private static $referral_coupon_error_messages = [];

    const OPTION_GROUP = "lylrv_connect_options";
    const OPTION_API_KEY = "lylrv_api_key";
    const OPTION_SAAS_URL = "lylrv_saas_url";
    const OPTION_SYNC_ENABLED = "lylrv_sync_enabled";
    const OPTION_SYNC_BATCH_SIZE = "lylrv_sync_batch_size";
    const OPTION_SYNC_SECRET = "lylrv_sync_secret";
    const OPTION_LAST_SYNC_ERROR = "lylrv_last_sync_error";
    const OPTION_LAST_CUSTOMERS_SYNC = "lylrv_last_customers_sync";
    const OPTION_LAST_ORDERS_SYNC = "lylrv_last_orders_sync";
    const OPTION_LAST_USERS_CURSOR = "lylrv_last_users_cursor";
    const OPTION_LAST_ORDERS_CURSOR = "lylrv_last_orders_cursor";
    const OPTION_LAST_SYNC_SITE = "lylrv_last_sync_site";
    const OPTION_REFERRAL_PARAM = "lylrv_referral_param";
    const OPTION_REFERRAL_COUPON_TYPE = "lylrv_referral_coupon_type";
    const OPTION_REFERRAL_COUPON_AMOUNT = "lylrv_referral_coupon_amount";
    const OPTION_REFERRAL_COUPON_EXPIRY_DAYS = "lylrv_referral_coupon_expiry_days";
    const OPTION_REFERRAL_COUPON_USAGE_LIMIT = "lylrv_referral_coupon_usage_limit";
    const CRON_HOOK = "lylrv_connect_cron_sync";
    const MANUAL_SYNC_ACTION = "lylrv_connect_manual_sync";
    const COOKIE_REFERRAL_CODE = "lylrv_referral_code";
    const USER_META_REFERRAL_CODE = "lylrv_referral_code";
    const ORDER_META_REFERRAL_CODE = "_lylrv_referral_code";
    const ORDER_META_REFERRER_USER_ID = "_lylrv_referrer_user_id";
    const ORDER_META_REFERRAL_STATUS = "_lylrv_referral_status";
    const ORDER_META_REFERRAL_REASON = "_lylrv_referral_reason";
    const ORDER_META_REWARD_COUPON_ID = "_lylrv_referral_coupon_id";
    const ORDER_META_REWARD_COUPON_CODE = "_lylrv_referral_coupon_code";
    const ORDER_META_REWARD_COUPON_TYPE = "_lylrv_referral_coupon_type";
    const ORDER_META_REWARD_COUPON_AMOUNT = "_lylrv_referral_coupon_amount";
    const ORDER_META_REWARD_ISSUED_AT = "_lylrv_referral_reward_issued_at";
    const ORDER_META_REWARD_REVOKED_AT = "_lylrv_referral_reward_revoked_at";

    public static function init()
    {
        add_action("init", [__CLASS__, "ensure_sync_secret"], 5);
        add_action("init", [__CLASS__, "maybe_schedule_cron"], 10);
        add_action("init", [__CLASS__, "maybe_capture_referral_code"], 20);
        add_action("admin_init", [__CLASS__, "register_settings"]);
        add_action("admin_menu", [__CLASS__, "register_menu"]);
        add_action("admin_notices", [__CLASS__, "render_admin_notice"]);
        add_action("wp_enqueue_scripts", [__CLASS__, "enqueue_widget_script"]);
        add_filter("script_loader_tag", [__CLASS__, "add_module_type"], 10, 3);
        add_action("wp_footer", [__CLASS__, "inject_widget_containers"]);
        add_shortcode("lylrv_widget", [__CLASS__, "widget_shortcode"]);
        add_filter("cron_schedules", [__CLASS__, "register_cron_schedule"]);
        add_action(self::CRON_HOOK, [__CLASS__, "run_scheduled_sync"]);
        add_action("admin_post_" . self::MANUAL_SYNC_ACTION, [
            __CLASS__,
            "handle_manual_sync",
        ]);
        add_action("user_register", [__CLASS__, "handle_user_event"]);
        add_action("profile_update", [__CLASS__, "handle_user_event"], 10, 2);
        add_action("woocommerce_created_customer", [
            __CLASS__,
            "handle_user_event",
        ]);
        add_action(
            "woocommerce_checkout_create_order",
            [__CLASS__, "capture_referral_on_checkout"],
            10,
            2,
        );
        add_action("woocommerce_thankyou", [
            __CLASS__,
            "clear_referral_tracking_after_checkout",
        ]);
        add_action("woocommerce_new_order", [__CLASS__, "handle_order_event"]);
        add_action("woocommerce_update_order", [
            __CLASS__,
            "handle_order_event",
        ]);
        add_action(
            "woocommerce_order_status_changed",
            [__CLASS__, "handle_order_status_event"],
            10,
            3,
        );
        add_action(
            "woocommerce_removed_coupon",
            [__CLASS__, "handle_removed_coupon"],
            10,
            1,
        );
        add_filter(
            "woocommerce_get_shop_coupon_data",
            [__CLASS__, "provide_saas_coupon_data"],
            10,
            2,
        );
        add_filter(
            "woocommerce_coupon_is_valid",
            [__CLASS__, "validate_referral_coupon"],
            10,
            3,
        );
        add_filter(
            "woocommerce_coupon_error",
            [__CLASS__, "filter_referral_coupon_error"],
            10,
            3,
        );
        add_action(
            "woocommerce_after_checkout_validation",
            [__CLASS__, "validate_referral_checkout_submission"],
            10,
            2,
        );
        add_action(
            "woocommerce_checkout_validate_order_before_payment",
            [__CLASS__, "validate_referral_order_before_payment"],
            10,
            2,
        );
    }

    public static function activate()
    {
        self::ensure_sync_secret();
        self::maybe_schedule_cron();
    }

    public static function deactivate()
    {
        wp_clear_scheduled_hook(self::CRON_HOOK);
    }
}

register_activation_hook(__FILE__, ["Lylrv_Connect_Plugin", "activate"]);
register_deactivation_hook(__FILE__, ["Lylrv_Connect_Plugin", "deactivate"]);
Lylrv_Connect_Plugin::init();
