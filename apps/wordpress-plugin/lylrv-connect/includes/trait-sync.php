<?php
/**
 * Lylrv Connect – Sync trait.
 *
 * Handles cron scheduling, user & order sync (individual, batch, recent),
 * payload building, and the HTTP transport to the SaaS API.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Sync
{
    public static function register_cron_schedule($schedules)
    {
        if (!isset($schedules["lylrv_every_fifteen_minutes"])) {
            $schedules["lylrv_every_fifteen_minutes"] = [
                "interval" => 15 * MINUTE_IN_SECONDS,
                "display" => __("Every 15 Minutes", "lylrv-connect"),
            ];
        }

        return $schedules;
    }

    public static function maybe_schedule_cron()
    {
        if (!wp_next_scheduled(self::CRON_HOOK)) {
            wp_schedule_event(
                time() + MINUTE_IN_SECONDS,
                "lylrv_every_fifteen_minutes",
                self::CRON_HOOK,
            );
        }
    }

    public static function run_scheduled_sync()
    {
        if (!self::is_sync_ready()) {
            return;
        }

        self::sync_recent_users();
        self::sync_recent_orders();
    }

    public static function handle_user_event($user_id)
    {
        self::sync_user_by_id((int) $user_id);
    }

    public static function handle_order_event($order_id)
    {
        self::sync_order_by_id((int) $order_id);
    }

    public static function handle_order_status_event($order_id)
    {
        self::sync_order_by_id((int) $order_id);
    }

    private static function sync_user_by_id($user_id)
    {
        if (!self::is_sync_ready()) {
            return false;
        }

        $user = get_userdata($user_id);
        if (!$user instanceof WP_User || !self::is_syncable_user($user)) {
            return false;
        }

        self::get_or_create_referral_code_for_user($user->ID);
        $customer = self::build_customer_payload_from_user($user);
        if (empty($customer)) {
            return false;
        }

        $result = self::send_sync_payload([$customer], []);
        if (is_wp_error($result)) {
            self::record_sync_error($result->get_error_message());
            return false;
        }

        self::mark_sync_success("customers");
        return true;
    }

    private static function sync_order_by_id($order_id)
    {
        if (!self::is_sync_ready() || !self::is_woocommerce_available()) {
            return false;
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return false;
        }

        self::maybe_process_referral_for_order($order);

        $order_payload = self::build_order_payload($order);
        if (empty($order_payload)) {
            return false;
        }

        $customers = [];
        $order_customer = self::build_customer_payload_from_order($order);
        if (!empty($order_customer)) {
            $customers[] = $order_customer;
        }

        $result = self::send_sync_payload($customers, [$order_payload]);
        if (is_wp_error($result)) {
            self::record_sync_error($result->get_error_message());
            return false;
        }

        self::mark_sync_success("orders");
        if (!empty($customers)) {
            self::mark_sync_success("customers");
        }

        return true;
    }

    private static function full_sync_users()
    {
        $batch_size = self::get_batch_size();
        $offset = 0;
        $total_customers = 0;

        do {
            $query = new WP_User_Query([
                "number" => $batch_size,
                "offset" => $offset,
                "orderby" => "registered",
                "order" => "ASC",
                "fields" => "all",
            ]);

            $users = $query->get_results();
            $customers = [];

            foreach ($users as $user) {
                if (
                    !$user instanceof WP_User ||
                    !self::is_syncable_user($user)
                ) {
                    continue;
                }

                self::get_or_create_referral_code_for_user($user->ID);
                $payload = self::build_customer_payload_from_user($user);
                if (!empty($payload)) {
                    $customers[] = $payload;
                }
            }

            if (!empty($customers)) {
                $result = self::send_sync_payload($customers, []);
                if (is_wp_error($result)) {
                    self::record_sync_error($result->get_error_message());
                    return $result;
                }

                $total_customers += count($customers);
                self::mark_sync_success("customers");
            }

            $offset += $batch_size;
        } while (!empty($users) && count($users) === $batch_size);

        return [
            "customers" => $total_customers,
            "orders" => 0,
        ];
    }

    private static function full_sync_orders()
    {
        if (!self::is_woocommerce_available()) {
            return new WP_Error(
                "lylrv_missing_woocommerce",
                __("WooCommerce is required to sync orders.", "lylrv-connect"),
            );
        }

        $batch_size = self::get_batch_size();
        $offset = 0;
        $total_orders = 0;
        $total_customers = 0;

        do {
            $order_ids = wc_get_orders([
                "limit" => $batch_size,
                "offset" => $offset,
                "orderby" => "date",
                "order" => "ASC",
                "return" => "ids",
            ]);

            $orders = [];
            $customers = [];
            $seen_emails = [];

            foreach ($order_ids as $order_id) {
                $order = wc_get_order($order_id);
                if (!$order) {
                    continue;
                }

                self::maybe_process_referral_for_order($order);

                $order_payload = self::build_order_payload($order);
                if (!empty($order_payload)) {
                    $orders[] = $order_payload;
                }

                $customer_payload = self::build_customer_payload_from_order(
                    $order,
                );
                if (
                    !empty($customer_payload) &&
                    empty($seen_emails[$customer_payload["email"]])
                ) {
                    $customers[] = $customer_payload;
                    $seen_emails[$customer_payload["email"]] = true;
                }
            }

            if (!empty($orders) || !empty($customers)) {
                $result = self::send_sync_payload($customers, $orders);
                if (is_wp_error($result)) {
                    self::record_sync_error($result->get_error_message());
                    return $result;
                }

                $total_orders += count($orders);
                $total_customers += count($customers);
                if (!empty($orders)) {
                    self::mark_sync_success("orders");
                }
                if (!empty($customers)) {
                    self::mark_sync_success("customers");
                }
            }

            $offset += $batch_size;
        } while (!empty($order_ids) && count($order_ids) === $batch_size);

        return [
            "customers" => $total_customers,
            "orders" => $total_orders,
        ];
    }

    private static function sync_recent_users()
    {
        $batch_size = self::get_batch_size();
        $args = [
            "number" => $batch_size,
            "orderby" => "registered",
            "order" => "ASC",
            "fields" => "all",
        ];
        $cursor = get_option(self::OPTION_LAST_USERS_CURSOR);

        if (!empty($cursor)) {
            $args["date_query"] = [
                [
                    "column" => "user_registered",
                    "after" => $cursor,
                    "inclusive" => false,
                ],
            ];
        }

        $query = new WP_User_Query($args);
        $users = $query->get_results();

        if (empty($users)) {
            return;
        }

        $customers = [];
        $latest_timestamp = null;

        foreach ($users as $user) {
            if (!$user instanceof WP_User || !self::is_syncable_user($user)) {
                continue;
            }

            self::get_or_create_referral_code_for_user($user->ID);
            $payload = self::build_customer_payload_from_user($user);
            if (!empty($payload)) {
                $customers[] = $payload;
            }

            if (!empty($user->user_registered)) {
                $latest_timestamp = mysql2date(
                    "c",
                    $user->user_registered,
                    false,
                );
            }
        }

        if (empty($customers)) {
            return;
        }

        $result = self::send_sync_payload($customers, []);
        if (is_wp_error($result)) {
            self::record_sync_error($result->get_error_message());
            return;
        }

        self::mark_sync_success("customers");
        if (!empty($latest_timestamp)) {
            update_option(
                self::OPTION_LAST_USERS_CURSOR,
                $latest_timestamp,
                false,
            );
        }
    }

    private static function sync_recent_orders()
    {
        if (!self::is_woocommerce_available()) {
            return;
        }

        $args = [
            "limit" => self::get_batch_size(),
            "orderby" => "modified",
            "order" => "ASC",
            "return" => "ids",
        ];
        $cursor = get_option(self::OPTION_LAST_ORDERS_CURSOR);

        if (!empty($cursor)) {
            $args["date_modified"] = ">" . strtotime($cursor);
        }

        $order_ids = wc_get_orders($args);
        if (empty($order_ids)) {
            return;
        }

        $orders = [];
        $customers = [];
        $seen_emails = [];
        $latest_timestamp = null;

        foreach ($order_ids as $order_id) {
            $order = wc_get_order($order_id);
            if (!$order) {
                continue;
            }

            self::maybe_process_referral_for_order($order);

            $order_payload = self::build_order_payload($order);
            if (!empty($order_payload)) {
                $orders[] = $order_payload;
                $latest_timestamp = $order_payload["updatedAt"];
            }

            $customer_payload = self::build_customer_payload_from_order($order);
            if (
                !empty($customer_payload) &&
                empty($seen_emails[$customer_payload["email"]])
            ) {
                $customers[] = $customer_payload;
                $seen_emails[$customer_payload["email"]] = true;
            }
        }

        if (empty($orders) && empty($customers)) {
            return;
        }

        $result = self::send_sync_payload($customers, $orders);
        if (is_wp_error($result)) {
            self::record_sync_error($result->get_error_message());
            return;
        }

        if (!empty($customers)) {
            self::mark_sync_success("customers");
        }
        if (!empty($orders)) {
            self::mark_sync_success("orders");
        }
        if (!empty($latest_timestamp)) {
            update_option(
                self::OPTION_LAST_ORDERS_CURSOR,
                $latest_timestamp,
                false,
            );
        }
    }

    private static function send_sync_payload($customers, $orders)
    {
        if (empty($customers) && empty($orders)) {
            return true;
        }

        $api_key = get_option(self::OPTION_API_KEY, "");
        $endpoint = self::get_saas_url() . "/api/widget/sync";
        $payload = [
            "apiKey" => $api_key,
            "syncSecret" => self::get_sync_secret(),
            "storeUrl" => home_url("/"),
            "customers" => array_values($customers),
            "orders" => array_values($orders),
        ];

        $response = wp_remote_post($endpoint, [
            "timeout" => 45,
            "headers" => [
                "Content-Type" => "application/json",
            ],
            "body" => wp_json_encode($payload),
            "data_format" => "body",
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $status_code = (int) wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);

        if ($status_code < 200 || $status_code >= 300) {
            $message = __("The Lylrv sync request failed.", "lylrv-connect");
            if (is_array($decoded) && !empty($decoded["error"])) {
                $message = (string) $decoded["error"];
            }

            return new WP_Error("lylrv_sync_failed", $message);
        }

        update_option(self::OPTION_LAST_SYNC_ERROR, "", false);
        update_option(self::OPTION_LAST_SYNC_SITE, home_url("/"), false);

        return is_array($decoded) ? $decoded : true;
    }

    private static function build_customer_payload_from_user($user)
    {
        $email = sanitize_email($user->user_email);
        if (empty($email)) {
            $email = sanitize_email(
                get_user_meta($user->ID, "billing_email", true),
            );
        }

        if (empty($email)) {
            return null;
        }

        $first_name = trim(
            (string) get_user_meta($user->ID, "billing_first_name", true),
        );
        if (empty($first_name)) {
            $first_name = trim(
                (string) get_user_meta($user->ID, "first_name", true),
            );
        }

        $last_name = trim(
            (string) get_user_meta($user->ID, "billing_last_name", true),
        );
        if (empty($last_name)) {
            $last_name = trim(
                (string) get_user_meta($user->ID, "last_name", true),
            );
        }

        $name = trim($first_name . " " . $last_name);
        if (empty($name)) {
            $name = trim((string) $user->display_name);
        }
        if (empty($name)) {
            $name = self::name_from_email($email);
        }

        $registered_at = !empty($user->user_registered)
            ? mysql2date("c", $user->user_registered, false)
            : current_time("c", true);

        return [
            "email" => strtolower($email),
            "name" => $name,
            "phone" => self::normalize_string(
                get_user_meta($user->ID, "billing_phone", true),
            ),
            "externalUserId" => (string) $user->ID,
            "referralCode" => self::get_or_create_referral_code_for_user(
                (int) $user->ID,
            ),
            "totalPoints" => 0,
            "createdAt" => $registered_at,
            "updatedAt" => current_time("c", true),
        ];
    }

    private static function build_customer_payload_from_order($order)
    {
        $email = sanitize_email($order->get_billing_email());
        if (empty($email)) {
            return null;
        }

        $name = trim($order->get_formatted_billing_full_name());
        if (empty($name)) {
            $name = trim(
                $order->get_shipping_first_name() .
                    " " .
                    $order->get_shipping_last_name(),
            );
        }
        if (empty($name)) {
            $name = self::name_from_email($email);
        }

        $created = $order->get_date_created();
        $updated = $order->get_date_modified();
        $customer_id = $order->get_customer_id();
        $referral_code = $customer_id
            ? self::get_or_create_referral_code_for_user((int) $customer_id)
            : null;

        return [
            "email" => strtolower($email),
            "name" => $name,
            "phone" => self::normalize_string($order->get_billing_phone()),
            "externalUserId" => $customer_id ? (string) $customer_id : null,
            "referralCode" => $referral_code,
            "totalPoints" => 0,
            "createdAt" => $created
                ? $created->date("c")
                : current_time("c", true),
            "updatedAt" => $updated
                ? $updated->date("c")
                : current_time("c", true),
        ];
    }

    private static function build_order_payload($order)
    {
        $order_id = (int) $order->get_id();
        if ($order_id < 1) {
            return null;
        }

        $created = $order->get_date_created();
        $updated = $order->get_date_modified();
        $slugs = [];

        foreach ($order->get_items("line_item") as $item) {
            if (!is_object($item)) {
                continue;
            }

            $product = $item->get_product();
            $slug = "";

            if ($product && method_exists($product, "get_slug")) {
                $slug = (string) $product->get_slug();
            }

            if (empty($slug)) {
                $slug = sanitize_title($item->get_name());
            }

            if (!empty($slug)) {
                $slugs[] = $slug;
            }
        }

        return [
            "orderId" => $order_id,
            "email" => self::normalize_email($order->get_billing_email()),
            "phone" => self::normalize_string($order->get_billing_phone()),
            "externalUserId" => $order->get_customer_id()
                ? (string) $order->get_customer_id()
                : null,
            "status" => self::normalize_string($order->get_status()),
            "payment" => $order->is_paid() ? "paid" : "unpaid",
            "total" => (string) $order->get_total(),
            "billing" => self::build_address_payload(
                $order->get_billing_first_name(),
                $order->get_billing_last_name(),
                $order->get_billing_company(),
                $order->get_billing_address_1(),
                $order->get_billing_address_2(),
                $order->get_billing_city(),
                $order->get_billing_state(),
                $order->get_billing_postcode(),
                $order->get_billing_country(),
            ),
            "shipping" => self::build_address_payload(
                $order->get_shipping_first_name(),
                $order->get_shipping_last_name(),
                $order->get_shipping_company(),
                $order->get_shipping_address_1(),
                $order->get_shipping_address_2(),
                $order->get_shipping_city(),
                $order->get_shipping_state(),
                $order->get_shipping_postcode(),
                $order->get_shipping_country(),
            ),
            "slugs" => array_values(array_unique($slugs)),
            "referralCode" => self::sanitize_referral_code(
                $order->get_meta(self::ORDER_META_REFERRAL_CODE),
            ),
            "referralStatus" => self::normalize_string(
                $order->get_meta(self::ORDER_META_REFERRAL_STATUS),
            ),
            "referralReason" => self::normalize_string(
                $order->get_meta(self::ORDER_META_REFERRAL_REASON),
            ),
            "rewardCouponId" => self::normalize_string(
                (string) $order->get_meta(self::ORDER_META_REWARD_COUPON_ID),
            ),
            "rewardCouponCode" => self::normalize_string(
                $order->get_meta(self::ORDER_META_REWARD_COUPON_CODE),
            ),
            "rewardCouponType" => self::normalize_string(
                $order->get_meta(self::ORDER_META_REWARD_COUPON_TYPE),
            ),
            "rewardCouponAmount" => absint(
                $order->get_meta(self::ORDER_META_REWARD_COUPON_AMOUNT),
            ),
            "rewardIssuedAt" => self::normalize_string(
                $order->get_meta(self::ORDER_META_REWARD_ISSUED_AT),
            ),
            "rewardRevokedAt" => self::normalize_string(
                $order->get_meta(self::ORDER_META_REWARD_REVOKED_AT),
            ),
            "createdAt" => $created
                ? $created->date("c")
                : current_time("c", true),
            "updatedAt" => $updated
                ? $updated->date("c")
                : current_time("c", true),
        ];
    }

    private static function build_address_payload(
        $first_name,
        $last_name,
        $company,
        $address_1,
        $address_2,
        $city,
        $state,
        $postcode,
        $country,
    ) {
        return [
            "firstName" => self::normalize_string($first_name),
            "lastName" => self::normalize_string($last_name),
            "company" => self::normalize_string($company),
            "address1" => self::normalize_string($address_1),
            "address2" => self::normalize_string($address_2),
            "city" => self::normalize_string($city),
            "state" => self::normalize_string($state),
            "postcode" => self::normalize_string($postcode),
            "country" => self::normalize_string($country),
        ];
    }
}
