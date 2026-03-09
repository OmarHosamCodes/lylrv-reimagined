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
        $referral_param = self::get_referral_param_name();
        $coupon_type = self::get_referral_coupon_type();
        $coupon_amount = self::get_referral_coupon_amount();
        $coupon_expiry_days = self::get_referral_coupon_expiry_days();
        $coupon_usage_limit = self::get_referral_coupon_usage_limit();
        $woocommerce_ready = self::is_woocommerce_available();
        $settings_ready = self::is_sync_ready();
        $recent_referrals = self::get_recent_referral_orders();
        ?>
		<div class="wrap">
			<h1><?php echo esc_html__("Lylrv Connect Settings", "lylrv-connect"); ?></h1>

			<?php if (!$woocommerce_ready): ?>
				<div class="notice notice-warning inline">
					<p><?php echo esc_html__(
         "WooCommerce is not active. Widget injection still works, but order sync and referral rewards require WooCommerce.",
         "lylrv-connect",
     ); ?></p>
				</div>
			<?php endif; ?>

			<form method="post" action="options.php">
				<?php settings_fields(self::OPTION_GROUP); ?>
				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_API_KEY,
        ); ?>"><?php echo esc_html__("API Key", "lylrv-connect"); ?></label>
							</th>
							<td>
								<input type="text" id="<?php echo esc_attr(
            self::OPTION_API_KEY,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_API_KEY,
); ?>" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
								<p class="description"><?php echo esc_html__(
            "Enter the Lylrv API key for the client you want to sync.",
            "lylrv-connect",
        ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_SAAS_URL,
        ); ?>"><?php echo esc_html__(
    "SaaS Application URL",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<input type="url" id="<?php echo esc_attr(
            self::OPTION_SAAS_URL,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_SAAS_URL,
); ?>" value="<?php echo esc_attr($saas_url); ?>" class="regular-text" />
								<p class="description"><?php echo esc_html__(
            "The URL where the Lylrv application is hosted, for example https://app.lylrv.com.",
            "lylrv-connect",
        ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><?php echo esc_html__(
           "WooCommerce Sync",
           "lylrv-connect",
       ); ?></th>
							<td>
								<label for="<?php echo esc_attr(self::OPTION_SYNC_ENABLED); ?>">
									<input type="checkbox" id="<?php echo esc_attr(
             self::OPTION_SYNC_ENABLED,
         ); ?>" name="<?php echo esc_attr(
    self::OPTION_SYNC_ENABLED,
); ?>" value="1" <?php checked(1, $sync_enabled); ?> />
									<?php echo esc_html__(
             "Sync WooCommerce customers, orders, and referral rewards to Lylrv automatically.",
             "lylrv-connect",
         ); ?>
								</label>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_SYNC_BATCH_SIZE,
        ); ?>"><?php echo esc_html__(
    "Sync Batch Size",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<input type="number" min="1" max="100" id="<?php echo esc_attr(
            self::OPTION_SYNC_BATCH_SIZE,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_SYNC_BATCH_SIZE,
); ?>" value="<?php echo esc_attr(
    (string) $batch_size,
); ?>" class="small-text" />
								<p class="description"><?php echo esc_html__(
            "How many records to send in each sync request. Lower this if your host has strict request limits.",
            "lylrv-connect",
        ); ?></p>
							</td>
						</tr>
					</tbody>
				</table>

				<h2><?php echo esc_html__("Referral Engine", "lylrv-connect"); ?></h2>
				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_REFERRAL_PARAM,
        ); ?>"><?php echo esc_html__(
    "Referral Query Parameter",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<input type="text" id="<?php echo esc_attr(
            self::OPTION_REFERRAL_PARAM,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_REFERRAL_PARAM,
); ?>" value="<?php echo esc_attr($referral_param); ?>" class="regular-text" />
								<p class="description"><?php echo esc_html__(
            "Incoming referral links will be captured from this query string key. Example: ?ref=ABC123",
            "lylrv-connect",
        ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_TYPE,
        ); ?>"><?php echo esc_html__(
    "Reward Coupon Type",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<select id="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_TYPE,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_REFERRAL_COUPON_TYPE,
); ?>">
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
								<p class="description"><?php echo esc_html__(
            "The reward coupon that gets issued to the referrer after the first referred order reaches completed.",
            "lylrv-connect",
        ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_AMOUNT,
        ); ?>"><?php echo esc_html__(
    "Reward Coupon Amount",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<input type="number" min="1" id="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_AMOUNT,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_REFERRAL_COUPON_AMOUNT,
); ?>" value="<?php echo esc_attr(
    (string) $coupon_amount,
); ?>" class="small-text" />
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
        ); ?>"><?php echo esc_html__(
    "Reward Coupon Expiry (Days)",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<input type="number" min="0" max="3650" id="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_REFERRAL_COUPON_EXPIRY_DAYS,
); ?>" value="<?php echo esc_attr(
    (string) $coupon_expiry_days,
); ?>" class="small-text" />
								<p class="description"><?php echo esc_html__(
            "Set to 0 for no expiry.",
            "lylrv-connect",
        ); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
        ); ?>"><?php echo esc_html__(
    "Reward Coupon Usage Limit",
    "lylrv-connect",
); ?></label>
							</th>
							<td>
								<input type="number" min="1" id="<?php echo esc_attr(
            self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
        ); ?>" name="<?php echo esc_attr(
    self::OPTION_REFERRAL_COUPON_USAGE_LIMIT,
); ?>" value="<?php echo esc_attr(
    (string) $coupon_usage_limit,
); ?>" class="small-text" />
							</td>
						</tr>
					</tbody>
				</table>
				<?php submit_button(); ?>
			</form>

			<hr />

			<h2><?php echo esc_html__("Sync Status", "lylrv-connect"); ?></h2>
			<table class="widefat striped" style="max-width: 760px;">
				<tbody>
					<tr>
						<td><?php echo esc_html__("Site URL", "lylrv-connect"); ?></td>
						<td><?php echo esc_html(home_url("/")); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__("Configuration Ready", "lylrv-connect"); ?></td>
						<td><?php echo esc_html(
          $settings_ready
              ? __("Yes", "lylrv-connect")
              : __("No", "lylrv-connect"),
      ); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__("Last Customers Sync", "lylrv-connect"); ?></td>
						<td><?php echo esc_html(
          self::format_sync_time(get_option(self::OPTION_LAST_CUSTOMERS_SYNC)),
      ); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__("Last Orders Sync", "lylrv-connect"); ?></td>
						<td><?php echo esc_html(
          self::format_sync_time(get_option(self::OPTION_LAST_ORDERS_SYNC)),
      ); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__("Last Error", "lylrv-connect"); ?></td>
						<td><?php echo esc_html(
          self::format_error(get_option(self::OPTION_LAST_SYNC_ERROR)),
      ); ?></td>
					</tr>
				</tbody>
			</table>

			<h2 style="margin-top: 24px;"><?php echo esc_html__(
       "Manual Sync",
       "lylrv-connect",
   ); ?></h2>
			<p><?php echo esc_html__(
       "Use these controls to backfill historical data or force a resync after changing settings.",
       "lylrv-connect",
   ); ?></p>
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
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

			<?php if ($woocommerce_ready): ?>
				<h2 style="margin-top: 24px;"><?php echo esc_html__(
        "Recent Referral Orders",
        "lylrv-connect",
    ); ?></h2>
				<?php if (!empty($recent_referrals)): ?>
					<table class="widefat striped" style="max-width: 960px;">
						<thead>
							<tr>
								<th><?php echo esc_html__("Order", "lylrv-connect"); ?></th>
								<th><?php echo esc_html__("Buyer", "lylrv-connect"); ?></th>
								<th><?php echo esc_html__("Code", "lylrv-connect"); ?></th>
								<th><?php echo esc_html__("Status", "lylrv-connect"); ?></th>
								<th><?php echo esc_html__("Coupon", "lylrv-connect"); ?></th>
							</tr>
						</thead>
						<tbody>
							<?php foreach ($recent_referrals as $referral_order): ?>
								<tr>
									<td>#<?php echo esc_html((string) $referral_order->get_id()); ?></td>
									<td><?php echo esc_html(
             self::normalize_email($referral_order->get_billing_email()) ?:
             __("Unknown", "lylrv-connect"),
         ); ?></td>
									<td><?php echo esc_html(
             (string) $referral_order->get_meta(self::ORDER_META_REFERRAL_CODE),
         ); ?></td>
									<td><?php echo esc_html(
             self::format_referral_status(
                 (string) $referral_order->get_meta(
                     self::ORDER_META_REFERRAL_STATUS,
                 ),
             ),
         ); ?></td>
									<td><?php echo esc_html(
             (string) $referral_order->get_meta(
                 self::ORDER_META_REWARD_COUPON_CODE,
             ) ?:
             "—",
         ); ?></td>
								</tr>
							<?php endforeach; ?>
						</tbody>
					</table>
				<?php else: ?>
					<p><?php echo esc_html__(
         "No referral orders have been captured yet.",
         "lylrv-connect",
     ); ?></p>
				<?php endif; ?>
			<?php endif; ?>
		</div>
		<?php
    }

    private static function render_manual_sync_form(
        $resource,
        $label,
        $disabled,
    ) {
        ?>
		<form method="post" action="<?php echo esc_url(
      admin_url("admin-post.php"),
  ); ?>">
			<?php wp_nonce_field(self::MANUAL_SYNC_ACTION); ?>
			<input type="hidden" name="action" value="<?php echo esc_attr(
       self::MANUAL_SYNC_ACTION,
   ); ?>" />
			<input type="hidden" name="resource" value="<?php echo esc_attr(
       $resource,
   ); ?>" />
			<?php submit_button(
       $label,
       "secondary",
       "submit",
       false,
       $disabled ? ["disabled" => "disabled"] : [],
   ); ?>
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
		<div class="notice notice-<?php echo esc_attr($type); ?> is-dismissible">
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
