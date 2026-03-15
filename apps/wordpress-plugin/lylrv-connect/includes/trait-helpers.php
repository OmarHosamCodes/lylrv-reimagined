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

    private static function name_from_email($email)
    {
        $parts = explode("@", (string) $email);
        return !empty($parts[0]) ? $parts[0] : (string) $email;
    }

    private static function is_connection_ready()
    {
        return !empty(get_option(self::OPTION_API_KEY, "")) &&
            !empty(self::get_saas_url());
    }

    private static function get_saas_url()
    {
        return untrailingslashit(
            (string) get_option(self::OPTION_SAAS_URL, "https://app.lylrv.com"),
        );
    }

    private static function get_storefront_base()
    {
        $base = sanitize_title(
            (string) get_option(self::OPTION_STOREFRONT_BASE, "store"),
        );

        return empty($base) ? "store" : $base;
    }

    private static function get_storefront_path($suffix = "")
    {
        $base = self::get_storefront_base();
        $suffix = ltrim((string) $suffix, "/");
        $path = $base . "/";

        if ("" !== $suffix) {
            $path .= $suffix;
        }

        return home_url("/" . trim($path, "/") . "/");
    }

    private static function get_storefront_product_url($slug)
    {
        return self::get_storefront_path(sanitize_title($slug));
    }

    private static function get_storefront_page_id($route)
    {
        $option_map = [
            "product" => self::OPTION_STOREFRONT_PRODUCT_PAGE_ID,
            "cart" => self::OPTION_STOREFRONT_CART_PAGE_ID,
            "checkout" => self::OPTION_STOREFRONT_CHECKOUT_PAGE_ID,
            "thank-you" => self::OPTION_STOREFRONT_THANK_YOU_PAGE_ID,
        ];

        if (!isset($option_map[$route])) {
            return 0;
        }

        return absint(get_option($option_map[$route], 0));
    }

    public static function render_theme_header()
    {
        if (function_exists("wp_is_block_theme") && wp_is_block_theme()) {
            echo "<!DOCTYPE html>\n";
            echo "<html ";
            language_attributes();
            echo ">\n";
            echo "<head>\n";
            echo '<meta charset="' .
                esc_attr(get_bloginfo("charset")) .
                "\" />\n";
            wp_head();
            echo "</head>\n";
            echo "<body ";
            body_class();
            echo ">\n";
            wp_body_open();

            if (function_exists("block_header_area")) {
                block_header_area();
            }

            return;
        }

        get_header();
    }

    public static function render_theme_footer()
    {
        if (function_exists("wp_is_block_theme") && wp_is_block_theme()) {
            if (function_exists("block_footer_area")) {
                block_footer_area();
            }
            wp_footer();
            echo "</body>\n";
            echo "</html>\n";
            return;
        }

        get_footer();
    }
}
