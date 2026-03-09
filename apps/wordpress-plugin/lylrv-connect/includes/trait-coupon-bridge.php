<?php
/**
 * Coupon Bridge trait for Lylrv Connect.
 *
 * Handles SaaS coupon data bridging, virtual coupon construction,
 * and remote coupon lookups against the Lylrv application.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Coupon_Bridge
{
    public static function provide_saas_coupon_data($data, $coupon)
    {
        if (!empty($data) || !self::is_saas_coupon_bridge_ready()) {
            return $data;
        }

        $code = "";

        if (is_object($coupon) && method_exists($coupon, "get_code")) {
            $code = (string) $coupon->get_code();
        } else {
            $code = (string) $coupon;
        }

        $code = sanitize_text_field(wp_unslash($code));
        if (empty($code)) {
            return $data;
        }

        if (self::is_current_user_referral_code($code)) {
            return $data;
        }

        $remote_coupon = self::fetch_saas_coupon_data($code);
        if (!is_wp_error($remote_coupon) && !empty($remote_coupon["exists"])) {
            $source = !empty($remote_coupon["source"])
                ? sanitize_key((string) $remote_coupon["source"])
                : "coupon";
            if ("referral" === $source) {
                self::set_active_referral_code(
                    !empty($remote_coupon["referralCode"])
                        ? (string) $remote_coupon["referralCode"]
                        : $code,
                );
                return self::build_virtual_referral_coupon_data(
                    $code,
                    __("Lylrv referral code", "lylrv-connect"),
                );
            }

            $amount = isset($remote_coupon["amount"])
                ? (string) $remote_coupon["amount"]
                : "0";
            $discount_type = !empty($remote_coupon["discountType"])
                ? (string) $remote_coupon["discountType"]
                : "fixed_cart";
            $usage_limit = !empty($remote_coupon["usageLimit"])
                ? absint($remote_coupon["usageLimit"])
                : 0;
            $date_expires = !empty($remote_coupon["expiresAt"])
                ? strtotime((string) $remote_coupon["expiresAt"])
                : null;

            return self::build_virtual_coupon_data(
                !empty($remote_coupon["code"])
                    ? (string) $remote_coupon["code"]
                    : $code,
                $amount,
                $discount_type,
                $usage_limit ?: null,
                $date_expires ?: null,
                __("Lylrv SaaS coupon bridge", "lylrv-connect"),
                false,
                null,
            );
        }

        if (self::find_user_id_by_referral_code($code) > 0) {
            self::set_active_referral_code($code);
            return self::build_virtual_referral_coupon_data(
                $code,
                __("Lylrv referral code (local fallback)", "lylrv-connect"),
            );
        }

        return $data;
    }

    public static function handle_removed_coupon($code)
    {
        $code = self::sanitize_referral_code($code);
        if (empty($code)) {
            return;
        }

        if ($code === self::get_active_referral_code()) {
            self::clear_active_referral_code();
        }
    }

    private static function is_saas_coupon_bridge_ready()
    {
        return !empty(get_option(self::OPTION_API_KEY, "")) &&
            !empty(self::get_saas_url()) &&
            !empty(self::get_sync_secret());
    }

    private static function build_virtual_coupon_data(
        $code,
        $amount,
        $discount_type,
        $usage_limit,
        $date_expires,
        $description,
        $individual_use,
        $usage_limit_per_user,
    ) {
        return [
            "id" => 0,
            "code" => (string) $code,
            "amount" => (string) $amount,
            "status" => "publish",
            "discount_type" => (string) $discount_type,
            "description" => (string) $description,
            "date_created" => null,
            "date_modified" => null,
            "date_expires" => $date_expires ?: null,
            "usage_count" => 0,
            "individual_use" => (bool) $individual_use,
            "product_ids" => [],
            "excluded_product_ids" => [],
            "usage_limit" => $usage_limit ?: null,
            "usage_limit_per_user" => $usage_limit_per_user ?: null,
            "limit_usage_to_x_items" => null,
            "free_shipping" => false,
            "product_categories" => [],
            "excluded_product_categories" => [],
            "exclude_sale_items" => false,
            "minimum_amount" => "",
            "maximum_amount" => "",
            "email_restrictions" => [],
            "used_by" => [],
            "virtual" => true,
        ];
    }

    private static function build_virtual_referral_coupon_data(
        $code,
        $description,
    ) {
        // WooCommerce Store API assumes usage_limit_per_user coupons have a real data store.
        // Virtual coupons provided via woocommerce_get_shop_coupon_data do not, so keep this at 0.
        return self::build_virtual_coupon_data(
            $code,
            (string) self::get_referral_coupon_amount(),
            self::get_referral_coupon_type(),
            null,
            null,
            $description,
            true,
            0,
        );
    }

    private static function fetch_saas_coupon_data($code)
    {
        $cache_key = "lylrv_coupon_bridge_" . md5((string) $code);
        $cached = get_transient($cache_key);

        if (false !== $cached) {
            return $cached;
        }

        $endpoint = add_query_arg(
            [
                "apiKey" => (string) get_option(self::OPTION_API_KEY, ""),
                "code" => sanitize_text_field((string) $code),
            ],
            self::get_saas_url() . "/api/widget/coupon",
        );

        $response = wp_remote_get($endpoint, [
            "timeout" => 15,
            "headers" => [
                "X-Lylrv-Sync-Secret" => self::get_sync_secret(),
            ],
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);

        if (404 === $status_code) {
            $result = ["exists" => false];
            set_transient($cache_key, $result, MINUTE_IN_SECONDS);
            return $result;
        }

        if ($status_code < 200 || $status_code >= 300 || !is_array($decoded)) {
            return new WP_Error(
                "lylrv_coupon_lookup_failed",
                __(
                    "Could not validate the coupon against Lylrv.",
                    "lylrv-connect",
                ),
            );
        }

        set_transient($cache_key, $decoded, 5 * MINUTE_IN_SECONDS);
        return $decoded;
    }

    private static function is_current_user_referral_code($code)
    {
        if (!is_user_logged_in()) {
            return false;
        }

        $current_code = self::get_or_create_referral_code_for_user(
            get_current_user_id(),
        );
        if (empty($current_code)) {
            return false;
        }

        return self::sanitize_referral_code($current_code) ===
            self::sanitize_referral_code($code);
    }
}
