<?php
/**
 * Native Gutenberg storefront module.
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

trait Lylrv_Connect_Storefront
{
    private static $storefront_product_cache = null;
    private static $storefront_order_cache = null;

    public static function init_storefront()
    {
        add_action("init", [__CLASS__, "register_storefront_rewrites"], 16);
        add_action("init", [__CLASS__, "register_storefront_blocks"], 26);
        add_filter("query_vars", [__CLASS__, "register_storefront_query_vars"]);
        add_filter("template_include", [__CLASS__, "maybe_include_storefront_template"], 30);
        add_action("wp_enqueue_scripts", [__CLASS__, "enqueue_storefront_assets"]);
    }

    public static function register_storefront_query_vars($vars)
    {
        $vars[] = "lylrv_storefront_route";
        $vars[] = "lylrv_storefront_product_slug";
        $vars[] = "lylrv_storefront_order";

        return $vars;
    }

    public static function register_storefront_rewrites()
    {
        $base = self::get_storefront_base();

        add_rewrite_rule(
            "^" . preg_quote($base, "/") . "/cart/?$",
            "index.php?lylrv_storefront_route=cart",
            "top",
        );
        add_rewrite_rule(
            "^" . preg_quote($base, "/") . "/checkout/?$",
            "index.php?lylrv_storefront_route=checkout",
            "top",
        );
        add_rewrite_rule(
            "^" . preg_quote($base, "/") . "/thank-you/([^/]+)/?$",
            "index.php?lylrv_storefront_route=thank-you&lylrv_storefront_order=\$matches[1]",
            "top",
        );
        add_rewrite_rule(
            "^" . preg_quote($base, "/") . "/([^/]+)/?$",
            "index.php?lylrv_storefront_route=product&lylrv_storefront_product_slug=\$matches[1]",
            "top",
        );
    }

    public static function maybe_include_storefront_template($template)
    {
        if (!self::is_storefront_request()) {
            return $template;
        }

        if ("product" === self::get_storefront_route() && !self::get_current_storefront_product()) {
            global $wp_query;
            if ($wp_query) {
                $wp_query->set_404();
            }
            status_header(404);
        }

        if ("thank-you" === self::get_storefront_route() && !self::get_current_storefront_order()) {
            global $wp_query;
            if ($wp_query) {
                $wp_query->set_404();
            }
            status_header(404);
        }

        $template_path = LYLRV_CONNECT_PLUGIN_DIR . "templates/storefront-shell.php";
        return file_exists($template_path) ? $template_path : $template;
    }

    public static function enqueue_storefront_assets()
    {
        if (!self::is_storefront_request()) {
            return;
        }

        wp_register_script(
            "lylrv-storefront-frontend",
            LYLRV_CONNECT_PLUGIN_URL . "assets/storefront.js",
            [],
            LYLRV_CONNECT_VERSION,
            true,
        );

        wp_localize_script("lylrv-storefront-frontend", "lylrvStorefront", [
            "apiBase" => self::get_saas_url() . "/api/storefront",
            "apiKey" => (string) get_option(self::OPTION_API_KEY, ""),
            "cartToken" => self::get_storefront_cart_token(),
            "cartCookie" => self::COOKIE_STOREFRONT_CART,
            "routes" => [
                "cart" => self::get_storefront_path("cart"),
                "checkout" => self::get_storefront_path("checkout"),
                "thankYouBase" => untrailingslashit(
                    self::get_storefront_path("thank-you"),
                ),
            ],
            "labels" => [
                "adding" => __("Adding...", "lylrv-connect"),
                "added" => __("Added", "lylrv-connect"),
                "error" => __("Something went wrong. Please try again.", "lylrv-connect"),
                "checkoutError" => __("Checkout failed. Please review your details and try again.", "lylrv-connect"),
            ],
        ]);
        wp_enqueue_script("lylrv-storefront-frontend");

        wp_register_style(
            "lylrv-storefront-style",
            false,
            [],
            LYLRV_CONNECT_VERSION,
        );
        wp_enqueue_style("lylrv-storefront-style");
        wp_add_inline_style(
            "lylrv-storefront-style",
            self::get_storefront_css(),
        );
    }

    public static function register_storefront_blocks()
    {
        if (!function_exists("register_block_type")) {
            return;
        }

        wp_register_script(
            "lylrv-storefront-editor",
            LYLRV_CONNECT_PLUGIN_URL . "blocks/storefront/index.js",
            ["wp-blocks", "wp-element", "wp-block-editor", "wp-components"],
            LYLRV_CONNECT_VERSION,
            true,
        );

        $blocks = [
            "store-product" => "render_store_product_block",
            "store-product-title" => "render_store_product_title_block",
            "store-product-gallery" => "render_store_product_gallery_block",
            "store-product-price" => "render_store_product_price_block",
            "store-product-description" => "render_store_product_description_block",
            "store-product-meta" => "render_store_product_meta_block",
            "store-product-quantity" => "render_store_product_quantity_block",
            "store-add-to-cart" => "render_store_add_to_cart_block",
            "store-cart" => "render_store_cart_block",
            "store-checkout" => "render_store_checkout_block",
            "store-thank-you" => "render_store_thank_you_block",
        ];

        foreach ($blocks as $directory => $callback) {
            register_block_type(
                LYLRV_CONNECT_PLUGIN_DIR . "blocks/" . $directory . "/block.json",
                [
                    "editor_script" => "lylrv-storefront-editor",
                    "render_callback" => [__CLASS__, $callback],
                ],
            );
        }
    }

    public static function render_storefront_page()
    {
        $route = self::get_storefront_route();
        $page_id = self::get_storefront_page_id($route);
        $page = $page_id ? get_post($page_id) : null;

        echo '<main class="lylrv-storefront-page">';

        if ($page instanceof WP_Post && "publish" === $page->post_status) {
            global $post;
            $previous_post = $post;
            $post = $page;
            setup_postdata($page);
            echo apply_filters("the_content", $page->post_content);
            wp_reset_postdata();
            $post = $previous_post;
        } else {
            echo do_blocks(self::get_default_storefront_page_blocks($route));
        }

        echo "</main>";
    }

    public static function render_store_product_block($attributes, $content)
    {
        $product = self::get_current_storefront_product();

        if (!$product) {
            return self::render_storefront_notice(
                __("Product not found.", "lylrv-connect"),
            );
        }

        $slug = esc_attr($product["slug"] ?? "");

        return sprintf(
            '<div class="wp-block-lylrv-connect-store-product lylrv-store-product" data-lylrv-product-root data-product-slug="%1$s">%2$s</div>',
            $slug,
            $content,
        );
    }

    public static function render_store_product_title_block()
    {
        $product = self::get_current_storefront_product();
        if (!$product) {
            return self::render_storefront_notice(
                __("Product title is unavailable outside the product route.", "lylrv-connect"),
            );
        }

        return sprintf(
            '<h1 class="wp-block-lylrv-connect-store-product-title lylrv-store-product-title">%s</h1>',
            esc_html($product["name"] ?? ""),
        );
    }

    public static function render_store_product_gallery_block()
    {
        $product = self::get_current_storefront_product();
        if (!$product) {
            return "";
        }

        $images = isset($product["images"]) && is_array($product["images"])
            ? $product["images"]
            : [];

        if (empty($images)) {
            return "";
        }

        ob_start();
        ?>
        <div class="wp-block-lylrv-connect-store-product-gallery lylrv-store-product-gallery">
            <div class="lylrv-store-product-gallery__primary">
                <img
                    src="<?php echo esc_url($images[0]["url"] ?? ""); ?>"
                    alt="<?php echo esc_attr($images[0]["alt"] ?? ($product["name"] ?? "")); ?>"
                    loading="lazy"
                />
            </div>
            <?php if (count($images) > 1): ?>
                <div class="lylrv-store-product-gallery__grid">
                    <?php foreach (array_slice($images, 1, 4) as $image): ?>
                        <img
                            src="<?php echo esc_url($image["url"] ?? ""); ?>"
                            alt="<?php echo esc_attr($image["alt"] ?? ($product["name"] ?? "")); ?>"
                            loading="lazy"
                        />
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_store_product_price_block()
    {
        $product = self::get_current_storefront_product();
        if (!$product || !isset($product["price"])) {
            return "";
        }

        $price = $product["price"];
        $compare_price = $product["comparePrice"] ?? null;
        $currency = $product["currency"] ?? "USD";

        ob_start();
        ?>
        <div class="wp-block-lylrv-connect-store-product-price lylrv-store-product-price">
            <?php if ($compare_price !== null && (float) $compare_price > (float) $price): ?>
                <span class="lylrv-store-product-price__compare">
                    <?php echo esc_html(self::format_product_price($compare_price, $currency)); ?>
                </span>
            <?php endif; ?>
            <span class="lylrv-store-product-price__current">
                <?php echo esc_html(self::format_product_price($price, $currency)); ?>
            </span>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_store_product_description_block()
    {
        $product = self::get_current_storefront_product();
        if (!$product) {
            return "";
        }

        $description = $product["description"] ?? $product["shortDescription"] ?? "";
        if (empty($description)) {
            return "";
        }

        return sprintf(
            '<div class="wp-block-lylrv-connect-store-product-description lylrv-store-product-description">%s</div>',
            wp_kses_post($description),
        );
    }

    public static function render_store_product_meta_block()
    {
        $product = self::get_current_storefront_product();
        if (!$product) {
            return "";
        }

        $sku = $product["sku"] ?? "";
        $category = $product["category"] ?? "";
        $tags = isset($product["tags"]) && is_array($product["tags"]) ? $product["tags"] : [];

        ob_start();
        ?>
        <div class="wp-block-lylrv-connect-store-product-meta lylrv-store-product-meta">
            <?php if (!empty($sku)): ?>
                <p><strong><?php echo esc_html__("SKU", "lylrv-connect"); ?>:</strong> <?php echo esc_html($sku); ?></p>
            <?php endif; ?>
            <?php if (!empty($category)): ?>
                <p><strong><?php echo esc_html__("Category", "lylrv-connect"); ?>:</strong> <?php echo esc_html($category); ?></p>
            <?php endif; ?>
            <?php if (!empty($tags)): ?>
                <div class="lylrv-store-product-meta__tags">
                    <?php foreach ($tags as $tag): ?>
                        <span><?php echo esc_html($tag); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_store_product_quantity_block()
    {
        if (!self::get_current_storefront_product()) {
            return "";
        }

        return '<div class="wp-block-lylrv-connect-store-product-quantity lylrv-store-product-quantity"><label>' .
            esc_html__("Quantity", "lylrv-connect") .
            '</label><input type="number" min="1" step="1" value="1" data-lylrv-quantity-input /></div>';
    }

    public static function render_store_add_to_cart_block()
    {
        $product = self::get_current_storefront_product();
        if (!$product) {
            return "";
        }

        return sprintf(
            '<div class="wp-block-lylrv-connect-store-add-to-cart lylrv-store-add-to-cart"><button type="button" class="wp-element-button" data-lylrv-add-to-cart data-product-slug="%s">%s</button><p class="lylrv-storefront-feedback" data-lylrv-feedback hidden></p></div>',
            esc_attr($product["slug"] ?? ""),
            esc_html__("Add to cart", "lylrv-connect"),
        );
    }

    public static function render_store_cart_block()
    {
        $cart = self::get_current_storefront_cart();

        if (!$cart || empty($cart["items"])) {
            return self::render_storefront_notice(
                __("Your cart is empty.", "lylrv-connect"),
                sprintf(
                    '<p><a href="%s">%s</a></p>',
                    esc_url(self::get_storefront_path("")),
                    esc_html__("Browse the storefront", "lylrv-connect"),
                ),
            );
        }

        ob_start();
        ?>
        <div class="wp-block-lylrv-connect-store-cart lylrv-store-cart">
            <div class="lylrv-store-cart__items">
                <?php foreach ($cart["items"] as $item): ?>
                    <article class="lylrv-store-cart__item" data-lylrv-cart-item="<?php echo esc_attr($item["id"]); ?>">
                        <div class="lylrv-store-cart__item-media">
                            <?php if (!empty($item["imageUrl"])): ?>
                                <img src="<?php echo esc_url($item["imageUrl"]); ?>" alt="<?php echo esc_attr($item["name"]); ?>" loading="lazy" />
                            <?php endif; ?>
                        </div>
                        <div class="lylrv-store-cart__item-content">
                            <h3><?php echo esc_html($item["name"]); ?></h3>
                            <p><?php echo esc_html($item["currency"] . " " . $item["unitPrice"]); ?></p>
                            <div class="lylrv-store-cart__actions">
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value="<?php echo esc_attr((string) $item["quantity"]); ?>"
                                    data-lylrv-cart-quantity
                                />
                                <button type="button" class="wp-element-button is-secondary" data-lylrv-update-cart data-item-id="<?php echo esc_attr($item["id"]); ?>">
                                    <?php echo esc_html__("Update", "lylrv-connect"); ?>
                                </button>
                                <button type="button" class="wp-element-button is-link" data-lylrv-remove-cart data-item-id="<?php echo esc_attr($item["id"]); ?>">
                                    <?php echo esc_html__("Remove", "lylrv-connect"); ?>
                                </button>
                            </div>
                        </div>
                        <div class="lylrv-store-cart__item-total">
                            <?php echo esc_html($item["currency"] . " " . $item["lineTotal"]); ?>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>

            <aside class="lylrv-store-cart__summary">
                <h3><?php echo esc_html__("Order summary", "lylrv-connect"); ?></h3>
                <p><strong><?php echo esc_html__("Items", "lylrv-connect"); ?>:</strong> <?php echo esc_html((string) $cart["totals"]["quantity"]); ?></p>
                <p><strong><?php echo esc_html__("Subtotal", "lylrv-connect"); ?>:</strong> <?php echo esc_html($cart["currency"] . " " . $cart["totals"]["subtotal"]); ?></p>
                <a class="wp-element-button" href="<?php echo esc_url(self::get_storefront_path("checkout")); ?>">
                    <?php echo esc_html__("Continue to checkout", "lylrv-connect"); ?>
                </a>
            </aside>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_store_checkout_block()
    {
        $cart = self::get_current_storefront_cart();

        if (!$cart || empty($cart["items"])) {
            return self::render_storefront_notice(
                __("Your cart is empty.", "lylrv-connect"),
                sprintf(
                    '<p><a href="%s">%s</a></p>',
                    esc_url(self::get_storefront_path("cart")),
                    esc_html__("Return to cart", "lylrv-connect"),
                ),
            );
        }

        ob_start();
        ?>
        <div class="wp-block-lylrv-connect-store-checkout lylrv-store-checkout">
            <form class="lylrv-store-checkout__form" data-lylrv-checkout-form>
                <div class="lylrv-store-checkout__fields">
                    <label>
                        <span><?php echo esc_html__("Email", "lylrv-connect"); ?></span>
                        <input type="email" name="email" required />
                    </label>
                    <label>
                        <span><?php echo esc_html__("Full name", "lylrv-connect"); ?></span>
                        <input type="text" name="name" required />
                    </label>
                    <label>
                        <span><?php echo esc_html__("Phone", "lylrv-connect"); ?></span>
                        <input type="text" name="phone" />
                    </label>
                    <label>
                        <span><?php echo esc_html__("Address line 1", "lylrv-connect"); ?></span>
                        <input type="text" name="billing_address_1" />
                    </label>
                    <label>
                        <span><?php echo esc_html__("City", "lylrv-connect"); ?></span>
                        <input type="text" name="billing_city" />
                    </label>
                    <label>
                        <span><?php echo esc_html__("Country", "lylrv-connect"); ?></span>
                        <input type="text" name="billing_country" />
                    </label>
                </div>
                <div class="lylrv-store-checkout__summary">
                    <h3><?php echo esc_html__("Summary", "lylrv-connect"); ?></h3>
                    <ul>
                        <?php foreach ($cart["items"] as $item): ?>
                            <li>
                                <span><?php echo esc_html($item["name"] . " x" . $item["quantity"]); ?></span>
                                <strong><?php echo esc_html($item["currency"] . " " . $item["lineTotal"]); ?></strong>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <p><strong><?php echo esc_html__("Total", "lylrv-connect"); ?>:</strong> <?php echo esc_html($cart["currency"] . " " . $cart["totals"]["total"]); ?></p>
                    <button type="submit" class="wp-element-button"><?php echo esc_html__("Place order", "lylrv-connect"); ?></button>
                    <p class="lylrv-storefront-feedback" data-lylrv-feedback hidden></p>
                </div>
            </form>
        </div>
        <?php
        return ob_get_clean();
    }

    public static function render_store_thank_you_block()
    {
        $order = self::get_current_storefront_order();

        if (!$order) {
            return self::render_storefront_notice(
                __("Order not found.", "lylrv-connect"),
            );
        }

        ob_start();
        ?>
        <div class="wp-block-lylrv-connect-store-thank-you lylrv-store-thank-you">
            <div class="lylrv-store-thank-you__header">
                <p class="lylrv-store-thank-you__eyebrow"><?php echo esc_html__("Thank you", "lylrv-connect"); ?></p>
                <h1><?php echo esc_html(sprintf(__("Order %s confirmed", "lylrv-connect"), $order["publicId"])); ?></h1>
                <p><?php echo esc_html__("Your storefront order was submitted successfully.", "lylrv-connect"); ?></p>
            </div>

            <div class="lylrv-store-thank-you__grid">
                <section>
                    <h3><?php echo esc_html__("Items", "lylrv-connect"); ?></h3>
                    <ul class="lylrv-store-thank-you__items">
                        <?php foreach ($order["items"] as $item): ?>
                            <li>
                                <span><?php echo esc_html($item["name"] . " x" . $item["quantity"]); ?></span>
                                <strong><?php echo esc_html($order["currency"] . " " . $item["lineTotal"]); ?></strong>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                </section>

                <section>
                    <h3><?php echo esc_html__("Order details", "lylrv-connect"); ?></h3>
                    <p><strong><?php echo esc_html__("Status", "lylrv-connect"); ?>:</strong> <?php echo esc_html($order["status"]); ?></p>
                    <p><strong><?php echo esc_html__("Email", "lylrv-connect"); ?>:</strong> <?php echo esc_html($order["email"] ?? ""); ?></p>
                    <p><strong><?php echo esc_html__("Total", "lylrv-connect"); ?>:</strong> <?php echo esc_html($order["currency"] . " " . $order["total"]); ?></p>
                </section>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    private static function get_storefront_route()
    {
        return (string) get_query_var("lylrv_storefront_route", "");
    }

    private static function is_storefront_request()
    {
        return "" !== self::get_storefront_route();
    }

    private static function get_current_storefront_product()
    {
        if (null !== self::$storefront_product_cache) {
            return self::$storefront_product_cache;
        }

        $slug = sanitize_title(
            (string) get_query_var("lylrv_storefront_product_slug", ""),
        );

        if (empty($slug)) {
            self::$storefront_product_cache = false;
            return false;
        }

        self::$storefront_product_cache = self::fetch_product_by_slug($slug);
        return self::$storefront_product_cache;
    }

    private static function get_current_storefront_cart()
    {
        $token = self::get_storefront_cart_token();
        if (empty($token)) {
            return null;
        }

        return self::fetch_storefront_cart_by_token($token);
    }

    private static function get_current_storefront_order()
    {
        if (null !== self::$storefront_order_cache) {
            return self::$storefront_order_cache;
        }

        $public_id = sanitize_text_field(
            (string) get_query_var("lylrv_storefront_order", ""),
        );

        if (empty($public_id)) {
            self::$storefront_order_cache = false;
            return false;
        }

        self::$storefront_order_cache = self::fetch_storefront_order_by_public_id($public_id);
        return self::$storefront_order_cache;
    }

    private static function get_storefront_cart_token()
    {
        if (!isset($_COOKIE[self::COOKIE_STOREFRONT_CART])) {
            return "";
        }

        return sanitize_text_field(
            wp_unslash($_COOKIE[self::COOKIE_STOREFRONT_CART]),
        );
    }

    private static function fetch_storefront_cart_by_token($token)
    {
        $data = self::request_storefront_api(
            "GET",
            "/cart?apiKey=" . rawurlencode((string) get_option(self::OPTION_API_KEY, "")) . "&cartToken=" . rawurlencode($token),
        );

        return isset($data["cart"]) && is_array($data["cart"]) ? $data["cart"] : null;
    }

    private static function fetch_storefront_order_by_public_id($public_id)
    {
        $data = self::request_storefront_api(
            "GET",
            "/orders/" . rawurlencode($public_id) . "?apiKey=" . rawurlencode((string) get_option(self::OPTION_API_KEY, "")),
        );

        return isset($data["order"]) && is_array($data["order"]) ? $data["order"] : null;
    }

    private static function request_storefront_api($method, $path, $body = null)
    {
        $url = self::get_saas_url() . "/api/storefront" . $path;

        $args = [
            "method" => $method,
            "timeout" => 15,
            "headers" => [
                "Accept" => "application/json",
            ],
        ];

        if (null !== $body) {
            $args["headers"]["Content-Type"] = "application/json";
            $args["body"] = wp_json_encode($body);
        }

        $response = wp_remote_request($url, $args);
        if (is_wp_error($response)) {
            return null;
        }

        $code = (int) wp_remote_retrieve_response_code($response);
        if ($code < 200 || $code >= 300) {
            return null;
        }

        $decoded = json_decode(wp_remote_retrieve_body($response), true);
        return is_array($decoded) ? $decoded : null;
    }

    private static function get_default_storefront_page_blocks($route)
    {
        if ("product" === $route) {
            return implode("", [
                "<!-- wp:lylrv-connect/store-product -->",
                "<!-- wp:lylrv-connect/store-product-gallery /-->",
                "<!-- wp:lylrv-connect/store-product-title /-->",
                "<!-- wp:lylrv-connect/store-product-price /-->",
                "<!-- wp:lylrv-connect/store-product-description /-->",
                "<!-- wp:lylrv-connect/store-product-meta /-->",
                "<!-- wp:lylrv-connect/store-product-quantity /-->",
                "<!-- wp:lylrv-connect/store-add-to-cart /-->",
                "<!-- /wp:lylrv-connect/store-product -->",
            ]);
        }

        if ("cart" === $route) {
            return "<!-- wp:lylrv-connect/store-cart /-->";
        }

        if ("checkout" === $route) {
            return "<!-- wp:lylrv-connect/store-checkout /-->";
        }

        if ("thank-you" === $route) {
            return "<!-- wp:lylrv-connect/store-thank-you /-->";
        }

        return "";
    }

    private static function render_storefront_notice($message, $extra = "")
    {
        return sprintf(
            '<div class="lylrv-storefront-notice"><p>%1$s</p>%2$s</div>',
            esc_html($message),
            $extra,
        );
    }

    private static function get_storefront_css()
    {
        return '
        .lylrv-storefront-page{max-width:1200px;margin:0 auto;padding:32px 20px}
        .lylrv-storefront-notice{padding:24px;border:1px solid currentColor;border-radius:16px;opacity:.8}
        .lylrv-store-product{display:grid;gap:24px}
        .lylrv-store-product-gallery__primary img{width:100%;height:auto;border-radius:18px;display:block}
        .lylrv-store-product-gallery__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:12px;margin-top:12px}
        .lylrv-store-product-gallery__grid img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:14px}
        .lylrv-store-product-title{margin:0;font-size:clamp(2rem,4vw,3.6rem);line-height:1.05}
        .lylrv-store-product-price{display:flex;gap:12px;align-items:center;font-size:1.25rem}
        .lylrv-store-product-price__compare{text-decoration:line-through;opacity:.55}
        .lylrv-store-product-price__current{font-weight:700}
        .lylrv-store-product-description{line-height:1.7}
        .lylrv-store-product-meta p{margin:.3rem 0}
        .lylrv-store-product-meta__tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
        .lylrv-store-product-meta__tags span{padding:6px 10px;border-radius:999px;background:rgba(0,0,0,.06);font-size:.875rem}
        .lylrv-store-product-quantity{display:flex;flex-direction:column;gap:8px;max-width:160px}
        .lylrv-store-product-quantity input,.lylrv-store-cart input,.lylrv-store-checkout input{width:100%;padding:12px 14px;border:1px solid rgba(0,0,0,.16);border-radius:12px}
        .lylrv-store-add-to-cart,.lylrv-store-checkout__summary{display:flex;flex-direction:column;gap:12px}
        .lylrv-storefront-feedback{margin:0;font-size:.95rem}
        .lylrv-store-cart{display:grid;gap:24px}
        .lylrv-store-cart__item{display:grid;grid-template-columns:96px 1fr auto;gap:16px;align-items:center;padding:18px 0;border-bottom:1px solid rgba(0,0,0,.08)}
        .lylrv-store-cart__item-media img{width:96px;height:96px;object-fit:cover;border-radius:16px}
        .lylrv-store-cart__actions{display:flex;flex-wrap:wrap;gap:10px;align-items:center}
        .lylrv-store-cart__summary{padding:20px;border:1px solid rgba(0,0,0,.08);border-radius:18px;display:flex;flex-direction:column;gap:12px}
        .lylrv-store-checkout__form{display:grid;gap:24px}
        .lylrv-store-checkout__fields{display:grid;gap:14px}
        .lylrv-store-checkout__fields label{display:flex;flex-direction:column;gap:8px}
        .lylrv-store-checkout__summary ul,.lylrv-store-thank-you__items{list-style:none;padding:0;margin:0;display:grid;gap:10px}
        .lylrv-store-checkout__summary li,.lylrv-store-thank-you__items li{display:flex;justify-content:space-between;gap:16px}
        .lylrv-store-thank-you__eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;opacity:.7}
        .lylrv-store-thank-you__grid{display:grid;gap:24px}
        @media (min-width: 768px){
            .lylrv-store-product{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr)}
            .lylrv-store-cart{grid-template-columns:minmax(0,1.35fr) minmax(320px,.65fr)}
            .lylrv-store-checkout__form,.lylrv-store-thank-you__grid{grid-template-columns:minmax(0,1fr) minmax(320px,.8fr)}
        }';
    }
}
