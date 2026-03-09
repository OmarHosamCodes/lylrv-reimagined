<?php
/**
 * Plugin Name: Lylrv Connect
 * Plugin URI: https://lylrv.com
 * Description: Connects your WordPress site to Lylrv to display loyalty widgets and sync WooCommerce customers and orders.
 * Version: 1.1.0
 * Author: Lylrv
 * Author URI: https://lylrv.com
 * License: GPLv2 or later
 * Text Domain: lylrv-connect
 */

if (!defined('ABSPATH')) {
	exit;
}

define('LYLRV_CONNECT_VERSION', '1.1.0');
define('LYLRV_CONNECT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LYLRV_CONNECT_PLUGIN_URL', plugin_dir_url(__FILE__));

final class Lylrv_Connect_Plugin {
	const OPTION_GROUP = 'lylrv_connect_options';
	const OPTION_API_KEY = 'lylrv_api_key';
	const OPTION_SAAS_URL = 'lylrv_saas_url';
	const OPTION_SYNC_ENABLED = 'lylrv_sync_enabled';
	const OPTION_SYNC_BATCH_SIZE = 'lylrv_sync_batch_size';
	const OPTION_SYNC_SECRET = 'lylrv_sync_secret';
	const OPTION_LAST_SYNC_ERROR = 'lylrv_last_sync_error';
	const OPTION_LAST_CUSTOMERS_SYNC = 'lylrv_last_customers_sync';
	const OPTION_LAST_ORDERS_SYNC = 'lylrv_last_orders_sync';
	const OPTION_LAST_USERS_CURSOR = 'lylrv_last_users_cursor';
	const OPTION_LAST_ORDERS_CURSOR = 'lylrv_last_orders_cursor';
	const OPTION_LAST_SYNC_SITE = 'lylrv_last_sync_site';
	const CRON_HOOK = 'lylrv_connect_cron_sync';
	const MANUAL_SYNC_ACTION = 'lylrv_connect_manual_sync';

	public static function init() {
		add_action('admin_init', array(__CLASS__, 'register_settings'));
		add_action('admin_menu', array(__CLASS__, 'register_menu'));
		add_action('admin_notices', array(__CLASS__, 'render_admin_notice'));
		add_action('wp_enqueue_scripts', array(__CLASS__, 'enqueue_widget_script'));
		add_filter('script_loader_tag', array(__CLASS__, 'add_module_type'), 10, 3);
		add_action('wp_footer', array(__CLASS__, 'inject_widget_containers'));
		add_shortcode('lylrv_widget', array(__CLASS__, 'widget_shortcode'));
		add_filter('cron_schedules', array(__CLASS__, 'register_cron_schedule'));
		add_action('init', array(__CLASS__, 'ensure_sync_secret'));
		add_action('init', array(__CLASS__, 'maybe_schedule_cron'));
		add_action(self::CRON_HOOK, array(__CLASS__, 'run_scheduled_sync'));
		add_action('admin_post_' . self::MANUAL_SYNC_ACTION, array(__CLASS__, 'handle_manual_sync'));
		add_action('user_register', array(__CLASS__, 'handle_user_event'));
		add_action('profile_update', array(__CLASS__, 'handle_user_event'), 10, 2);
		add_action('woocommerce_created_customer', array(__CLASS__, 'handle_user_event'));
		add_action('woocommerce_new_order', array(__CLASS__, 'handle_order_event'));
		add_action('woocommerce_update_order', array(__CLASS__, 'handle_order_event'));
		add_action('woocommerce_order_status_changed', array(__CLASS__, 'handle_order_status_event'), 10, 3);
	}

	public static function activate() {
		self::ensure_sync_secret();
		self::maybe_schedule_cron();
	}

	public static function deactivate() {
		wp_clear_scheduled_hook(self::CRON_HOOK);
	}

	public static function register_settings() {
		register_setting(
			self::OPTION_GROUP,
			self::OPTION_API_KEY,
			array(
				'sanitize_callback' => array(__CLASS__, 'sanitize_api_key'),
			)
		);

		register_setting(
			self::OPTION_GROUP,
			self::OPTION_SAAS_URL,
			array(
				'default' => 'https://app.lylrv.com',
				'sanitize_callback' => array(__CLASS__, 'sanitize_saas_url'),
			)
		);

		register_setting(
			self::OPTION_GROUP,
			self::OPTION_SYNC_ENABLED,
			array(
				'type' => 'boolean',
				'default' => 1,
				'sanitize_callback' => array(__CLASS__, 'sanitize_sync_enabled'),
			)
		);

		register_setting(
			self::OPTION_GROUP,
			self::OPTION_SYNC_BATCH_SIZE,
			array(
				'type' => 'integer',
				'default' => 25,
				'sanitize_callback' => array(__CLASS__, 'sanitize_batch_size'),
			)
		);
	}

	public static function sanitize_api_key($value) {
		return sanitize_text_field(trim((string) $value));
	}

	public static function sanitize_saas_url($value) {
		$url = esc_url_raw(trim((string) $value));

		if (empty($url)) {
			return 'https://app.lylrv.com';
		}

		return untrailingslashit($url);
	}

	public static function sanitize_sync_enabled($value) {
		return empty($value) ? 0 : 1;
	}

	public static function sanitize_batch_size($value) {
		$batch_size = absint($value);

		if ($batch_size < 1) {
			$batch_size = 25;
		}

		if ($batch_size > 100) {
			$batch_size = 100;
		}

		return $batch_size;
	}

	public static function ensure_sync_secret() {
		$secret = get_option(self::OPTION_SYNC_SECRET);

		if (empty($secret)) {
			update_option(self::OPTION_SYNC_SECRET, wp_generate_uuid4(), false);
		}
	}

	public static function register_menu() {
		add_options_page(
			'Lylrv Connect Settings',
			'Lylrv Connect',
			'manage_options',
			'lylrv-connect',
			array(__CLASS__, 'render_options_page')
		);
	}

	public static function render_options_page() {
		$api_key = get_option(self::OPTION_API_KEY, '');
		$saas_url = get_option(self::OPTION_SAAS_URL, 'https://app.lylrv.com');
		$sync_enabled = (int) get_option(self::OPTION_SYNC_ENABLED, 1);
		$batch_size = (int) get_option(self::OPTION_SYNC_BATCH_SIZE, 25);
		$woocommerce_ready = self::is_woocommerce_available();
		$settings_ready = self::is_sync_ready();
		?>
		<div class="wrap">
			<h1><?php echo esc_html__('Lylrv Connect Settings', 'lylrv-connect'); ?></h1>

			<?php if (!$woocommerce_ready) : ?>
				<div class="notice notice-warning inline">
					<p><?php echo esc_html__('WooCommerce is not active. Widget injection still works, but order and customer sync requires WooCommerce.', 'lylrv-connect'); ?></p>
				</div>
			<?php endif; ?>

			<form method="post" action="options.php">
				<?php settings_fields(self::OPTION_GROUP); ?>
				<table class="form-table" role="presentation">
					<tbody>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(self::OPTION_API_KEY); ?>"><?php echo esc_html__('API Key', 'lylrv-connect'); ?></label>
							</th>
							<td>
								<input
									type="text"
									id="<?php echo esc_attr(self::OPTION_API_KEY); ?>"
									name="<?php echo esc_attr(self::OPTION_API_KEY); ?>"
									value="<?php echo esc_attr($api_key); ?>"
									class="regular-text"
								/>
								<p class="description"><?php echo esc_html__('Enter the Lylrv API key for the client you want to sync.', 'lylrv-connect'); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(self::OPTION_SAAS_URL); ?>"><?php echo esc_html__('SaaS Application URL', 'lylrv-connect'); ?></label>
							</th>
							<td>
								<input
									type="url"
									id="<?php echo esc_attr(self::OPTION_SAAS_URL); ?>"
									name="<?php echo esc_attr(self::OPTION_SAAS_URL); ?>"
									value="<?php echo esc_attr($saas_url); ?>"
									class="regular-text"
								/>
								<p class="description"><?php echo esc_html__('The URL where the Lylrv application is hosted, for example https://app.lylrv.com.', 'lylrv-connect'); ?></p>
							</td>
						</tr>
						<tr>
							<th scope="row"><?php echo esc_html__('WooCommerce Sync', 'lylrv-connect'); ?></th>
							<td>
								<label for="<?php echo esc_attr(self::OPTION_SYNC_ENABLED); ?>">
									<input
										type="checkbox"
										id="<?php echo esc_attr(self::OPTION_SYNC_ENABLED); ?>"
										name="<?php echo esc_attr(self::OPTION_SYNC_ENABLED); ?>"
										value="1"
										<?php checked(1, $sync_enabled); ?>
									/>
									<?php echo esc_html__('Sync WooCommerce customers and orders to Lylrv automatically.', 'lylrv-connect'); ?>
								</label>
							</td>
						</tr>
						<tr>
							<th scope="row">
								<label for="<?php echo esc_attr(self::OPTION_SYNC_BATCH_SIZE); ?>"><?php echo esc_html__('Sync Batch Size', 'lylrv-connect'); ?></label>
							</th>
							<td>
								<input
									type="number"
									min="1"
									max="100"
									id="<?php echo esc_attr(self::OPTION_SYNC_BATCH_SIZE); ?>"
									name="<?php echo esc_attr(self::OPTION_SYNC_BATCH_SIZE); ?>"
									value="<?php echo esc_attr((string) $batch_size); ?>"
									class="small-text"
								/>
								<p class="description"><?php echo esc_html__('How many records to send in each sync request. Lower this if your host has strict request limits.', 'lylrv-connect'); ?></p>
							</td>
						</tr>
					</tbody>
				</table>
				<?php submit_button(); ?>
			</form>

			<hr />

			<h2><?php echo esc_html__('Sync Status', 'lylrv-connect'); ?></h2>
			<table class="widefat striped" style="max-width: 760px;">
				<tbody>
					<tr>
						<td><?php echo esc_html__('Site URL', 'lylrv-connect'); ?></td>
						<td><?php echo esc_html(home_url('/')); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__('Configuration Ready', 'lylrv-connect'); ?></td>
						<td><?php echo esc_html($settings_ready ? __('Yes', 'lylrv-connect') : __('No', 'lylrv-connect')); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__('Last Customers Sync', 'lylrv-connect'); ?></td>
						<td><?php echo esc_html(self::format_sync_time(get_option(self::OPTION_LAST_CUSTOMERS_SYNC))); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__('Last Orders Sync', 'lylrv-connect'); ?></td>
						<td><?php echo esc_html(self::format_sync_time(get_option(self::OPTION_LAST_ORDERS_SYNC))); ?></td>
					</tr>
					<tr>
						<td><?php echo esc_html__('Last Error', 'lylrv-connect'); ?></td>
						<td><?php echo esc_html(self::format_error(get_option(self::OPTION_LAST_SYNC_ERROR))); ?></td>
					</tr>
				</tbody>
			</table>

			<h2 style="margin-top: 24px;"><?php echo esc_html__('Manual Sync', 'lylrv-connect'); ?></h2>
			<p><?php echo esc_html__('Use these controls to backfill historical data or force a resync after changing settings.', 'lylrv-connect'); ?></p>
			<div style="display: flex; gap: 12px; flex-wrap: wrap;">
				<?php self::render_manual_sync_form('customers', __('Sync Customers', 'lylrv-connect'), !$settings_ready); ?>
				<?php self::render_manual_sync_form('orders', __('Sync Orders', 'lylrv-connect'), !$settings_ready || !$woocommerce_ready); ?>
				<?php self::render_manual_sync_form('all', __('Sync Everything', 'lylrv-connect'), !$settings_ready || !$woocommerce_ready); ?>
			</div>
		</div>
		<?php
	}

	private static function render_manual_sync_form($resource, $label, $disabled) {
		?>
		<form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
			<?php wp_nonce_field(self::MANUAL_SYNC_ACTION); ?>
			<input type="hidden" name="action" value="<?php echo esc_attr(self::MANUAL_SYNC_ACTION); ?>" />
			<input type="hidden" name="resource" value="<?php echo esc_attr($resource); ?>" />
			<?php submit_button($label, 'secondary', 'submit', false, $disabled ? array('disabled' => 'disabled') : array()); ?>
		</form>
		<?php
	}

	public static function render_admin_notice() {
		if (!is_admin()) {
			return;
		}

		if (!current_user_can('manage_options')) {
			return;
		}

		$screen = get_current_screen();
		if (!$screen || 'settings_page_lylrv-connect' !== $screen->id) {
			return;
		}

		$notice = get_transient(self::get_notice_key());
		if (empty($notice) || !is_array($notice)) {
			return;
		}

		delete_transient(self::get_notice_key());
		$type = !empty($notice['type']) ? $notice['type'] : 'success';
		$message = !empty($notice['message']) ? $notice['message'] : '';

		if (empty($message)) {
			return;
		}
		?>
		<div class="notice notice-<?php echo esc_attr($type); ?> is-dismissible">
			<p><?php echo esc_html($message); ?></p>
		</div>
		<?php
	}

	public static function handle_manual_sync() {
		if (!current_user_can('manage_options')) {
			wp_die(esc_html__('You are not allowed to do that.', 'lylrv-connect'));
		}

		check_admin_referer(self::MANUAL_SYNC_ACTION);

		$resource = 'all';
		if (isset($_POST['resource'])) {
			$resource = sanitize_key(wp_unslash($_POST['resource']));
		}

		$notice = array(
			'type' => 'success',
			'message' => __('Sync completed.', 'lylrv-connect'),
		);

		if (!self::is_sync_ready()) {
			$notice = array(
				'type' => 'error',
				'message' => __('Add a valid API key and SaaS URL before syncing.', 'lylrv-connect'),
			);
		} else {
			if (function_exists('set_time_limit')) {
				@set_time_limit(0);
			}

			if ('customers' === $resource) {
				$result = self::full_sync_users();
			} elseif ('orders' === $resource) {
				$result = self::full_sync_orders();
			} else {
				$user_result = self::full_sync_users();
				$order_result = self::full_sync_orders();

				if (is_wp_error($user_result)) {
					$result = $user_result;
				} elseif (is_wp_error($order_result)) {
					$result = $order_result;
				} else {
					$result = array(
						'customers' => $user_result['customers'] + $order_result['customers'],
						'orders' => $order_result['orders'],
					);
				}
			}

			if (is_wp_error($result)) {
				$notice = array(
					'type' => 'error',
					'message' => $result->get_error_message(),
				);
			} else {
				$message = sprintf(
					/* translators: 1: customer count, 2: order count */
					__('Sync finished. Customers sent: %1$d. Orders sent: %2$d.', 'lylrv-connect'),
					isset($result['customers']) ? (int) $result['customers'] : 0,
					isset($result['orders']) ? (int) $result['orders'] : 0
				);

				$notice = array(
					'type' => 'success',
					'message' => $message,
				);
			}
		}

		set_transient(self::get_notice_key(), $notice, MINUTE_IN_SECONDS);
		wp_safe_redirect(admin_url('options-general.php?page=lylrv-connect'));
		exit;
	}

	public static function register_cron_schedule($schedules) {
		if (!isset($schedules['lylrv_every_fifteen_minutes'])) {
			$schedules['lylrv_every_fifteen_minutes'] = array(
				'interval' => 15 * MINUTE_IN_SECONDS,
				'display' => __('Every 15 Minutes', 'lylrv-connect'),
			);
		}

		return $schedules;
	}

	public static function maybe_schedule_cron() {
		if (!wp_next_scheduled(self::CRON_HOOK)) {
			wp_schedule_event(time() + MINUTE_IN_SECONDS, 'lylrv_every_fifteen_minutes', self::CRON_HOOK);
		}
	}

	public static function run_scheduled_sync() {
		if (!self::is_sync_ready()) {
			return;
		}

		self::sync_recent_users();
		self::sync_recent_orders();
	}

	public static function handle_user_event($user_id) {
		self::sync_user_by_id((int) $user_id);
	}

	public static function handle_order_event($order_id) {
		self::sync_order_by_id((int) $order_id);
	}

	public static function handle_order_status_event($order_id) {
		self::sync_order_by_id((int) $order_id);
	}

	public static function enqueue_widget_script() {
		$api_key = get_option(self::OPTION_API_KEY, '');
		$saas_url = self::get_saas_url();

		if (empty($api_key) || empty($saas_url)) {
			return;
		}

		$script_url = $saas_url . '/widgets/loader.bundle.js';
		$final_url = add_query_arg('apiKey', $api_key, $script_url);

		wp_enqueue_script('lylrv-widget-loader', $final_url, array(), null, true);

		$data = array(
			'user' => array(
				'isLoggedIn' => is_user_logged_in(),
				'email' => null,
				'name' => null,
			),
			'context' => array(
				'product' => null,
			),
		);

		if (is_user_logged_in()) {
			$current_user = wp_get_current_user();
			$data['user']['email'] = $current_user->user_email;
			$data['user']['name'] = $current_user->display_name;
		}

		if (self::is_woocommerce_available() && function_exists('is_product') && is_product()) {
			global $post;

			if ($post instanceof WP_Post) {
				$product_id = (int) $post->ID;
				$has_purchased = false;

				if (is_user_logged_in()) {
					$has_purchased = wc_customer_bought_product($data['user']['email'], get_current_user_id(), $product_id);
				}

				$data['context']['product'] = array(
					'id' => $product_id,
					'hasPurchased' => $has_purchased,
				);
			}
		}

		wp_localize_script('lylrv-widget-loader', 'LYLRV_WP_DATA', $data);
	}

	public static function add_module_type($tag, $handle, $src) {
		if ('lylrv-widget-loader' !== $handle) {
			return $tag;
		}

		return str_replace(' src=', ' type="module" src=', $tag);
	}

	public static function inject_widget_containers() {
		if (empty(get_option(self::OPTION_API_KEY, ''))) {
			return;
		}

		echo '<div id="lylrv-loyalty-container"></div>';
		echo '<div id="lylrv-reviews-container"></div>';

		if (self::is_woocommerce_available() && function_exists('is_product') && is_product()) {
			echo '<div id="lylrv-productReviews-container"></div>';
		}
	}

	public static function widget_shortcode($atts) {
		$attributes = shortcode_atts(
			array(
				'name' => 'product-reviews',
			),
			$atts
		);

		$widget_name = sanitize_title($attributes['name']);
		return '<div id="lylrv-' . esc_attr($widget_name) . '-container"></div>';
	}

	private static function sync_user_by_id($user_id) {
		if (!self::is_sync_ready()) {
			return false;
		}

		$user = get_userdata($user_id);
		if (!$user instanceof WP_User || !self::is_syncable_user($user)) {
			return false;
		}

		$customer = self::build_customer_payload_from_user($user);
		if (empty($customer)) {
			return false;
		}

		$result = self::send_sync_payload(array($customer), array());
		if (is_wp_error($result)) {
			self::record_sync_error($result->get_error_message());
			return false;
		}

		self::mark_sync_success('customers');
		return true;
	}

	private static function sync_order_by_id($order_id) {
		if (!self::is_sync_ready() || !self::is_woocommerce_available()) {
			return false;
		}

		$order = wc_get_order($order_id);
		if (!$order) {
			return false;
		}

		$order_payload = self::build_order_payload($order);
		if (empty($order_payload)) {
			return false;
		}

		$customers = array();
		$order_customer = self::build_customer_payload_from_order($order);
		if (!empty($order_customer)) {
			$customers[] = $order_customer;
		}

		$result = self::send_sync_payload($customers, array($order_payload));
		if (is_wp_error($result)) {
			self::record_sync_error($result->get_error_message());
			return false;
		}

		self::mark_sync_success('orders');
		if (!empty($customers)) {
			self::mark_sync_success('customers');
		}

		return true;
	}

	private static function full_sync_users() {
		$batch_size = self::get_batch_size();
		$offset = 0;
		$total_customers = 0;

		do {
			$query = new WP_User_Query(
				array(
					'number' => $batch_size,
					'offset' => $offset,
					'orderby' => 'registered',
					'order' => 'ASC',
					'fields' => 'all',
				)
			);

			$users = $query->get_results();
			$customers = array();

			foreach ($users as $user) {
				if (!$user instanceof WP_User || !self::is_syncable_user($user)) {
					continue;
				}

				$payload = self::build_customer_payload_from_user($user);
				if (!empty($payload)) {
					$customers[] = $payload;
				}
			}

			if (!empty($customers)) {
				$result = self::send_sync_payload($customers, array());
				if (is_wp_error($result)) {
					self::record_sync_error($result->get_error_message());
					return $result;
				}

				$total_customers += count($customers);
				self::mark_sync_success('customers');
			}

			$offset += $batch_size;
		} while (!empty($users) && count($users) === $batch_size);

		return array(
			'customers' => $total_customers,
			'orders' => 0,
		);
	}

	private static function full_sync_orders() {
		if (!self::is_woocommerce_available()) {
			return new WP_Error('lylrv_missing_woocommerce', __('WooCommerce is required to sync orders.', 'lylrv-connect'));
		}

		$batch_size = self::get_batch_size();
		$offset = 0;
		$total_orders = 0;
		$total_customers = 0;

		do {
			$order_ids = wc_get_orders(
				array(
					'limit' => $batch_size,
					'offset' => $offset,
					'orderby' => 'date',
					'order' => 'ASC',
					'return' => 'ids',
				)
			);

			$orders = array();
			$customers = array();
			$seen_emails = array();

			foreach ($order_ids as $order_id) {
				$order = wc_get_order($order_id);
				if (!$order) {
					continue;
				}

				$order_payload = self::build_order_payload($order);
				if (!empty($order_payload)) {
					$orders[] = $order_payload;
				}

				$customer_payload = self::build_customer_payload_from_order($order);
				if (!empty($customer_payload) && empty($seen_emails[$customer_payload['email']])) {
					$customers[] = $customer_payload;
					$seen_emails[$customer_payload['email']] = true;
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
					self::mark_sync_success('orders');
				}
				if (!empty($customers)) {
					self::mark_sync_success('customers');
				}
			}

			$offset += $batch_size;
		} while (!empty($order_ids) && count($order_ids) === $batch_size);

		return array(
			'customers' => $total_customers,
			'orders' => $total_orders,
		);
	}

	private static function sync_recent_users() {
		$batch_size = self::get_batch_size();
		$args = array(
			'number' => $batch_size,
			'orderby' => 'registered',
			'order' => 'ASC',
			'fields' => 'all',
		);
		$cursor = get_option(self::OPTION_LAST_USERS_CURSOR);

		if (!empty($cursor)) {
			$args['date_query'] = array(
				array(
					'column' => 'user_registered',
					'after' => $cursor,
					'inclusive' => false,
				),
			);
		}

		$query = new WP_User_Query($args);
		$users = $query->get_results();

		if (empty($users)) {
			return;
		}

		$customers = array();
		$latest_timestamp = null;

		foreach ($users as $user) {
			if (!$user instanceof WP_User || !self::is_syncable_user($user)) {
				continue;
			}

			$payload = self::build_customer_payload_from_user($user);
			if (!empty($payload)) {
				$customers[] = $payload;
			}

			if (!empty($user->user_registered)) {
				$latest_timestamp = mysql2date('c', $user->user_registered, false);
			}
		}

		if (empty($customers)) {
			return;
		}

		$result = self::send_sync_payload($customers, array());
		if (is_wp_error($result)) {
			self::record_sync_error($result->get_error_message());
			return;
		}

		self::mark_sync_success('customers');
		if (!empty($latest_timestamp)) {
			update_option(self::OPTION_LAST_USERS_CURSOR, $latest_timestamp, false);
		}
	}

	private static function sync_recent_orders() {
		if (!self::is_woocommerce_available()) {
			return;
		}

		$args = array(
			'limit' => self::get_batch_size(),
			'orderby' => 'modified',
			'order' => 'ASC',
			'return' => 'ids',
		);
		$cursor = get_option(self::OPTION_LAST_ORDERS_CURSOR);

		if (!empty($cursor)) {
			$args['date_modified'] = '>' . strtotime($cursor);
		}

		$order_ids = wc_get_orders($args);
		if (empty($order_ids)) {
			return;
		}

		$orders = array();
		$customers = array();
		$seen_emails = array();
		$latest_timestamp = null;

		foreach ($order_ids as $order_id) {
			$order = wc_get_order($order_id);
			if (!$order) {
				continue;
			}

			$order_payload = self::build_order_payload($order);
			if (!empty($order_payload)) {
				$orders[] = $order_payload;
				$latest_timestamp = $order_payload['updatedAt'];
			}

			$customer_payload = self::build_customer_payload_from_order($order);
			if (!empty($customer_payload) && empty($seen_emails[$customer_payload['email']])) {
				$customers[] = $customer_payload;
				$seen_emails[$customer_payload['email']] = true;
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
			self::mark_sync_success('customers');
		}
		if (!empty($orders)) {
			self::mark_sync_success('orders');
		}
		if (!empty($latest_timestamp)) {
			update_option(self::OPTION_LAST_ORDERS_CURSOR, $latest_timestamp, false);
		}
	}

	private static function send_sync_payload($customers, $orders) {
		if (empty($customers) && empty($orders)) {
			return true;
		}

		$api_key = get_option(self::OPTION_API_KEY, '');
		$endpoint = self::get_saas_url() . '/api/widget/sync';
		$payload = array(
			'apiKey' => $api_key,
			'syncSecret' => self::get_sync_secret(),
			'storeUrl' => home_url('/'),
			'customers' => array_values($customers),
			'orders' => array_values($orders),
		);

		$response = wp_remote_post(
			$endpoint,
			array(
				'timeout' => 45,
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body' => wp_json_encode($payload),
				'data_format' => 'body',
			)
		);

		if (is_wp_error($response)) {
			return $response;
		}

		$status_code = (int) wp_remote_retrieve_response_code($response);
		$body = wp_remote_retrieve_body($response);
		$decoded = json_decode($body, true);

		if ($status_code < 200 || $status_code >= 300) {
			$message = __('The Lylrv sync request failed.', 'lylrv-connect');
			if (is_array($decoded) && !empty($decoded['error'])) {
				$message = (string) $decoded['error'];
			}

			return new WP_Error('lylrv_sync_failed', $message);
		}

		update_option(self::OPTION_LAST_SYNC_ERROR, '', false);
		update_option(self::OPTION_LAST_SYNC_SITE, home_url('/'), false);

		return is_array($decoded) ? $decoded : true;
	}

	private static function build_customer_payload_from_user($user) {
		$email = sanitize_email($user->user_email);
		if (empty($email)) {
			$email = sanitize_email(get_user_meta($user->ID, 'billing_email', true));
		}

		if (empty($email)) {
			return null;
		}

		$first_name = trim((string) get_user_meta($user->ID, 'billing_first_name', true));
		if (empty($first_name)) {
			$first_name = trim((string) get_user_meta($user->ID, 'first_name', true));
		}

		$last_name = trim((string) get_user_meta($user->ID, 'billing_last_name', true));
		if (empty($last_name)) {
			$last_name = trim((string) get_user_meta($user->ID, 'last_name', true));
		}

		$name = trim($first_name . ' ' . $last_name);
		if (empty($name)) {
			$name = trim((string) $user->display_name);
		}
		if (empty($name)) {
			$name = self::name_from_email($email);
		}

		$registered_at = !empty($user->user_registered)
			? mysql2date('c', $user->user_registered, false)
			: current_time('c', true);

		return array(
			'email' => strtolower($email),
			'name' => $name,
			'phone' => self::normalize_string(get_user_meta($user->ID, 'billing_phone', true)),
			'externalUserId' => (string) $user->ID,
			'totalPoints' => 0,
			'createdAt' => $registered_at,
			'updatedAt' => current_time('c', true),
		);
	}

	private static function build_customer_payload_from_order($order) {
		$email = sanitize_email($order->get_billing_email());
		if (empty($email)) {
			return null;
		}

		$name = trim($order->get_formatted_billing_full_name());
		if (empty($name)) {
			$name = trim($order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name());
		}
		if (empty($name)) {
			$name = self::name_from_email($email);
		}

		$created = $order->get_date_created();
		$updated = $order->get_date_modified();
		$customer_id = $order->get_customer_id();

		return array(
			'email' => strtolower($email),
			'name' => $name,
			'phone' => self::normalize_string($order->get_billing_phone()),
			'externalUserId' => $customer_id ? (string) $customer_id : null,
			'totalPoints' => 0,
			'createdAt' => $created ? $created->date('c') : current_time('c', true),
			'updatedAt' => $updated ? $updated->date('c') : current_time('c', true),
		);
	}

	private static function build_order_payload($order) {
		$order_id = (int) $order->get_id();
		if ($order_id < 1) {
			return null;
		}

		$created = $order->get_date_created();
		$updated = $order->get_date_modified();
		$slugs = array();

		foreach ($order->get_items('line_item') as $item) {
			if (!is_object($item)) {
				continue;
			}

			$product = $item->get_product();
			$slug = '';

			if ($product && method_exists($product, 'get_slug')) {
				$slug = (string) $product->get_slug();
			}

			if (empty($slug)) {
				$slug = sanitize_title($item->get_name());
			}

			if (!empty($slug)) {
				$slugs[] = $slug;
			}
		}

		return array(
			'orderId' => $order_id,
			'email' => self::normalize_email($order->get_billing_email()),
			'phone' => self::normalize_string($order->get_billing_phone()),
			'status' => self::normalize_string($order->get_status()),
			'payment' => $order->is_paid() ? 'paid' : 'unpaid',
			'total' => (string) $order->get_total(),
			'billing' => self::build_address_payload(
				$order->get_billing_first_name(),
				$order->get_billing_last_name(),
				$order->get_billing_company(),
				$order->get_billing_address_1(),
				$order->get_billing_address_2(),
				$order->get_billing_city(),
				$order->get_billing_state(),
				$order->get_billing_postcode(),
				$order->get_billing_country()
			),
			'shipping' => self::build_address_payload(
				$order->get_shipping_first_name(),
				$order->get_shipping_last_name(),
				$order->get_shipping_company(),
				$order->get_shipping_address_1(),
				$order->get_shipping_address_2(),
				$order->get_shipping_city(),
				$order->get_shipping_state(),
				$order->get_shipping_postcode(),
				$order->get_shipping_country()
			),
			'slugs' => array_values(array_unique($slugs)),
			'createdAt' => $created ? $created->date('c') : current_time('c', true),
			'updatedAt' => $updated ? $updated->date('c') : current_time('c', true),
		);
	}

	private static function build_address_payload($first_name, $last_name, $company, $address_1, $address_2, $city, $state, $postcode, $country) {
		return array(
			'firstName' => self::normalize_string($first_name),
			'lastName' => self::normalize_string($last_name),
			'company' => self::normalize_string($company),
			'address1' => self::normalize_string($address_1),
			'address2' => self::normalize_string($address_2),
			'city' => self::normalize_string($city),
			'state' => self::normalize_string($state),
			'postcode' => self::normalize_string($postcode),
			'country' => self::normalize_string($country),
		);
	}

	private static function is_syncable_user($user) {
		$roles = is_array($user->roles) ? $user->roles : array();
		$has_customer_role = in_array('customer', $roles, true) || in_array('subscriber', $roles, true);
		$has_billing_details = !empty(get_user_meta($user->ID, 'billing_email', true)) || !empty(get_user_meta($user->ID, 'billing_phone', true));

		if (!$has_customer_role && !$has_billing_details) {
			return false;
		}

		return !empty(self::normalize_email($user->user_email)) || !empty(self::normalize_email(get_user_meta($user->ID, 'billing_email', true)));
	}

	private static function is_sync_ready() {
		return !empty(get_option(self::OPTION_SYNC_ENABLED, 1)) && !empty(get_option(self::OPTION_API_KEY, '')) && !empty(self::get_saas_url());
	}

	private static function get_saas_url() {
		return untrailingslashit((string) get_option(self::OPTION_SAAS_URL, 'https://app.lylrv.com'));
	}

	private static function get_sync_secret() {
		self::ensure_sync_secret();
		return (string) get_option(self::OPTION_SYNC_SECRET, '');
	}

	private static function get_batch_size() {
		return (int) get_option(self::OPTION_SYNC_BATCH_SIZE, 25);
	}

	private static function is_woocommerce_available() {
		return class_exists('WooCommerce') && function_exists('wc_get_order') && function_exists('wc_get_orders');
	}

	private static function normalize_string($value) {
		$value = trim((string) $value);
		return '' === $value ? null : $value;
	}

	private static function normalize_email($email) {
		$email = sanitize_email((string) $email);
		return empty($email) ? null : strtolower($email);
	}

	private static function name_from_email($email) {
		$parts = explode('@', (string) $email);
		return !empty($parts[0]) ? $parts[0] : (string) $email;
	}

	private static function mark_sync_success($resource) {
		$timestamp = current_time('c', true);

		if ('orders' === $resource) {
			update_option(self::OPTION_LAST_ORDERS_SYNC, $timestamp, false);
		}

		if ('customers' === $resource) {
			update_option(self::OPTION_LAST_CUSTOMERS_SYNC, $timestamp, false);
		}

		update_option(self::OPTION_LAST_SYNC_ERROR, '', false);
	}

	private static function record_sync_error($message) {
		update_option(self::OPTION_LAST_SYNC_ERROR, sanitize_text_field((string) $message), false);
	}

	private static function format_sync_time($value) {
		if (empty($value)) {
			return __('Never', 'lylrv-connect');
		}

		$timestamp = strtotime((string) $value);
		if (!$timestamp) {
			return (string) $value;
		}

		return sprintf(
			/* translators: 1: absolute time, 2: relative time */
			__('%1$s (%2$s ago)', 'lylrv-connect'),
			wp_date(get_option('date_format') . ' ' . get_option('time_format'), $timestamp),
			human_time_diff($timestamp, time())
		);
	}

	private static function format_error($value) {
		if (empty($value)) {
			return __('No recent sync errors.', 'lylrv-connect');
		}

		return (string) $value;
	}

	private static function get_notice_key() {
		return 'lylrv_connect_notice_' . get_current_user_id();
	}
}

register_activation_hook(__FILE__, array('Lylrv_Connect_Plugin', 'activate'));
register_deactivation_hook(__FILE__, array('Lylrv_Connect_Plugin', 'deactivate'));
Lylrv_Connect_Plugin::init();
