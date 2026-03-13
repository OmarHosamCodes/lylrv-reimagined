(function (blocks, element, blockEditor, components, apiFetch) {
  "use strict";

  var el = element.createElement;
  var Fragment = element.Fragment;
  var InspectorControls = blockEditor.InspectorControls;
  var useBlockProps = blockEditor.useBlockProps;
  var PanelBody = components.PanelBody;
  var SelectControl = components.SelectControl;
  var ToggleControl = components.ToggleControl;
  var Placeholder = components.Placeholder;
  var Spinner = components.Spinner;
  var TextControl = components.TextControl;
  var Button = components.Button;

  blocks.registerBlockType("lylrv-connect/product-display", {
    edit: function (props) {
      var attributes = props.attributes;
      var setAttributes = props.setAttributes;
      var blockProps = useBlockProps();

      var productSlug = attributes.productSlug || "";
      var productName = attributes.productName || "";
      var layout = attributes.layout || "card";
      var showPrice = attributes.showPrice !== false;
      var showDescription = attributes.showDescription !== false;
      var showImage = attributes.showImage !== false;

      // State for product search.
      var useState = element.useState;
      var useEffect = element.useEffect;

      var searchState = useState("");
      var searchTerm = searchState[0];
      var setSearchTerm = searchState[1];

      var productsState = useState([]);
      var products = productsState[0];
      var setProducts = productsState[1];

      var loadingState = useState(false);
      var isLoading = loadingState[0];
      var setIsLoading = loadingState[1];

      var errorState = useState("");
      var errorMsg = errorState[0];
      var setErrorMsg = errorState[1];

      // Fetch products from the plugin REST endpoint using wp.apiFetch.
      useEffect(
        function () {
          setIsLoading(true);
          setErrorMsg("");
          var path = "/lylrv-connect/v1/products";
          if (searchTerm) {
            path += "?search=" + encodeURIComponent(searchTerm);
          }
          apiFetch({ path: path })
            .then(function (data) {
              setProducts(data.products || []);
              setIsLoading(false);
            })
            .catch(function (err) {
              console.error("Lylrv product search error:", err);
              setErrorMsg(
                (err && err.message) || "Failed to load products."
              );
              setProducts([]);
              setIsLoading(false);
            });
        },
        [searchTerm],
      );

      // Debounced search handler.
      var timerRef = element.useRef(null);
      function onSearchChange(value) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(function () {
          setSearchTerm(value);
        }, 300);
      }

      // Inspector controls (sidebar).
      var inspectorControls = el(
        InspectorControls,
        null,
        el(
          PanelBody,
          { title: "Display Settings", initialOpen: true },
          el(SelectControl, {
            label: "Layout",
            value: layout,
            options: [
              { label: "Card", value: "card" },
              { label: "Inline", value: "inline" },
              { label: "Full Width", value: "full" },
            ],
            onChange: function (value) {
              setAttributes({ layout: value });
            },
          }),
          el(ToggleControl, {
            label: "Show Image",
            checked: showImage,
            onChange: function (value) {
              setAttributes({ showImage: value });
            },
          }),
          el(ToggleControl, {
            label: "Show Price",
            checked: showPrice,
            onChange: function (value) {
              setAttributes({ showPrice: value });
            },
          }),
          el(ToggleControl, {
            label: "Show Description",
            checked: showDescription,
            onChange: function (value) {
              setAttributes({ showDescription: value });
            },
          }),
        ),
      );

      // If no product selected, show the selector.
      if (!productSlug) {
        return el(
          Fragment,
          null,
          inspectorControls,
          el(
            "div",
            blockProps,
            el(
              Placeholder,
              {
                icon: "products",
                label: "Lylrv Product Display",
                instructions:
                  "Search and select a product from your Lylrv dashboard.",
              },
              el(TextControl, {
                placeholder: "Search products...",
                onChange: onSearchChange,
              }),
              isLoading
                ? el(Spinner)
                : products.length > 0
                  ? el(
                      "div",
                      {
                        style: {
                          maxHeight: "200px",
                          overflowY: "auto",
                          width: "100%",
                        },
                      },
                      products.map(function (product) {
                        return el(
                          Button,
                          {
                            key: product.slug,
                            variant: "secondary",
                            style: {
                              display: "block",
                              width: "100%",
                              textAlign: "left",
                              marginBottom: "4px",
                            },
                            onClick: function () {
                              setAttributes({
                                productSlug: product.slug,
                                productName: product.name,
                              });
                            },
                          },
                          product.name +
                            (product.price ? " — $" + product.price : ""),
                        );
                      }),
                    )
                  : el(
                      "p",
                      { style: { color: errorMsg ? "#cc1818" : undefined } },
                      errorMsg
                        ? errorMsg
                        : searchTerm
                          ? "No products found."
                          : "No products available.",
                    ),
            ),
          ),
        );
      }

      // Product is selected — show preview.
      return el(
        Fragment,
        null,
        inspectorControls,
        el(
          "div",
          blockProps,
          el(
            "div",
            {
              className:
                "lylrv-product-display lylrv-product-display--" + layout,
              style: {
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "16px",
                background: "#fafafa",
              },
            },
            el(
              "div",
              {
                style: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px",
                },
              },
              el("strong", null, productName || productSlug),
              el(
                Button,
                {
                  variant: "link",
                  isDestructive: true,
                  onClick: function () {
                    setAttributes({
                      productSlug: "",
                      productName: "",
                    });
                  },
                },
                "Change Product",
              ),
            ),
            el(
              "p",
              {
                style: {
                  color: "#666",
                  fontSize: "13px",
                  margin: 0,
                },
              },
              "Product slug: /" + productSlug + "/",
            ),
            el(
              "p",
              {
                style: {
                  color: "#888",
                  fontSize: "12px",
                  fontStyle: "italic",
                  margin: "8px 0 0",
                },
              },
              "This block renders server-side on the frontend.",
            ),
          ),
        ),
      );
    },

    save: function () {
      // Server-side rendered — return null.
      return null;
    },
  });
})(
  window.wp.blocks,
  window.wp.element,
  window.wp.blockEditor,
  window.wp.components,
  window.wp.apiFetch,
);
