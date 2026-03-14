<?php
/**
 * Lylrv Connect – SaaS Product Display Module.
 *
 * Registers a custom post type for URL routing, fetches product data
 * from the SaaS API with transient caching, and registers the
 * Gutenberg product-display block.
 *
 * Zero WooCommerce dependencies — operates entirely via SaaS API.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Products
{
    /**
     * Cache duration for product data (in seconds). Default: 5 minutes.
     */
    const PRODUCT_CACHE_TTL = 300;

    /**
     * Custom post type slug for SaaS-managed products.
     */
    const PRODUCT_POST_TYPE = "lylrv_product";

    /**
     * Register hooks for the products module.
     * Called from Lylrv_Connect_Plugin::init().
     */
    public static function init_products()
    {
        add_action("init", [__CLASS__, "register_product_post_type"], 15);
        add_action("init", [__CLASS__, "register_product_blocks"], 20);
        add_action("template_redirect", [
            __CLASS__,
            "handle_product_template_redirect",
        ]);
        add_filter("template_include", [
            __CLASS__,
            "maybe_override_product_template",
        ]);

        // Register REST endpoint for block editor to search/list products.
        add_action("rest_api_init", [
            __CLASS__,
            "register_product_rest_routes",
        ]);
    }

    /**
     * Register the lylrv_product custom post type.
     *
     * This CPT exists solely for URL routing (e.g. /product/my-slug/).
     * No product data is stored in the WordPress database.
     */
    public static function register_product_post_type()
    {
        $labels = [
            "name" => __("Products", "lylrv-connect"),
            "singular_name" => __("Product", "lylrv-connect"),
        ];

        register_post_type(self::PRODUCT_POST_TYPE, [
            "labels" => $labels,
            "public" => true,
            "has_archive" => true,
            "show_ui" => false, // No admin UI — managed via SaaS dashboard.
            "show_in_menu" => false,
            "show_in_rest" => false, // No WP REST for this CPT.
            "rewrite" => ["slug" => "product", "with_front" => false],
            "supports" => ["title"],
            "query_var" => true,
        ]);
    }

    /**
     * Handle template redirect for product pages.
     *
     * When a request comes in for /product/<slug>/, we intercept it,
     * fetch data from SaaS API, and render. If the product doesn't exist
     * in the SaaS, we 404.
     */
    public static function handle_product_template_redirect()
    {
        if (!is_singular(self::PRODUCT_POST_TYPE)) {
            return;
        }

        global $post;
        if (
            !$post instanceof WP_Post ||
            self::PRODUCT_POST_TYPE !== $post->post_type
        ) {
            return;
        }

        $slug = $post->post_name;
        $product = self::fetch_product_by_slug($slug);

        if (!$product) {
            global $wp_query;
            $wp_query->set_404();
            status_header(404);
            return;
        }

        // Store product data for template access.
        $GLOBALS["lylrv_product"] = $product;
    }

    /**
     * Override the template for product pages to use our built-in template.
     *
     * @param string $template The current template path.
     * @return string
     */
    public static function maybe_override_product_template($template)
    {
        if (!is_singular(self::PRODUCT_POST_TYPE)) {
            return $template;
        }

        // If the theme provides a template, use it.
        $theme_template = locate_template([
            "lylrv-product.php",
            "single-lylrv_product.php",
        ]);

        if ($theme_template) {
            return $theme_template;
        }

        // Use our built-in minimal template.
        $plugin_template =
            LYLRV_CONNECT_PLUGIN_DIR . "templates/single-product.php";
        if (file_exists($plugin_template)) {
            return $plugin_template;
        }

        return $template;
    }

    /**
     * Fetch a single product from the SaaS API by slug.
     * Results are cached via WordPress transients.
     *
     * @param string $slug Product slug.
     * @return array|null Product data or null if not found.
     */
    public static function fetch_product_by_slug($slug)
    {
        $api_key = get_option(self::OPTION_API_KEY, "");
        $saas_url = self::get_saas_url();

        if (empty($api_key) || empty($saas_url)) {
            return null;
        }

        $cache_key = "lylrv_product_" . md5($slug . $api_key);
        $cached = get_transient($cache_key);

        if (false !== $cached) {
            return $cached;
        }

        $url =
            $saas_url .
            "/api/widget/products/" .
            urlencode($slug) .
            "?" .
            http_build_query([
                "apiKey" => $api_key,
            ]);

        $response = wp_remote_get($url, [
            "timeout" => 10,
            "headers" => ["Accept" => "application/json"],
        ]);

        if (is_wp_error($response)) {
            error_log(
                "Lylrv Connect: Product by slug fetch failed - " .
                    $response->get_error_message(),
            );
            return null;
        }

        $code = wp_remote_retrieve_response_code($response);
        if (200 !== $code) {
            $body = wp_remote_retrieve_body($response);
            error_log(
                "Lylrv Connect: Product by slug HTTP $code - URL: $url - Body: $body",
            );
            return null;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!isset($data["product"])) {
            return null;
        }

        set_transient($cache_key, $data["product"], self::PRODUCT_CACHE_TTL);

        return $data["product"];
    }

    /**
     * Fetch products list from the SaaS API.
     *
     * @param array $args Optional. Query arguments (status, category, limit, offset).
     * @return array Array of products.
     */
    public static function fetch_products($args = [])
    {
        $api_key = get_option(self::OPTION_API_KEY, "");
        $saas_url = self::get_saas_url();

        if (empty($api_key) || empty($saas_url)) {
            return [];
        }

        $defaults = [
            "status" => "active",
            "limit" => 50,
            "offset" => 0,
        ];
        $args = wp_parse_args($args, $defaults);

        $cache_key = "lylrv_products_" . md5(wp_json_encode($args) . $api_key);
        $cached = get_transient($cache_key);

        if (false !== $cached) {
            return $cached;
        }

        $query_params = array_merge($args, ["apiKey" => $api_key]);
        $url =
            $saas_url .
            "/api/widget/products?" .
            http_build_query($query_params);

        $response = wp_remote_get($url, [
            "timeout" => 10,
            "headers" => ["Accept" => "application/json"],
        ]);

        if (is_wp_error($response)) {
            error_log(
                "Lylrv Connect: Product fetch failed - " .
                    $response->get_error_message(),
            );
            return [];
        }

        $code = wp_remote_retrieve_response_code($response);
        if (200 !== $code) {
            $body = wp_remote_retrieve_body($response);
            error_log(
                "Lylrv Connect: Product fetch HTTP $code - URL: $url - Body: $body",
            );
            return [];
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (!isset($data["products"]) || !is_array($data["products"])) {
            error_log(
                "Lylrv Connect: Unexpected product response structure - Body: $body",
            );
            return [];
        }

        set_transient($cache_key, $data["products"], self::PRODUCT_CACHE_TTL);

        return $data["products"];
    }

    /**
     * Register Gutenberg blocks for product display.
     */
    public static function register_product_blocks()
    {
        // Only register if Gutenberg is available.
        if (!function_exists("register_block_type")) {
            return;
        }

        // Manually register the editor script with WP dependencies.
        // We are NOT using @wordpress/scripts, so there is no .asset.php sidecar.
        wp_register_script(
            "lylrv-product-display-editor",
            LYLRV_CONNECT_PLUGIN_URL . "blocks/product-display/index.js",
            [
                "wp-blocks",
                "wp-element",
                "wp-block-editor",
                "wp-components",
                "wp-api-fetch",
            ],
            LYLRV_CONNECT_VERSION,
            true,
        );

        register_block_type(
            LYLRV_CONNECT_PLUGIN_DIR . "blocks/product-display/block.json",
            [
                "editor_script" => "lylrv-product-display-editor",
                "render_callback" => [
                    __CLASS__,
                    "render_product_display_block",
                ],
            ],
        );
    }

    /**
     * Server-side render callback for the product-display block.
     *
     * @param array  $attributes Block attributes.
     * @param string $content    Block inner content.
     * @return string Rendered HTML.
     */
    public static function render_product_display_block($attributes, $content)
    {
        $slug = isset($attributes["productSlug"])
            ? sanitize_title($attributes["productSlug"])
            : "";
        $layout = isset($attributes["layout"])
            ? sanitize_text_field($attributes["layout"])
            : "card";
        $show_price = isset($attributes["showPrice"])
            ? (bool) $attributes["showPrice"]
            : true;
        $show_description = isset($attributes["showDescription"])
            ? (bool) $attributes["showDescription"]
            : true;
        $show_image = isset($attributes["showImage"])
            ? (bool) $attributes["showImage"]
            : true;

        if (empty($slug)) {
            // In editor, show placeholder.
            if (defined("REST_REQUEST") && REST_REQUEST) {
                return '<div class="lylrv-product-display lylrv-product-display--empty">' .
                    "<p>" .
                    esc_html__(
                        "Select a product to display.",
                        "lylrv-connect",
                    ) .
                    "</p>" .
                    "</div>";
            }
            return "";
        }

        $product = self::fetch_product_by_slug($slug);

        if (!$product) {
            return "";
        }

        return self::render_product_html(
            $product,
            $layout,
            $show_price,
            $show_description,
            $show_image,
        );
    }

    /**
     * Render a product as HTML.
     *
     * @param array  $product          Product data from SaaS API.
     * @param string $layout           Layout style: "card", "inline", or "full".
     * @param bool   $show_price       Whether to display the price.
     * @param bool   $show_description Whether to display the description.
     * @param bool   $show_image       Whether to display the product image.
     * @return string HTML output.
     */
    private static function render_product_html(
        $product,
        $layout,
        $show_price,
        $show_description,
        $show_image,
    ) {
        $name = esc_html($product["name"] ?? "");
        $slug = esc_attr($product["slug"] ?? "");
        $description =
            $product["shortDescription"] ?? ($product["description"] ?? "");
        $price = $product["price"] ?? null;
        $compare_price = $product["comparePrice"] ?? null;
        $currency = $product["currency"] ?? "USD";
        $images = $product["images"] ?? [];
        $product_url = self::get_storefront_product_url($slug);

        $css_class =
            "lylrv-product-display lylrv-product-display--" . esc_attr($layout);

        ob_start();
        ?>
        <div class="<?php echo esc_attr($css_class); ?>">
            <?php if ($show_image && !empty($images)): ?>
                <div class="lylrv-product-display__image">
                    <a href="<?php echo esc_url($product_url); ?>">
                        <img
                            src="<?php echo esc_url(
                                $images[0]["url"] ?? "",
                            ); ?>"
                            alt="<?php echo esc_attr(
                                $images[0]["alt"] ?? $name,
                            ); ?>"
                            loading="lazy"
                        />
                    </a>
                </div>
            <?php endif; ?>

            <div class="lylrv-product-display__content">
                <h3 class="lylrv-product-display__title">
                    <a href="<?php echo esc_url($product_url); ?>">
                        <?php echo $name; ?>
                    </a>
                </h3>

                <?php if ($show_price && $price !== null): ?>
                    <div class="lylrv-product-display__price">
                        <?php if (
                            $compare_price !== null &&
                            (float) $compare_price > (float) $price
                        ): ?>
                            <span class="lylrv-product-display__compare-price">
                                <?php echo esc_html(
                                    self::format_product_price(
                                        $compare_price,
                                        $currency,
                                    ),
                                ); ?>
                            </span>
                        <?php endif; ?>
                        <span class="lylrv-product-display__current-price">
                            <?php echo esc_html(
                                self::format_product_price($price, $currency),
                            ); ?>
                        </span>
                    </div>
                <?php endif; ?>

                <?php if ($show_description && !empty($description)): ?>
                    <div class="lylrv-product-display__description">
                        <?php echo wp_kses_post($description); ?>
                    </div>
                <?php endif; ?>
            </div>
        </div>
        <?php return ob_get_clean();
    }

    /**
     * Format a price with currency symbol.
     *
     * @param string $price    The price value.
     * @param string $currency The 3-letter currency code.
     * @return string Formatted price.
     */
    public static function format_product_price($price, $currency)
    {
        $symbols = [
            "USD" => "$",
            "EUR" => "\u{20AC}",
            "GBP" => "\u{00A3}",
            "ILS" => "\u{20AA}",
            "JPY" => "\u{00A5}",
            "CAD" => "CA$",
            "AUD" => "A$",
        ];

        $symbol = isset($symbols[$currency])
            ? $symbols[$currency]
            : $currency . " ";

        return $symbol . number_format((float) $price, 2);
    }

    /**
     * Register REST API routes for the block editor product selector.
     */
    public static function register_product_rest_routes()
    {
        register_rest_route("lylrv-connect/v1", "/products", [
            "methods" => "GET",
            "callback" => [__CLASS__, "rest_get_products"],
            "permission_callback" => function () {
                return current_user_can("edit_posts");
            },
            "args" => [
                "search" => [
                    "type" => "string",
                    "sanitize_callback" => "sanitize_text_field",
                ],
            ],
        ]);
    }

    /**
     * REST API callback: List products for the block editor selector.
     *
     * @param WP_REST_Request $request REST request.
     * @return WP_REST_Response
     */
    public static function rest_get_products($request)
    {
        $api_key = get_option(self::OPTION_API_KEY, "");
        $saas_url = self::get_saas_url();

        if (empty($api_key) || empty($saas_url)) {
            return rest_ensure_response([
                "products" => [],
                "error" =>
                    "Plugin not configured. Please set the API key and SaaS URL in Lylrv Connect settings.",
            ]);
        }

        $products = self::fetch_products(["limit" => 100]);
        $search = $request->get_param("search");

        if (!empty($search)) {
            $search_lower = strtolower($search);
            $products = array_filter($products, function ($product) use (
                $search_lower,
            ) {
                $name = strtolower($product["name"] ?? "");
                $slug = strtolower($product["slug"] ?? "");
                return false !== strpos($name, $search_lower) ||
                    false !== strpos($slug, $search_lower);
            });
            $products = array_values($products);
        }

        return rest_ensure_response([
            "products" => $products,
        ]);
    }
}
