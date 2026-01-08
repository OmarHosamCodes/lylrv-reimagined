<?php
/**
 * Plugin Name: Lylrv Connect
 * Plugin URI: https://lylrv.com
 * Description: Connects your WordPress site to Lylrv to display loyalty widgets.
 * Version: 1.0.0
 * Author: Lylrv
 * Author URI: https://lylrv.com
 * License: GPLv2 or later
 * Text Domain: lylrv-connect
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('LYLRV_CONNECT_VERSION', '1.0.0');
define('LYLRV_CONNECT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('LYLRV_CONNECT_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Register settings
 */
function lylrv_connect_register_settings() {
    register_setting('lylrv_connect_options', 'lylrv_shop_domain');
    register_setting('lylrv_connect_options', 'lylrv_saas_url', array(
        'default' => 'https://app.lylrv.com'
    ));
}
add_action('admin_init', 'lylrv_connect_register_settings');

/**
 * Add options page
 */
function lylrv_connect_menu() {
    add_options_page(
        'Lylrv Connect Settings',
        'Lylrv Connect',
        'manage_options',
        'lylrv-connect',
        'lylrv_connect_options_page'
    );
}
add_action('admin_menu', 'lylrv_connect_menu');

/**
 * Options page callback
 */
function lylrv_connect_options_page() {
    ?>
    <div class="wrap">
        <h1>Lylrv Connect Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('lylrv_connect_options'); ?>
            <?php do_settings_sections('lylrv_connect_options'); ?>
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Shop Domain</th>
                    <td>
                        <input type="text" name="lylrv_shop_domain" value="<?php echo esc_attr(get_option('lylrv_shop_domain')); ?>" class="regular-text" />
                        <p class="description">Enter the shop domain registered in Lylrv (e.g., myshop.com).</p>
                    </td>
                </tr>
                <tr valign="top">
                    <th scope="row">SaaS Application URL</th>
                    <td>
                        <input type="text" name="lylrv_saas_url" value="<?php echo esc_attr(get_option('lylrv_saas_url', 'https://app.lylrv.com')); ?>" class="regular-text" />
                        <p class="description">The URL where the Lylrv application is hosted (e.g., https://app.lylrv.com).</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

/**
 * Inject the widget loader script
 */
function lylrv_connect_script() {
    $shop_domain = get_option('lylrv_shop_domain');
    $saas_url = get_option('lylrv_saas_url', 'https://app.lylrv.com');

    // Remove trailing slash from URL if present
    $saas_url = untrailingslashit($saas_url);

    if (!empty($shop_domain) && !empty($saas_url)) {
        $script_url = $saas_url . '/widgets/loader.bundle.js';
        
        // Add shop parameter
        $final_url = add_query_arg('shop', $shop_domain, $script_url);
        
        // Enqueue the script with the 'shop' parameter
        // We handle this via wp_enqueue_script for better compatibility, 
        // but since we need query params in the src, creating a handle with the exact URL is one way,
        // or printing it directly. 
        // Best practice for scripts with dynamic query params that shouldn't be cached as versioning:
        
        // Register it first without params to be clean? No, the params are needed for the loader initialization logic (document.currentScript).
        // So we must include the params in the src attribute.
        
        wp_enqueue_script('lylrv-widget-loader', $final_url, array(), null, true);

        // Prepare data to inject
        $data = array(
            'user' => array(
                'isLoggedIn' => is_user_logged_in(),
                'email' => null,
                'name' => null,
            ),
            'context' => array(
                'product' => null
            )
        );

        if (is_user_logged_in()) {
            $current_user = wp_get_current_user();
            $data['user']['email'] = $current_user->user_email;
            $data['user']['name'] = $current_user->display_name;
        }

        // WooCommerce Integration
        if (class_exists('WooCommerce')) {
            // Check if we are on a product page
            if (is_product()) {
                global $post;
                $product_id = $post->ID;
                
                $has_purchased = false;
                if (is_user_logged_in()) {
                    // Check if current user bought this product
                    // wc_customer_bought_product( $customer_email, $user_id, $product_id )
                    $has_purchased = wc_customer_bought_product($data['user']['email'], get_current_user_id(), $product_id);
                }

                $data['context']['product'] = array(
                    'id' => $product_id,
                    'hasPurchased' => $has_purchased
                );
            }
        }

        wp_localize_script('lylrv-widget-loader', 'LYLRV_WP_DATA', $data);
    }
}
add_action('wp_enqueue_scripts', 'lylrv_connect_script');

/**
 * Add type="module" attribute to the loader script tag.
 * ES modules require type="module" to use dynamic import() for loading widget bundles.
 */
function lylrv_add_module_type($tag, $handle, $src) {
    if ($handle !== 'lylrv-widget-loader') {
        return $tag;
    }
    
    // Replace the script tag to add type="module"
    // Note: wp_localize_script creates an inline script before the module.
    // We only need to modify the main script tag that has the src attribute.
    $tag = str_replace(' src=', ' type="module" src=', $tag);
    
    return $tag;
}
add_filter('script_loader_tag', 'lylrv_add_module_type', 10, 3);

/**
 * Auto-inject loyalty and reviews widget containers in the footer.
 * These are floating widgets that appear fixed on the page.
 */
function lylrv_inject_floating_widgets() {
    $shop_domain = get_option('lylrv_shop_domain');
    if (empty($shop_domain)) {
        return;
    }
    
    // Inject containers for floating widgets (loyalty and reviews)
    // The loader will mount into these if the widgets are enabled in the config
    echo '<div id="lylrv-loyalty-container"></div>';
    echo '<div id="lylrv-reviews-container"></div>';
}
add_action('wp_footer', 'lylrv_inject_floating_widgets');

/**
 * Auto-inject product-reviews widget on WooCommerce product pages.
 * Placed after the product summary section.
 */
function lylrv_inject_product_reviews_widget() {
    $shop_domain = get_option('lylrv_shop_domain');
    if (empty($shop_domain)) {
        return;
    }
    
    echo '<div id="lylrv-productReviews-container" style="margin-top: 2rem; margin-bottom: 2rem;"></div>';
}
// Hook into WooCommerce product page - after product summary
add_action('woocommerce_after_single_product_summary', 'lylrv_inject_product_reviews_widget', 15);

/**
 * Shortcode to embed widgets inline
 * Usage: [lylrv_widget name="product-reviews"]
 */
function lylrv_widget_shortcode($atts) {
    $a = shortcode_atts(array(
        'name' => 'product-reviews',
    ), $atts);

    $widget_name = sanitize_title($a['name']); // clean slug
    
    // We output a div that the loader will find and mount into.
    return '<div id="lylrv-' . esc_attr($widget_name) . '-container"></div>';
}
add_shortcode('lylrv_widget', 'lylrv_widget_shortcode');
