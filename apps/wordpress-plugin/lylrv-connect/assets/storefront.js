(function () {
  "use strict";

  if (typeof window.lylrvStorefront === "undefined") {
    return;
  }

  var config = window.lylrvStorefront;

  function getCartToken() {
    var cookieName = config.cartCookie + "=";
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i += 1) {
      var cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return decodeURIComponent(cookie.substring(cookieName.length));
      }
    }

    return config.cartToken || "";
  }

  function setCartToken(token) {
    if (!token) {
      return;
    }

    document.cookie =
      config.cartCookie +
      "=" +
      encodeURIComponent(token) +
      "; path=/; max-age=" +
      60 * 60 * 24 * 30 +
      "; SameSite=Lax";
    config.cartToken = token;
  }

  function setFeedback(scope, message, isError) {
    if (!scope) {
      return;
    }

    var feedback = scope.querySelector("[data-lylrv-feedback]");
    if (!feedback) {
      return;
    }

    feedback.hidden = !message;
    feedback.textContent = message || "";
    feedback.style.color = isError ? "#b42318" : "inherit";
  }

  async function sendJson(path, method, body) {
    var response = await fetch(config.apiBase + path, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    var data = await response.json().catch(function () {
      return {};
    });

    if (!response.ok) {
      throw new Error(data.error || config.labels.error);
    }

    return data;
  }

  async function handleAddToCart(button) {
    var scope = button.closest("[data-lylrv-product-root]") || button.parentNode;
    var quantityInput = scope
      ? scope.querySelector("[data-lylrv-quantity-input]")
      : null;
    var quantity = quantityInput ? Number(quantityInput.value || 1) : 1;
    var originalLabel = button.textContent;

    button.disabled = true;
    button.textContent = config.labels.adding;

    try {
      var result = await sendJson("/cart", "POST", {
        apiKey: config.apiKey,
        cartToken: getCartToken(),
        productSlug: button.getAttribute("data-product-slug"),
        quantity: quantity > 0 ? quantity : 1,
      });

      if (result.cart && result.cart.token) {
        setCartToken(result.cart.token);
      }

      setFeedback(scope, config.labels.added, false);
      button.textContent = config.labels.added;
      window.setTimeout(function () {
        button.textContent = originalLabel;
        button.disabled = false;
      }, 900);
    } catch (error) {
      setFeedback(scope, error.message || config.labels.error, true);
      button.textContent = originalLabel;
      button.disabled = false;
    }
  }

  async function handleCartMutation(button, quantity) {
    button.disabled = true;

    try {
      await sendJson("/cart", "PATCH", {
        apiKey: config.apiKey,
        cartToken: getCartToken(),
        itemId: button.getAttribute("data-item-id"),
        quantity: quantity,
      });

      window.location.reload();
    } catch (error) {
      button.disabled = false;
      window.alert(error.message || config.labels.error);
    }
  }

  async function handleCheckoutSubmit(form) {
    var submit = form.querySelector('button[type="submit"]');
    var originalLabel = submit ? submit.textContent : "";
    var formData = new FormData(form);

    if (submit) {
      submit.disabled = true;
      submit.textContent = config.labels.adding;
    }

    try {
      var billing = {
        address1: formData.get("billing_address_1") || "",
        city: formData.get("billing_city") || "",
        country: formData.get("billing_country") || "",
      };

      var result = await sendJson("/checkout", "POST", {
        apiKey: config.apiKey,
        cartToken: getCartToken(),
        email: String(formData.get("email") || ""),
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        billing: billing,
        shipping: billing,
        thankYouUrlBase: config.routes.thankYouBase,
      });

      if (result.thankYouUrl) {
        window.location.assign(result.thankYouUrl);
        return;
      }

      window.location.reload();
    } catch (error) {
      setFeedback(form, error.message || config.labels.checkoutError, true);
      if (submit) {
        submit.disabled = false;
        submit.textContent = originalLabel;
      }
    }
  }

  document.addEventListener("click", function (event) {
    var addToCart = event.target.closest("[data-lylrv-add-to-cart]");
    if (addToCart) {
      event.preventDefault();
      handleAddToCart(addToCart);
      return;
    }

    var updateButton = event.target.closest("[data-lylrv-update-cart]");
    if (updateButton) {
      event.preventDefault();
      var item = updateButton.closest("[data-lylrv-cart-item]");
      var input = item ? item.querySelector("[data-lylrv-cart-quantity]") : null;
      var quantity = input ? Number(input.value || 0) : 0;
      handleCartMutation(updateButton, quantity);
      return;
    }

    var removeButton = event.target.closest("[data-lylrv-remove-cart]");
    if (removeButton) {
      event.preventDefault();
      handleCartMutation(removeButton, 0);
    }
  });

  document.addEventListener("submit", function (event) {
    var checkoutForm = event.target.closest("[data-lylrv-checkout-form]");
    if (!checkoutForm) {
      return;
    }

    event.preventDefault();
    handleCheckoutSubmit(checkoutForm);
  });
})();
