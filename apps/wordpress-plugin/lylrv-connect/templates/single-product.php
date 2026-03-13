<?php
/**
 * Template: Single SaaS-Managed Product
 *
 * Minimal fallback template used when the active theme does not
 * provide lylrv-product.php or single-lylrv_product.php.
 *
 * Product data is available in $GLOBALS['lylrv_product'].
 *
 * @package Lylrv_Connect
 */

if (!defined("ABSPATH")) {
    exit();
}

$product = isset($GLOBALS["lylrv_product"]) ? $GLOBALS["lylrv_product"] : null;

if (!$product) {
    get_header();
    echo '<div class="lylrv-product-single" style="max-width:800px;margin:40px auto;padding:0 20px;">';
    echo '<p>' . esc_html__("Product not found.", "lylrv-connect") . '</p>';
    echo '</div>';
    get_footer();
    return;
}

$name = esc_html($product["name"] ?? "");
$description = $product["description"] ?? $product["shortDescription"] ?? "";
$price = $product["price"] ?? null;
$compare_price = $product["comparePrice"] ?? null;
$currency = $product["currency"] ?? "USD";
$images = $product["images"] ?? [];
$category = $product["category"] ?? "";
$tags = $product["tags"] ?? [];
$sku = $product["sku"] ?? "";

get_header();
?>

<div class="lylrv-product-single" style="max-width: 1000px; margin: 40px auto; padding: 0 20px;">

    <article class="lylrv-product-single__article" style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start;">

        <?php if (!empty($images)): ?>
        <div class="lylrv-product-single__gallery">
            <img
                src="<?php echo esc_url($images[0]["url"] ?? ""); ?>"
                alt="<?php echo esc_attr($images[0]["alt"] ?? $name); ?>"
                style="width: 100%; height: auto; border-radius: 8px;"
            />
            <?php if (count($images) > 1): ?>
            <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                <?php foreach (array_slice($images, 1) as $img): ?>
                <img
                    src="<?php echo esc_url($img["url"] ?? ""); ?>"
                    alt="<?php echo esc_attr($img["alt"] ?? $name); ?>"
                    style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;"
                />
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <div class="lylrv-product-single__details">
            <h1 style="margin: 0 0 12px; font-size: 28px;"><?php echo $name; ?></h1>

            <?php if ($price !== null): ?>
            <div class="lylrv-product-single__price" style="margin-bottom: 16px; font-size: 22px;">
                <?php if ($compare_price !== null && (float) $compare_price > (float) $price): ?>
                    <span style="text-decoration: line-through; color: #999; margin-right: 8px;">
                        <?php echo esc_html(Lylrv_Connect_Plugin::format_product_price($compare_price, $currency)); ?>
                    </span>
                <?php endif; ?>
                <span style="font-weight: 700; color: #111;">
                    <?php echo esc_html(Lylrv_Connect_Plugin::format_product_price($price, $currency)); ?>
                </span>
            </div>
            <?php endif; ?>

            <?php if (!empty($description)): ?>
            <div class="lylrv-product-single__description" style="line-height: 1.6; color: #444; margin-bottom: 20px;">
                <?php echo wp_kses_post($description); ?>
            </div>
            <?php endif; ?>

            <?php if (!empty($sku)): ?>
            <p style="color: #888; font-size: 13px; margin: 4px 0;">
                <?php echo esc_html__("SKU:", "lylrv-connect"); ?> <?php echo esc_html($sku); ?>
            </p>
            <?php endif; ?>

            <?php if (!empty($category)): ?>
            <p style="color: #888; font-size: 13px; margin: 4px 0;">
                <?php echo esc_html__("Category:", "lylrv-connect"); ?> <?php echo esc_html($category); ?>
            </p>
            <?php endif; ?>

            <?php if (!empty($tags)): ?>
            <div style="margin-top: 12px;">
                <?php foreach ($tags as $tag): ?>
                <span style="display: inline-block; background: #f0f0f0; padding: 2px 10px; border-radius: 12px; font-size: 12px; margin: 2px 4px 2px 0;">
                    <?php echo esc_html($tag); ?>
                </span>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>

    </article>

</div>

<?php
get_footer();
