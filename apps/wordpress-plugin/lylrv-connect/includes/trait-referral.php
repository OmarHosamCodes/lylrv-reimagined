<?php
/**
 * Referral engine functionality.
 *
 * Handles referral code capture, checkout capture, coupon validation,
 * coupon creation/revocation, self-referral detection, reward logic,
 * and referral state management.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Referral
{
    public static function maybe_capture_referral_code()
    {
        if (
            is_admin() ||
            (function_exists("wp_doing_ajax") && wp_doing_ajax())
        ) {
            return;
        }

        $param_name = self::get_referral_param_name();
        if (empty($_GET[$param_name])) {
            return;
        }

        $code = self::sanitize_referral_code(wp_unslash($_GET[$param_name]));
        if (empty($code)) {
            return;
        }

        if (!self::find_user_id_by_referral_code($code)) {
            return;
        }

        self::set_active_referral_code($code);
    }

    public static function capture_referral_on_checkout($order)
    {
        if (
            !self::is_woocommerce_available() ||
            !is_object($order) ||
            !method_exists($order, "update_meta_data")
        ) {
            return;
        }

        $code = self::get_active_referral_code();
        if (empty($code)) {
            return;
        }

        $referrer_user_id = self::find_user_id_by_referral_code($code);
        if ($referrer_user_id < 1) {
            return;
        }

        $order->update_meta_data(self::ORDER_META_REFERRAL_CODE, $code);
        $order->update_meta_data(
            self::ORDER_META_REFERRER_USER_ID,
            $referrer_user_id,
        );

        if (!$order->get_meta(self::ORDER_META_REFERRAL_STATUS)) {
            $order->update_meta_data(
                self::ORDER_META_REFERRAL_STATUS,
                "captured",
            );
            $order->update_meta_data(
                self::ORDER_META_REFERRAL_REASON,
                "awaiting_completion",
            );
        }
    }

    public static function clear_referral_tracking_after_checkout($order_id)
    {
        if (!$order_id) {
            return;
        }

        self::clear_active_referral_code();
    }

    public static function validate_referral_coupon(
        $is_valid,
        $coupon,
        $discounts,
    ) {
        if (!$is_valid || !($coupon instanceof WC_Coupon)) {
            return $is_valid;
        }

        $reason = self::get_referral_coupon_validation_reason(
            $coupon->get_code(),
            self::get_current_referral_buyer_identity(),
        );
        if (empty($reason)) {
            return $is_valid;
        }

        self::remember_referral_coupon_error($coupon->get_code(), $reason);
        return false;
    }

    public static function filter_referral_coupon_error(
        $message,
        $error_code,
        $coupon,
    ) {
        if (!$coupon instanceof WC_Coupon) {
            return $message;
        }

        $code = self::sanitize_referral_code($coupon->get_code());
        if (
            empty($code) ||
            empty(self::$referral_coupon_error_messages[$code])
        ) {
            return $message;
        }

        $message = self::$referral_coupon_error_messages[$code];
        unset(self::$referral_coupon_error_messages[$code]);

        return $message;
    }

    public static function validate_referral_checkout_submission($data, $errors)
    {
        if (
            !$errors instanceof WP_Error ||
            !self::is_woocommerce_available() ||
            !function_exists("WC") ||
            !WC()->cart
        ) {
            return;
        }

        $identity = self::build_referral_buyer_identity(
            is_user_logged_in() ? get_current_user_id() : 0,
            !empty($data["billing_email"]) ? $data["billing_email"] : "",
            !empty($data["billing_phone"]) ? $data["billing_phone"] : "",
        );

        foreach ((array) WC()->cart->get_applied_coupons() as $coupon_code) {
            $reason = self::get_referral_coupon_validation_reason(
                $coupon_code,
                $identity,
            );
            if (empty($reason)) {
                continue;
            }

            self::remove_invalid_referral_coupon($coupon_code);
            $errors->add(
                "lylrv_referral_coupon_invalid",
                sprintf(
                    /* translators: 1: coupon code, 2: validation message */
                    __(
                        '"%1$s" was removed from your cart. %2$s',
                        "lylrv-connect",
                    ),
                    esc_html((string) $coupon_code),
                    self::get_referral_coupon_error_message($reason),
                ),
            );
        }
    }

    public static function validate_referral_order_before_payment(
        $order,
        $errors,
    ) {
        if (
            !$order instanceof WC_Order ||
            !$errors instanceof WP_Error ||
            !self::is_woocommerce_available()
        ) {
            return;
        }

        $identity = self::build_referral_buyer_identity(
            (int) $order->get_customer_id(),
            $order->get_billing_email(),
            $order->get_billing_phone(),
            (int) $order->get_id(),
        );

        foreach ((array) $order->get_coupon_codes() as $coupon_code) {
            $reason = self::get_referral_coupon_validation_reason(
                $coupon_code,
                $identity,
            );
            if (empty($reason)) {
                continue;
            }

            self::remove_invalid_referral_coupon($coupon_code, $order);
            $errors->add(
                "lylrv_referral_coupon_invalid",
                sprintf(
                    /* translators: 1: coupon code, 2: validation message */
                    __(
                        '"%1$s" was removed from your order. %2$s',
                        "lylrv-connect",
                    ),
                    esc_html((string) $coupon_code),
                    self::get_referral_coupon_error_message($reason),
                ),
            );
        }
    }

    private static function maybe_process_referral_for_order($order)
    {
        if (!self::is_woocommerce_available()) {
            return;
        }

        $referral_code = self::sanitize_referral_code(
            $order->get_meta(self::ORDER_META_REFERRAL_CODE),
        );
        if (empty($referral_code)) {
            return;
        }

        $referrer_user_id = (int) $order->get_meta(
            self::ORDER_META_REFERRER_USER_ID,
        );
        if ($referrer_user_id < 1) {
            $referrer_user_id = self::find_user_id_by_referral_code(
                $referral_code,
            );
            if ($referrer_user_id > 0) {
                $order->update_meta_data(
                    self::ORDER_META_REFERRER_USER_ID,
                    $referrer_user_id,
                );
            }
        }

        $status = (string) $order->get_status();
        $current_referral_status = (string) $order->get_meta(
            self::ORDER_META_REFERRAL_STATUS,
        );

        if ("completed" === $status) {
            self::maybe_issue_referral_reward(
                $order,
                $referrer_user_id,
                $referral_code,
            );
        } elseif (in_array($status, ["cancelled", "refunded"], true)) {
            self::maybe_revoke_referral_reward($order);
        } elseif (empty($current_referral_status)) {
            self::set_order_referral_state(
                $order,
                "captured",
                "awaiting_completion",
            );
            $order->save();
        }
    }

    private static function maybe_issue_referral_reward(
        $order,
        $referrer_user_id,
        $referral_code,
    ) {
        $current_status = (string) $order->get_meta(
            self::ORDER_META_REFERRAL_STATUS,
        );
        if ("reward_issued" === $current_status) {
            return;
        }

        if ($referrer_user_id < 1) {
            self::set_order_referral_state(
                $order,
                "blocked",
                "invalid_referral_code",
            );
            $order->save();
            return;
        }

        if (!self::is_first_referred_order($order)) {
            self::set_order_referral_state(
                $order,
                "blocked",
                "not_first_referred_order",
            );
            $order->save();
            return;
        }

        $self_referral_reason = self::detect_self_referral_reason(
            $order,
            $referrer_user_id,
        );
        if (!empty($self_referral_reason)) {
            self::set_order_referral_state(
                $order,
                "blocked",
                $self_referral_reason,
            );
            $order->save();
            return;
        }

        $coupon_result = self::create_referral_coupon(
            $order,
            $referrer_user_id,
            $referral_code,
        );
        if (is_wp_error($coupon_result)) {
            self::set_order_referral_state(
                $order,
                "blocked",
                $coupon_result->get_error_code(),
            );
            $order->save();
            return;
        }

        $order->update_meta_data(
            self::ORDER_META_REWARD_COUPON_ID,
            (string) $coupon_result["couponId"],
        );
        $order->update_meta_data(
            self::ORDER_META_REWARD_COUPON_CODE,
            $coupon_result["couponCode"],
        );
        $order->update_meta_data(
            self::ORDER_META_REWARD_COUPON_TYPE,
            self::get_referral_coupon_type(),
        );
        $order->update_meta_data(
            self::ORDER_META_REWARD_COUPON_AMOUNT,
            self::get_referral_coupon_amount(),
        );
        $order->update_meta_data(
            self::ORDER_META_REWARD_ISSUED_AT,
            current_time("c", true),
        );
        $order->delete_meta_data(self::ORDER_META_REWARD_REVOKED_AT);
        self::set_order_referral_state(
            $order,
            "reward_issued",
            "reward_coupon_created",
        );
        $order->save();
    }

    private static function maybe_revoke_referral_reward($order)
    {
        $current_status = (string) $order->get_meta(
            self::ORDER_META_REFERRAL_STATUS,
        );
        if ("reward_issued" !== $current_status) {
            return;
        }

        $coupon_id = absint(
            $order->get_meta(self::ORDER_META_REWARD_COUPON_ID),
        );
        $coupon_code = (string) $order->get_meta(
            self::ORDER_META_REWARD_COUPON_CODE,
        );
        if ($coupon_id < 1 && empty($coupon_code)) {
            return;
        }

        if (self::is_coupon_used($coupon_id, $coupon_code)) {
            $order->update_meta_data(
                self::ORDER_META_REFERRAL_REASON,
                "reward_coupon_already_used",
            );
            $order->save();
            return;
        }

        $revocation = self::revoke_coupon($coupon_id, $coupon_code);
        if (is_wp_error($revocation)) {
            $order->update_meta_data(
                self::ORDER_META_REFERRAL_REASON,
                $revocation->get_error_code(),
            );
            $order->save();
            return;
        }

        $order->update_meta_data(
            self::ORDER_META_REWARD_REVOKED_AT,
            current_time("c", true),
        );
        self::set_order_referral_state(
            $order,
            "reward_revoked",
            "order_cancelled_or_refunded",
        );
        $order->save();
    }

    private static function create_referral_coupon(
        $order,
        $referrer_user_id,
        $referral_code,
    ) {
        if (!class_exists("WC_Coupon")) {
            return new WP_Error(
                "woocommerce_coupon_unavailable",
                __(
                    "WooCommerce coupons are unavailable on this site.",
                    "lylrv-connect",
                ),
            );
        }

        $amount = self::get_referral_coupon_amount();
        if ($amount < 1) {
            return new WP_Error(
                "invalid_coupon_amount",
                __(
                    "Referral coupon amount must be greater than zero.",
                    "lylrv-connect",
                ),
            );
        }

        $coupon_code = self::generate_unique_coupon_code(
            $referral_code,
            (int) $order->get_id(),
        );
        $coupon = new WC_Coupon();
        $coupon->set_code($coupon_code);
        $coupon->set_discount_type(self::get_referral_coupon_type());
        $coupon->set_amount((string) $amount);
        $coupon->set_individual_use(true);
        $coupon->set_usage_limit(self::get_referral_coupon_usage_limit());
        $coupon->set_description(
            sprintf(
                "Lylrv referral reward for order #%d",
                (int) $order->get_id(),
            ),
        );

        $referrer_emails = array_filter([
            self::normalize_email(
                get_userdata($referrer_user_id)
                    ? get_userdata($referrer_user_id)->user_email
                    : "",
            ),
            self::normalize_email(
                get_user_meta($referrer_user_id, "billing_email", true),
            ),
        ]);

        if (!empty($referrer_emails)) {
            $coupon->set_email_restrictions(
                array_values(array_unique($referrer_emails)),
            );
        }

        $expiry_days = self::get_referral_coupon_expiry_days();
        if ($expiry_days > 0 && class_exists("WC_DateTime")) {
            $expiry = new WC_DateTime();
            $expiry->setTimestamp(time() + $expiry_days * DAY_IN_SECONDS);
            $coupon->set_date_expires($expiry);
        }

        $coupon->update_meta_data("_lylrv_referral_reward", "1");
        $coupon->update_meta_data(
            "_lylrv_source_order_id",
            (string) $order->get_id(),
        );
        $coupon->update_meta_data(
            "_lylrv_referrer_user_id",
            (string) $referrer_user_id,
        );
        $coupon->save();

        if (!$coupon->get_id()) {
            return new WP_Error(
                "coupon_creation_failed",
                __(
                    "Unable to create the referral reward coupon.",
                    "lylrv-connect",
                ),
            );
        }

        return [
            "couponId" => $coupon->get_id(),
            "couponCode" => $coupon_code,
        ];
    }

    private static function revoke_coupon($coupon_id, $coupon_code)
    {
        $coupon =
            $coupon_id > 0
                ? new WC_Coupon($coupon_id)
                : new WC_Coupon($coupon_code);
        if (!$coupon || !$coupon->get_id()) {
            return new WP_Error(
                "coupon_not_found",
                __(
                    "The referral reward coupon could not be found.",
                    "lylrv-connect",
                ),
            );
        }

        if (class_exists("WC_DateTime")) {
            $expired = new WC_DateTime();
            $expired->setTimestamp(time() - DAY_IN_SECONDS);
            $coupon->set_date_expires($expired);
        }

        $coupon->set_usage_limit(0);
        $coupon->set_amount("0");
        $coupon->save();
        wp_update_post([
            "ID" => $coupon->get_id(),
            "post_status" => "draft",
        ]);

        return true;
    }

    private static function is_coupon_used($coupon_id, $coupon_code)
    {
        $coupon =
            $coupon_id > 0
                ? new WC_Coupon($coupon_id)
                : new WC_Coupon($coupon_code);
        if (!$coupon || !$coupon->get_id()) {
            return false;
        }

        return (int) $coupon->get_usage_count() > 0;
    }

    private static function is_first_referred_order($order)
    {
        $args = [
            "limit" => 50,
            "orderby" => "date",
            "order" => "ASC",
            "return" => "ids",
            "meta_query" => [
                [
                    "key" => self::ORDER_META_REFERRAL_CODE,
                    "compare" => "EXISTS",
                ],
            ],
        ];

        $customer_id = (int) $order->get_customer_id();
        $email = self::normalize_email($order->get_billing_email());

        if ($customer_id > 0) {
            $args["customer_id"] = $customer_id;
        } elseif (!empty($email)) {
            $args["billing_email"] = $email;
        }

        $matching_orders = wc_get_orders($args);
        if (empty($matching_orders)) {
            return true;
        }

        $first_order_id = (int) reset($matching_orders);
        return $first_order_id === (int) $order->get_id();
    }

    private static function detect_self_referral_reason(
        $order,
        $referrer_user_id,
    ) {
        $buyer_user_id = (int) $order->get_customer_id();
        if ($buyer_user_id > 0 && $buyer_user_id === $referrer_user_id) {
            return "self_referral_user_id";
        }

        $referrer = get_userdata($referrer_user_id);
        if (!$referrer instanceof WP_User) {
            return "invalid_referrer_user";
        }

        $buyer_email = self::normalize_email($order->get_billing_email());
        $referrer_email = self::normalize_email($referrer->user_email);
        $referrer_billing_email = self::normalize_email(
            get_user_meta($referrer_user_id, "billing_email", true),
        );
        if (
            !empty($buyer_email) &&
            ($buyer_email === $referrer_email ||
                $buyer_email === $referrer_billing_email)
        ) {
            return "self_referral_email";
        }

        $buyer_phone = self::normalize_phone($order->get_billing_phone());
        $referrer_phone = self::normalize_phone(
            get_user_meta($referrer_user_id, "billing_phone", true),
        );
        if (
            !empty($buyer_phone) &&
            !empty($referrer_phone) &&
            $buyer_phone === $referrer_phone
        ) {
            return "self_referral_phone";
        }

        return "";
    }

    private static function detect_self_referral_reason_from_identity(
        $identity,
        $referrer_user_id,
    ) {
        $buyer_user_id = !empty($identity["customerId"])
            ? (int) $identity["customerId"]
            : 0;
        if ($buyer_user_id > 0 && $buyer_user_id === (int) $referrer_user_id) {
            return "self_referral_user_id";
        }

        $referrer = get_userdata($referrer_user_id);
        if (!$referrer instanceof WP_User) {
            return "invalid_referrer_user";
        }

        $buyer_email = !empty($identity["email"])
            ? self::normalize_email($identity["email"])
            : null;
        $referrer_email = self::normalize_email($referrer->user_email);
        $referrer_billing_email = self::normalize_email(
            get_user_meta($referrer_user_id, "billing_email", true),
        );
        if (
            !empty($buyer_email) &&
            ($buyer_email === $referrer_email ||
                $buyer_email === $referrer_billing_email)
        ) {
            return "self_referral_email";
        }

        $buyer_phone = !empty($identity["phone"])
            ? self::normalize_phone($identity["phone"])
            : null;
        $referrer_phone = self::normalize_phone(
            get_user_meta($referrer_user_id, "billing_phone", true),
        );
        if (
            !empty($buyer_phone) &&
            !empty($referrer_phone) &&
            $buyer_phone === $referrer_phone
        ) {
            return "self_referral_phone";
        }

        return "";
    }

    private static function get_or_create_referral_code_for_user($user_id)
    {
        $user_id = absint($user_id);
        if ($user_id < 1) {
            return null;
        }

        $existing = self::sanitize_referral_code(
            get_user_meta($user_id, self::USER_META_REFERRAL_CODE, true),
        );
        if (!empty($existing)) {
            return $existing;
        }

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $code = strtoupper(wp_generate_password(8, false, false));
            if (!self::find_user_id_by_referral_code($code)) {
                update_user_meta(
                    $user_id,
                    self::USER_META_REFERRAL_CODE,
                    $code,
                );
                return $code;
            }
        }

        $fallback =
            "LY" . strtoupper(substr(md5((string) $user_id . wp_rand()), 0, 6));
        update_user_meta($user_id, self::USER_META_REFERRAL_CODE, $fallback);
        return $fallback;
    }

    private static function find_user_id_by_referral_code($code)
    {
        $code = self::sanitize_referral_code($code);
        if (empty($code)) {
            return 0;
        }

        $users = get_users([
            "number" => 1,
            "fields" => "ids",
            "meta_key" => self::USER_META_REFERRAL_CODE,
            "meta_value" => $code,
        ]);

        if (empty($users)) {
            return 0;
        }

        return (int) $users[0];
    }

    private static function set_active_referral_code($code)
    {
        $code = self::sanitize_referral_code($code);
        if (empty($code)) {
            return;
        }

        if (
            self::is_woocommerce_available() &&
            function_exists("WC") &&
            WC()->session
        ) {
            WC()->session->set(self::COOKIE_REFERRAL_CODE, $code);
        }

        self::set_referral_cookie($code);
    }

    private static function get_active_referral_code()
    {
        $code = null;

        if (
            self::is_woocommerce_available() &&
            function_exists("WC") &&
            WC()->session
        ) {
            $code = WC()->session->get(self::COOKIE_REFERRAL_CODE);
        }

        if (empty($code) && isset($_COOKIE[self::COOKIE_REFERRAL_CODE])) {
            $code = wp_unslash($_COOKIE[self::COOKIE_REFERRAL_CODE]);
        }

        return self::sanitize_referral_code($code);
    }

    private static function clear_active_referral_code()
    {
        if (
            self::is_woocommerce_available() &&
            function_exists("WC") &&
            WC()->session
        ) {
            WC()->session->__unset(self::COOKIE_REFERRAL_CODE);
        }

        self::set_referral_cookie("", time() - DAY_IN_SECONDS);
    }

    private static function set_referral_cookie($value, $expires = null)
    {
        $expires =
            null === $expires ? time() + MONTH_IN_SECONDS : (int) $expires;
        if (function_exists("wc_setcookie")) {
            wc_setcookie(self::COOKIE_REFERRAL_CODE, $value, $expires);
            return;
        }

        setcookie(
            self::COOKIE_REFERRAL_CODE,
            $value,
            $expires,
            COOKIEPATH ? COOKIEPATH : "/",
            COOKIE_DOMAIN,
            is_ssl(),
            true,
        );
    }

    private static function set_order_referral_state($order, $status, $reason)
    {
        $order->update_meta_data(self::ORDER_META_REFERRAL_STATUS, $status);
        $order->update_meta_data(self::ORDER_META_REFERRAL_REASON, $reason);
    }

    private static function remember_referral_coupon_error($code, $reason)
    {
        $code = self::sanitize_referral_code($code);
        if (empty($code) || empty($reason)) {
            return;
        }

        self::$referral_coupon_error_messages[
            $code
        ] = self::get_referral_coupon_error_message($reason);
    }

    private static function get_referral_coupon_validation_reason(
        $coupon_code,
        $identity,
    ) {
        $coupon_code = self::sanitize_referral_code($coupon_code);
        if (empty($coupon_code)) {
            return "";
        }

        $referrer_user_id = self::find_user_id_by_referral_code($coupon_code);
        if ($referrer_user_id < 1) {
            return "";
        }

        $self_referral_reason = self::detect_self_referral_reason_from_identity(
            $identity,
            $referrer_user_id,
        );
        if (!empty($self_referral_reason)) {
            return $self_referral_reason;
        }

        if (self::customer_has_previous_referred_order($identity)) {
            return "repeat_referral_customer";
        }

        return "";
    }

    private static function get_referral_coupon_error_message($reason)
    {
        switch ((string) $reason) {
            case "repeat_referral_customer":
                return __(
                    "Referral codes can only be used on your first referred order.",
                    "lylrv-connect",
                );
            case "self_referral_user_id":
            case "self_referral_email":
            case "self_referral_phone":
                return __(
                    "You cannot use your own referral code.",
                    "lylrv-connect",
                );
            default:
                return __(
                    "This referral code is not valid for your order.",
                    "lylrv-connect",
                );
        }
    }

    private static function get_current_referral_buyer_identity()
    {
        $customer_id = is_user_logged_in() ? get_current_user_id() : 0;
        $email = "";
        $phone = "";

        if (function_exists("WC") && WC()->customer) {
            $email = WC()->customer->get_billing_email();
            $phone = WC()->customer->get_billing_phone();
        }

        return self::build_referral_buyer_identity(
            $customer_id,
            $email,
            $phone,
        );
    }

    private static function build_referral_buyer_identity(
        $customer_id,
        $email,
        $phone,
        $exclude_order_id = 0,
    ) {
        return [
            "customerId" => absint($customer_id),
            "email" => self::normalize_email($email),
            "phone" => self::normalize_phone($phone),
            "excludeOrderId" => absint($exclude_order_id),
        ];
    }

    private static function customer_has_previous_referred_order($identity)
    {
        $exclude_order_id = !empty($identity["excludeOrderId"])
            ? absint($identity["excludeOrderId"])
            : 0;
        $statuses = ["pending", "on-hold", "processing", "completed"];

        $customer_id = !empty($identity["customerId"])
            ? absint($identity["customerId"])
            : 0;
        if (
            $customer_id > 0 &&
            self::find_referred_order_by_query(
                [
                    "customer_id" => $customer_id,
                    "status" => $statuses,
                ],
                $exclude_order_id,
            ) > 0
        ) {
            return true;
        }

        $email = !empty($identity["email"])
            ? self::normalize_email($identity["email"])
            : null;
        if (
            !empty($email) &&
            self::find_referred_order_by_query(
                [
                    "billing_email" => $email,
                    "status" => $statuses,
                ],
                $exclude_order_id,
            ) > 0
        ) {
            return true;
        }

        $phone = !empty($identity["phone"])
            ? self::normalize_phone($identity["phone"])
            : null;
        if (!empty($phone)) {
            foreach (
                self::get_recent_referred_orders_for_validation(
                    $exclude_order_id,
                )
                as $order
            ) {
                if (
                    self::normalize_phone($order->get_billing_phone()) ===
                    $phone
                ) {
                    return true;
                }
            }
        }

        return false;
    }

    private static function find_referred_order_by_query(
        $args,
        $exclude_order_id,
    ) {
        $query_args = array_merge(
            [
                "limit" => 1,
                "orderby" => "date",
                "order" => "DESC",
                "return" => "ids",
                "meta_query" => [
                    [
                        "key" => self::ORDER_META_REFERRAL_CODE,
                        "compare" => "EXISTS",
                    ],
                ],
            ],
            $args,
        );

        if ($exclude_order_id > 0) {
            $query_args["exclude"] = [$exclude_order_id];
        }

        $matching_orders = wc_get_orders($query_args);
        if (empty($matching_orders)) {
            return 0;
        }

        return (int) reset($matching_orders);
    }

    private static function get_recent_referred_orders_for_validation(
        $exclude_order_id,
    ) {
        $orders = wc_get_orders([
            "limit" => 100,
            "orderby" => "date",
            "order" => "DESC",
            "return" => "objects",
            "status" => ["pending", "on-hold", "processing", "completed"],
            "meta_query" => [
                [
                    "key" => self::ORDER_META_REFERRAL_CODE,
                    "compare" => "EXISTS",
                ],
            ],
        ]);

        if ($exclude_order_id < 1) {
            return $orders;
        }

        return array_values(
            array_filter($orders, function ($order) use ($exclude_order_id) {
                return (int) $order->get_id() !== $exclude_order_id;
            }),
        );
    }

    private static function remove_invalid_referral_coupon(
        $coupon_code,
        $order = null,
    ) {
        $coupon_code = wc_format_coupon_code((string) $coupon_code);
        if (empty($coupon_code)) {
            return;
        }

        if ($order instanceof WC_Order) {
            $order->remove_coupon($coupon_code);
            $order->calculate_totals(false);
        }

        if (function_exists("WC") && WC()->cart) {
            WC()->cart->remove_coupon($coupon_code);
            WC()->cart->calculate_totals();
        }

        if (
            self::sanitize_referral_code($coupon_code) ===
            self::get_active_referral_code()
        ) {
            self::clear_active_referral_code();
        }
    }

    private static function generate_unique_coupon_code(
        $referral_code,
        $order_id,
    ) {
        $prefix = substr(self::sanitize_referral_code($referral_code), 0, 4);
        if (empty($prefix)) {
            $prefix = "LYRV";
        }

        do {
            $code = sprintf(
                "%s-%d-%s",
                $prefix,
                $order_id,
                strtoupper(wp_generate_password(4, false, false)),
            );
        } while (self::coupon_code_exists($code));

        return $code;
    }

    private static function coupon_code_exists($code)
    {
        $coupon = new WC_Coupon($code);
        return $coupon && $coupon->get_id();
    }

    private static function get_recent_referral_orders()
    {
        if (!self::is_woocommerce_available()) {
            return [];
        }

        return wc_get_orders([
            "limit" => 10,
            "orderby" => "date",
            "order" => "DESC",
            "meta_query" => [
                [
                    "key" => self::ORDER_META_REFERRAL_CODE,
                    "compare" => "EXISTS",
                ],
            ],
        ]);
    }
}
