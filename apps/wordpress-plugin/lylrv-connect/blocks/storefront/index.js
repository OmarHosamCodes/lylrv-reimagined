(function (blocks, element, blockEditor, components) {
  var el = element.createElement;
  var InnerBlocks = blockEditor.InnerBlocks;
  var useBlockProps = blockEditor.useBlockProps;
  var Placeholder = components.Placeholder;

  var PRODUCT_CHILDREN = [
    "lylrv-connect/store-product-gallery",
    "lylrv-connect/store-product-title",
    "lylrv-connect/store-product-price",
    "lylrv-connect/store-product-description",
    "lylrv-connect/store-product-meta",
    "lylrv-connect/store-product-quantity",
    "lylrv-connect/store-add-to-cart",
  ];

  blocks.registerBlockType("lylrv-connect/store-product", {
    edit: function () {
      var blockProps = useBlockProps({
        className: "lylrv-store-product-editor",
      });

      return el(
        "div",
        blockProps,
        el(
          "div",
          { className: "components-placeholder" },
          el("strong", null, "Lylrv Store Product"),
          el(
            "p",
            null,
            "This block renders the active storefront product route. Arrange the child blocks below to control the product layout.",
          ),
        ),
        el(InnerBlocks, {
          allowedBlocks: PRODUCT_CHILDREN,
          template: [
            ["lylrv-connect/store-product-gallery"],
            ["lylrv-connect/store-product-title"],
            ["lylrv-connect/store-product-price"],
            ["lylrv-connect/store-product-description"],
            ["lylrv-connect/store-product-meta"],
            ["lylrv-connect/store-product-quantity"],
            ["lylrv-connect/store-add-to-cart"],
          ],
        }),
      );
    },
    save: function () {
      return el(InnerBlocks.Content);
    },
  });

  function registerDynamicChild(name, title, description) {
    blocks.registerBlockType(name, {
      edit: function () {
        return el(
          Placeholder,
          {
            label: title,
            instructions: description,
          },
          el(
            "p",
            null,
            "Rendered dynamically from the current storefront context.",
          ),
        );
      },
      save: function () {
        return null;
      },
    });
  }

  registerDynamicChild(
    "lylrv-connect/store-product-title",
    "Product Title",
    "Shows the current storefront product title.",
  );
  registerDynamicChild(
    "lylrv-connect/store-product-gallery",
    "Product Gallery",
    "Shows the current storefront product gallery.",
  );
  registerDynamicChild(
    "lylrv-connect/store-product-price",
    "Product Price",
    "Shows the current storefront product price and compare price.",
  );
  registerDynamicChild(
    "lylrv-connect/store-product-description",
    "Product Description",
    "Shows the current storefront product description.",
  );
  registerDynamicChild(
    "lylrv-connect/store-product-meta",
    "Product Meta",
    "Shows SKU, category, and tags.",
  );
  registerDynamicChild(
    "lylrv-connect/store-product-quantity",
    "Product Quantity",
    "Displays the quantity input used by the add-to-cart block.",
  );
  registerDynamicChild(
    "lylrv-connect/store-add-to-cart",
    "Add To Cart",
    "Renders the add-to-cart button for the current storefront product.",
  );
  registerDynamicChild(
    "lylrv-connect/store-cart",
    "Store Cart",
    "Renders the SaaS-backed storefront cart.",
  );
  registerDynamicChild(
    "lylrv-connect/store-checkout",
    "Store Checkout",
    "Renders the SaaS-backed storefront checkout form.",
  );
  registerDynamicChild(
    "lylrv-connect/store-thank-you",
    "Store Thank You",
    "Renders the storefront thank-you summary for the current order.",
  );
})(
  window.wp.blocks,
  window.wp.element,
  window.wp.blockEditor,
  window.wp.components,
);
