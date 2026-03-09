<?php
/**
 * Lylrv Connect – Helper utilities.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Helpers
{
    private static function is_woocommerce_available()
    {
        return class_exists("WooCommerce") &&
            function_exists("wc_get_order") &&
            function_exists("wc_get_orders");
    }

    private static function normalize_string($value)
    {
        $value = trim((string) $value);
        return "" === $value ? null : $value;
    }

    private static function normalize_email($email)
    {
        $email = sanitize_email((string) $email);
        return empty($email) ? null : strtolower($email);
    }

    private static function normalize_phone($phone)
    {
        $phone = preg_replace("/[^0-9+]/", "", (string) $phone);
        return empty($phone) ? null : $phone;
    }

    private static function sanitize_referral_code($code)
    {
        $code = preg_replace("/[^A-Za-z0-9]/", "", strtoupper((string) $code));
        return empty($code) ? null : substr($code, 0, 12);
    }

    private static function name_from_email($email)
    {
        $parts = explode("@", (string) $email);
        return !empty($parts[0]) ? $parts[0] : (string) $email;
    }

    private static function mark_sync_success($resource)
    {
        $timestamp = current_time("c", true);

        if ("orders" === $resource) {
            update_option(self::OPTION_LAST_ORDERS_SYNC, $timestamp, false);
        }

        if ("customers" === $resource) {
            update_option(self::OPTION_LAST_CUSTOMERS_SYNC, $timestamp, false);
        }

        update_option(self::OPTION_LAST_SYNC_ERROR, "", false);
    }

    private static function record_sync_error($message)
    {
        update_option(
            self::OPTION_LAST_SYNC_ERROR,
            sanitize_text_field((string) $message),
            false,
        );
    }

    private static function format_sync_time($value)
    {
        if (empty($value)) {
            return __("Never", "lylrv-connect");
        }

        $timestamp = strtotime((string) $value);
        if (!$timestamp) {
            return (string) $value;
        }

        return sprintf(
            /* translators: 1: absolute time, 2: relative time */
            __('%1$s (%2$s ago)', "lylrv-connect"),
            wp_date(
                get_option("date_format") . " " . get_option("time_format"),
                $timestamp,
            ),
            human_time_diff($timestamp, time()),
        );
    }

    private static function format_error($value)
    {
        if (empty($value)) {
            return __("No recent sync errors.", "lylrv-connect");
        }

        return (string) $value;
    }

    private static function get_notice_key()
    {
        return "lylrv_connect_notice_" . get_current_user_id();
    }

    private static function is_sync_ready()
    {
        return !empty(get_option(self::OPTION_SYNC_ENABLED, 1)) &&
            !empty(get_option(self::OPTION_API_KEY, "")) &&
            !empty(self::get_saas_url());
    }

    private static function get_saas_url()
    {
        return untrailingslashit(
            (string) get_option(self::OPTION_SAAS_URL, "https://app.lylrv.com"),
        );
    }

    private static function get_sync_secret()
    {
        self::ensure_sync_secret();
        return (string) get_option(self::OPTION_SYNC_SECRET, "");
    }

    private static function get_batch_size()
    {
        return (int) get_option(self::OPTION_SYNC_BATCH_SIZE, 25);
    }

    private static function get_referral_param_name()
    {
        return (string) get_option(self::OPTION_REFERRAL_PARAM, "ref");
    }

    private static function get_referral_coupon_type()
    {
        return (string) get_option(
            self::OPTION_REFERRAL_COUPON_TYPE,
            "fixed_cart",
        );
    }

    private static function get_referral_coupon_amount()
    {
        return (int) get_option(self::OPTION_REFERRAL_COUPON_AMOUNT, 10);
    }

    private static function get_referral_coupon_expiry_days()
    {
        return (int) get_option(self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS, 30);
    }

    private static function get_referral_coupon_usage_limit()
    {
        return (int) get_option(self::OPTION_REFERRAL_COUPON_USAGE_LIMIT, 1);
    }

    private static function is_syncable_user($user)
    {
        $roles = is_array($user->roles) ? $user->roles : [];
        $has_customer_role =
            in_array("customer", $roles, true) ||
            in_array("subscriber", $roles, true);
        $has_billing_details =
            !empty(get_user_meta($user->ID, "billing_email", true)) ||
            !empty(get_user_meta($user->ID, "billing_phone", true));

        if (!$has_customer_role && !$has_billing_details) {
            return false;
        }

        return !empty(self::normalize_email($user->user_email)) ||
            !empty(
                self::normalize_email(
                    get_user_meta($user->ID, "billing_email", true),
                )
            );
    }

    private static function format_referral_status($value)
    {
        $value = trim((string) $value);
        if ("" === $value) {
            return __("Captured", "lylrv-connect");
        }

        return ucwords(str_replace("_", " ", $value));
    }
}
