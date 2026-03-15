<?php
/**
 * Plugin Name: Lylrv Connect
 * Plugin URI: https://lylrv.com
 * Description: Connects your WordPress site to Lylrv to display loyalty widgets and power the native SaaS storefront.
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
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-widgets.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-products.php";
require_once LYLRV_CONNECT_PLUGIN_DIR . "includes/trait-storefront.php";

final class Lylrv_Connect_Plugin
{
    use Lylrv_Connect_Helpers;
    use Lylrv_Connect_Admin;
    use Lylrv_Connect_Widgets;
    use Lylrv_Connect_Products;
    use Lylrv_Connect_Storefront;

    const OPTION_GROUP = "lylrv_connect_options";
    const OPTION_API_KEY = "lylrv_api_key";
    const OPTION_SAAS_URL = "lylrv_saas_url";
    const OPTION_STOREFRONT_BASE = "lylrv_storefront_base";
    const OPTION_STOREFRONT_PRODUCT_PAGE_ID = "lylrv_storefront_product_page_id";
    const OPTION_STOREFRONT_CART_PAGE_ID = "lylrv_storefront_cart_page_id";
    const OPTION_STOREFRONT_CHECKOUT_PAGE_ID = "lylrv_storefront_checkout_page_id";
    const OPTION_STOREFRONT_THANK_YOU_PAGE_ID = "lylrv_storefront_thank_you_page_id";
    const COOKIE_STOREFRONT_CART = "lylrv_storefront_cart";

    public static function init()
    {
        self::init_products();
        self::init_storefront();
        add_action("admin_init", [__CLASS__, "register_settings"]);
        add_action("admin_menu", [__CLASS__, "register_menu"]);
        add_action("wp_enqueue_scripts", [__CLASS__, "enqueue_widget_script"]);
        add_filter("script_loader_tag", [__CLASS__, "add_module_type"], 10, 3);
        add_action("wp_footer", [__CLASS__, "inject_widget_containers"]);
        add_shortcode("lylrv_widget", [__CLASS__, "widget_shortcode"]);
    }

    public static function activate()
    {
        self::register_product_post_type();
        self::register_storefront_rewrites();
        flush_rewrite_rules();
    }

    public static function deactivate()
    {
        flush_rewrite_rules();
    }
}

register_activation_hook(__FILE__, ["Lylrv_Connect_Plugin", "activate"]);
register_deactivation_hook(__FILE__, ["Lylrv_Connect_Plugin", "deactivate"]);
Lylrv_Connect_Plugin::init();
