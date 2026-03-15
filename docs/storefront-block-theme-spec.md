# Lylrv Native Storefront Spec

## Goal

Build a SaaS-backed storefront that is fully composed with native WordPress blocks inside any block-based theme. The plugin must not extend or override third-party ecommerce product, cart, checkout, or thank-you flows. The storefront introduced here is a separate system.

## Core Principles

- WordPress owns the storefront UI layer.
- SaaS owns product data, cart state, checkout sessions, orders, and business rules.
- The storefront must work in any block theme through standard Gutenberg blocks, pages, and global styles.
- The storefront must remain platform-independent.
- The storefront must be dynamic and server-rendered where possible so themes, SEO, and content rendering behave like native WordPress.

## Scope

The system includes:

- Product page
- Cart page
- Checkout page
- Thank-you page
- Native Gutenberg blocks for each storefront surface
- WordPress route handling and block-theme page assignment
- SaaS public APIs for product, cart, checkout, and order retrieval
- Database tables for native storefront carts and orders

The system excludes:

- Third-party checkout integration
- Third-party order creation
- Widget-based storefront UI from `apps/widgets`
- Payment-provider-specific capture beyond a manual or pending payment mode in the first implementation slice

## High-Level Architecture

### WordPress Plugin

The plugin provides:

- Rewrite rules for storefront routes
- Query vars for product, cart, checkout, and thank-you contexts
- Native dynamic Gutenberg blocks
- Editor scripts for block registration and composition
- Optional assigned WordPress pages for each storefront route
- Fallback block layouts when no page is assigned
- Frontend JavaScript for cart mutations and checkout submission

The plugin does not store catalog, cart, or order truth in WordPress.

### SaaS App

The SaaS app provides:

- Public product read endpoints
- Public cart read and mutation endpoints
- Public checkout submission endpoint
- Public thank-you order lookup endpoint
- Protected admin-side APIs for future native storefront management

### Database

The database stores:

- Products
- Storefront carts
- Storefront cart items
- Checkout sessions
- Storefront orders
- Storefront order items

The existing customer and order sync tables remain separate and unchanged in role.

## Route Model

The storefront uses a dedicated base path, defaulting to `/store`.

Routes:

- `/store/{product-slug}`
- `/store/cart`
- `/store/checkout`
- `/store/thank-you/{order-public-id}`

These routes are intentionally separate from third-party storefront routes and from the existing `/product/{slug}` SaaS product display path.

## WordPress Page Assignment Model

The plugin exposes options for:

- Storefront base slug
- Product page
- Cart page
- Checkout page
- Thank-you page

Each assigned page is a normal WordPress page editable with the block editor. The page content can contain native Lylrv storefront blocks along with any core/theme blocks. This is the mechanism that allows the full storefront UI to be assembled in any block theme.

If no page is assigned for a route, the plugin renders a fallback block layout.

## Block System

### Parent Product Block

`lylrv-connect/store-product`

Purpose:

- Acts as the main product layout container
- Gives merchants one big product block to place on the product page
- Hosts child blocks via `InnerBlocks`

Behavior:

- Reads current product context from the current storefront route
- Renders a wrapper around the configured child blocks
- Allows flexible ordering and composition of product fields

### Product Field Blocks

Each field is a separate block. Initial block set:

- `lylrv-connect/store-product-title`
- `lylrv-connect/store-product-gallery`
- `lylrv-connect/store-product-price`
- `lylrv-connect/store-product-description`
- `lylrv-connect/store-product-meta`
- `lylrv-connect/store-product-quantity`
- `lylrv-connect/store-add-to-cart`

Future block set:

- ratings
- reviews summary
- product badges
- product options
- custom field renderer
- stock message
- shipping note
- related products

### Standalone Storefront Blocks

- `lylrv-connect/store-cart`
- `lylrv-connect/store-checkout`
- `lylrv-connect/store-thank-you`

These blocks are placed on their assigned pages and render based on the current storefront route and cart/order context.

## Data Flow

### Product Page

1. Request hits `/store/{slug}`.
2. Plugin resolves product page assignment.
3. Plugin renders that page through a storefront shell template.
4. Product blocks fetch the current SaaS product by slug.
5. Add-to-cart posts to the SaaS cart API.
6. Cart token is persisted in a WordPress-side cookie.

### Cart Page

1. Request hits `/store/cart`.
2. Plugin resolves cart page assignment.
3. Cart block reads cart token from cookie.
4. Cart block fetches SaaS cart state.
5. Quantity changes and removal send mutations to SaaS.
6. Checkout CTA links to `/store/checkout`.

### Checkout Page

1. Request hits `/store/checkout`.
2. Checkout block fetches the active cart by token.
3. Customer submits checkout form.
4. Plugin frontend sends form payload to SaaS checkout endpoint.
5. SaaS creates checkout session and storefront order.
6. Browser redirects to `/store/thank-you/{publicId}`.

### Thank-You Page

1. Request hits `/store/thank-you/{publicId}`.
2. Thank-you block looks up the storefront order from SaaS.
3. Thank-you page renders summary, customer details, and line items.

## Database Model

### `storefront_carts`

Fields:

- `id`
- `client_id`
- `token`
- `status`
- `currency`
- `email`
- `metadata`
- `expires_at`
- `created_at`
- `updated_at`

Statuses:

- `active`
- `converted`
- `abandoned`

### `storefront_cart_items`

Fields:

- `id`
- `cart_id`
- `product_id`
- `name`
- `slug`
- `sku`
- `image_url`
- `unit_price`
- `quantity`
- `currency`
- `snapshot`
- `created_at`
- `updated_at`

This table stores product snapshots so orders remain stable if products change later.

### `checkout_sessions`

Fields:

- `id`
- `client_id`
- `cart_id`
- `token`
- `status`
- `email`
- `name`
- `phone`
- `billing`
- `shipping`
- `metadata`
- `expires_at`
- `created_at`
- `updated_at`

Statuses:

- `open`
- `submitted`
- `expired`

### `storefront_orders`

Fields:

- `id`
- `client_id`
- `checkout_session_id`
- `cart_id`
- `public_id`
- `email`
- `name`
- `phone`
- `status`
- `currency`
- `subtotal`
- `total`
- `billing`
- `shipping`
- `metadata`
- `created_at`
- `updated_at`

Statuses:

- `pending`
- `submitted`
- `paid`
- `fulfilled`
- `cancelled`

### `storefront_order_items`

Fields:

- `id`
- `order_id`
- `product_id`
- `name`
- `slug`
- `sku`
- `image_url`
- `unit_price`
- `quantity`
- `line_total`
- `snapshot`
- `created_at`

## API Surface

### Public SaaS Endpoints

`GET /api/storefront/products/{slug}?apiKey=...`

- Returns visible active product data for storefront rendering

`GET /api/storefront/cart?apiKey=...&cartToken=...`

- Returns current cart and totals

`POST /api/storefront/cart`

- Adds a product to cart
- Creates a cart automatically if one does not exist

`PATCH /api/storefront/cart`

- Updates a cart item quantity
- Quantity `0` removes the item

`POST /api/storefront/checkout`

- Converts cart into a storefront order
- Creates checkout session and order item snapshots

`GET /api/storefront/orders/{publicId}?apiKey=...`

- Returns order summary for thank-you page rendering

### Protected API

A future protected `storefrontRouter` in `packages/api` will power admin-side native storefront management, order browsing, and analytics.

## Block Rendering Rules

- Product field blocks render only in product route context.
- Cart block renders only in cart route context.
- Checkout block renders only in checkout route context.
- Thank-you block renders only in thank-you route context.
- When blocks are placed in the wrong context, they render editor-safe placeholders instead of fatal output.

## Theme Compatibility Rules

- All storefront UI must be composed from Gutenberg blocks.
- Theme styling should come from normal block markup and CSS classes, not iframe/widget isolation.
- The plugin should use semantic wrappers and minimal opinionated styles.
- Merchants must be able to mix core blocks like columns, group, buttons, headings, spacer, image, paragraph, and template parts around Lylrv blocks.

## WordPress Template Strategy

The plugin uses a storefront shell template that:

- Loads the normal site header/footer
- Resolves the assigned page for the current storefront route
- Runs that page content through `the_content`
- Lets Gutenberg blocks render as if the page were opened directly

This avoids forcing theme authors to add PHP templates while preserving block-theme editing.

## Frontend Behavior

Minimal plugin JavaScript is allowed for:

- add to cart
- cart quantity updates
- remove item
- checkout submission
- thank-you redirect handling

The JavaScript must not mount a parallel app shell. It only enhances native block markup.

## Error States

### Product Not Found

- Route becomes 404
- Theme header/footer remain intact

### Empty Cart

- Cart block shows empty state and link back to storefront

### Invalid Thank-You Order

- Route renders error state and may become 404

### SaaS Misconfiguration

- Blocks render a clear configuration message to administrators
- Public users see a safe fallback message

## Security

- All plugin output is escaped late
- All settings are sanitized at save time
- Only public SaaS endpoints use API key auth
- Cart token is opaque and random
- Customer-submitted checkout fields are sanitized server-side in SaaS

## Initial Implementation Slice

The first code slice should implement:

- DB tables for carts, cart items, checkout sessions, storefront orders, storefront order items
- Public SaaS endpoints for product, cart, checkout, and order lookup
- Plugin rewrite rules and storefront shell template
- Plugin settings for storefront base and assigned pages
- Gutenberg blocks:
  - store-product
  - store-product-title
  - store-product-gallery
  - store-product-price
  - store-product-description
  - store-product-meta
  - store-product-quantity
  - store-add-to-cart
  - store-cart
  - store-checkout
  - store-thank-you
- Minimal frontend enhancement script

The first slice does not need:

- payment gateway capture
- advanced product option matrices
- admin-side visual builder for checkout field schema
- native storefront analytics dashboard

## Future Phases

### Phase 2

- product options and variant selection
- discount code support
- shipping methods
- tax calculation
- better thank-you content blocks

### Phase 3

- payment provider integration
- order status management UI in admin app
- storefront analytics
- conversion and abandonment tracking
