# Lylrv Native Storefront Compact Spec

## Objective

Ship a SaaS-backed storefront that is rendered with native WordPress Gutenberg blocks in any block-based theme, without touching WooCommerce flows and without using `apps/widgets` for the storefront UI.

## Key Rules

- WordPress renders the UI.
- SaaS stores the data and processes the workflow.
- WooCommerce stays separate.
- The storefront lives under its own route base, default `/store`.

## Routes

- `/store/{slug}`
- `/store/cart`
- `/store/checkout`
- `/store/thank-you/{publicId}`

## WordPress Model

- Merchant assigns one normal WordPress page for each route type.
- Those pages are edited with the block editor.
- The plugin renders the assigned page content inside a storefront shell template.
- If no page is assigned, the plugin renders fallback block layouts.

## Required Blocks

- `store-product`
- `store-product-title`
- `store-product-gallery`
- `store-product-price`
- `store-product-description`
- `store-product-meta`
- `store-product-quantity`
- `store-add-to-cart`
- `store-cart`
- `store-checkout`
- `store-thank-you`

## SaaS APIs

- product read
- cart read
- cart add/update/remove
- checkout submit
- thank-you order lookup

## DB Tables

- `storefront_carts`
- `storefront_cart_items`
- `checkout_sessions`
- `storefront_orders`
- `storefront_order_items`

## First Implementation Slice

- add DB schema
- add SaaS public storefront routes
- add plugin storefront settings
- add plugin rewrite rules and shell template
- add native storefront Gutenberg blocks
- add minimal JS for cart and checkout actions
