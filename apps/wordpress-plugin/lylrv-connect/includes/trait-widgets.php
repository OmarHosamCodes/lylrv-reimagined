<?php
/**
 * Lylrv Connect – Widget injection and script loading.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Widgets
{
    public static function enqueue_widget_script()
    {
        $api_key = get_option(self::OPTION_API_KEY, "");
        $saas_url = self::get_saas_url();

        if (empty($api_key) || empty($saas_url)) {
            return;
        }

        $script_url = $saas_url . "/widgets/loader.bundle.js";
        $final_url = add_query_arg("apiKey", $api_key, $script_url);

        wp_enqueue_script("lylrv-widget-loader", $final_url, [], null, true);

        $data = [
            "user" => [
                "isLoggedIn" => is_user_logged_in(),
                "email" => null,
                "name" => null,
                "referralCode" => null,
            ],
            "context" => [
                "product" => null,
            ],
        ];

        if (is_user_logged_in()) {
            $current_user = wp_get_current_user();
            $data["user"]["email"] = $current_user->user_email;
            $data["user"]["name"] = $current_user->display_name;
            $data["user"][
                "referralCode"
            ] = self::get_or_create_referral_code_for_user(
                (int) $current_user->ID,
            );
        }

        if (
            self::is_woocommerce_available() &&
            function_exists("is_product") &&
            is_product()
        ) {
            global $post;

            if ($post instanceof WP_Post) {
                $product_id = (int) $post->ID;
                $has_purchased = false;

                if (is_user_logged_in()) {
                    $has_purchased = wc_customer_bought_product(
                        $data["user"]["email"],
                        get_current_user_id(),
                        $product_id,
                    );
                }

                $data["context"]["product"] = [
                    "id" => $product_id,
                    "hasPurchased" => $has_purchased,
                ];
            }
        }

        wp_localize_script("lylrv-widget-loader", "LYLRV_WP_DATA", $data);
    }

    public static function add_module_type($tag, $handle, $src)
    {
        if ("lylrv-widget-loader" !== $handle) {
            return $tag;
        }

        return str_replace(" src=", ' type="module" src=', $tag);
    }

    public static function inject_widget_containers()
    {
        if (empty(get_option(self::OPTION_API_KEY, ""))) {
            return;
        }

        echo '<div id="lylrv-loyalty-container"></div>';
        echo '<div id="lylrv-reviews-container"></div>';

        if (
            self::is_woocommerce_available() &&
            function_exists("is_product") &&
            is_product()
        ) {
            echo '<div id="lylrv-productReviews-container"></div>';
        }
    }

    public static function widget_shortcode($atts)
    {
        $attributes = shortcode_atts(
            [
                "name" => "product-reviews",
            ],
            $atts,
        );

        $widget_name = sanitize_title($attributes["name"]);
        return '<div id="lylrv-' .
            esc_attr($widget_name) .
            '-container"></div>';
    }
}
