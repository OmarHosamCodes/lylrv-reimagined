import {
  F as G,
  P as J,
  c as K,
  a as Q,
  L as X,
  b as Z,
} from "./panel-BzTl2cCF.js"; /**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
import {
  W as B,
  b as D,
  s as E,
  d as H,
  B as L,
  T as M,
  k as O,
  e as p,
  m as s,
  j as T,
  t as u,
  A as W,
  f as x,
  c as z,
} from "./styles-ceTt42xX.js";
import {
  a as $,
  L as C,
  S as I,
  R as q,
  u as U,
  I as V,
  T as Y,
} from "./textarea-C9oKMbZN.js";
import { r as _, j as e, c as F } from "./vendor-react-DoxZ-W3t.js";

const ee = [
    [
      "path",
      {
        d: "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z",
        key: "r04s7s",
      },
    ],
  ],
  te = z("star", ee);
function ie({ avgRating: i, className: a }) {
  return e.jsxs(s.div, {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: u.spring,
    className: T("flex flex-col items-center gap-1", a),
    children: [
      e.jsx("span", {
        className:
          "text-5xl font-light text-foreground/90 leading-tight tracking-tight tabular-nums",
        children: i.toFixed(1),
      }),
      e.jsx(I, { rating: Math.round(i), size: "sm" }),
    ],
  });
}
function se({ distribution: i, total: a, className: t }) {
  return e.jsx(s.div, {
    variants: p,
    initial: "hidden",
    animate: "visible",
    className: T("space-y-1.5", t),
    children: [5, 4, 3, 2, 1].map((n, o) => {
      const r = i[n - 1] || 0,
        l = a > 0 ? (r / a) * 100 : 0;
      return e.jsxs(
        s.button,
        {
          type: "button",
          variants: {
            hidden: { opacity: 0, x: -8 },
            visible: {
              opacity: 1,
              x: 0,
              transition: { ...u.spring, delay: o * 0.05 },
            },
          },
          whileHover: { scale: 1.02 },
          transition: u.snappy,
          className:
            "flex w-full items-center gap-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded",
          children: [
            e.jsx("span", {
              className: "w-3 text-muted-foreground font-medium tabular-nums",
              children: n,
            }),
            e.jsx("div", {
              className: "h-2 flex-1 overflow-hidden rounded-full bg-muted/80",
              children: e.jsx(s.div, {
                className: "h-full rounded-full bg-primary",
                initial: { width: 0 },
                animate: { width: `${l}%` },
                transition: { ...u.spring, delay: 0.2 + o * 0.08 },
              }),
            }),
            e.jsx("span", {
              className: "w-8 text-right text-muted-foreground tabular-nums",
              children: r,
            }),
          ],
        },
        n,
      );
    }),
  });
}
function ae({
  shop: i,
  apiBaseUrl: a,
  type: t = "website",
  productId: n,
  enabled: o = !0,
}) {
  const [r, l] = _.useState(!1),
    [c, m] = _.useState("reviews"),
    [d, h] = _.useState({ rating: 0, title: "", body: "", images: [] }),
    {
      reviews: w,
      meta: b,
      isLoading: y,
      refetch: f,
    } = U({ shop: i, apiBaseUrl: a, type: t, productId: n, enabled: o && r }),
    g = $({
      shop: i,
      apiBaseUrl: a,
      productId: n,
      onSuccess: () => {
        h({ rating: 0, title: "", body: "", images: [] }), m("reviews"), f();
      },
    }),
    j = () => l((v) => !v),
    N = (v) => {
      h((R) => ({ ...R, rating: v }));
    },
    S = (v, R) => {
      h((A) => ({ ...A, [v]: R }));
    },
    P = () => {
      d.rating !== 0 &&
        g.mutate({
          rating: d.rating,
          title: d.title || void 0,
          body: d.body || void 0,
          images: d.images.length > 0 ? d.images : void 0,
        });
    },
    k = d.rating > 0 && !g.isPending;
  return {
    isOpen: r,
    activeTab: c,
    formData: d,
    isLoading: y,
    reviews: w,
    meta: b,
    handleToggle: j,
    setActiveTab: m,
    handleRatingChange: N,
    handleInputChange: S,
    handleSubmit: P,
    canSubmit: k,
    isSubmitting: g.isPending,
  };
}
function ne({ config: i, apiBaseUrl: a }) {
  const t = D(i),
    n = i.user?.isLoggedIn || !1,
    {
      isOpen: o,
      activeTab: r,
      formData: l,
      isLoading: c,
      reviews: m,
      meta: d,
      handleToggle: h,
      setActiveTab: w,
      handleRatingChange: b,
      handleInputChange: y,
      handleSubmit: f,
      canSubmit: g,
      isSubmitting: j,
    } = ae({ shop: i.shop || "", apiBaseUrl: a, type: "website" }),
    N = [
      { id: "reviews", label: t.reviews_tab_title || "Reviews" },
      { id: "write", label: t.write_review || "Write Review" },
    ];
  return e.jsxs("div", {
    className: "fixed bottom-4 right-20 z-9999",
    children: [
      e.jsx(G, {
        onClick: h,
        icon: e.jsx(te, { className: "h-7 w-7" }),
        label: t.secondary_floating_button_title || "Reviews",
        badge: d?.total,
      }),
      e.jsxs(J, {
        isOpen: o,
        onClose: h,
        className: H(
          "z-10002 flex flex-col",
          "w-3xl h-[600px] max-sm:w-screen max-sm:h-screen max-sm:min-w-full max-sm:max-w-lg",
          "p-0 box-border overflow-hidden",
          "bg-background border-none rounded-none sm:rounded-2xl",
        ),
        children: [
          e.jsx(K, {
            className: "py-5",
            children: e.jsx(s.h2, {
              initial: { opacity: 0, y: 4 },
              animate: { opacity: 1, y: 0 },
              transition: u.spring,
              className: "text-lg font-bold tracking-tight",
              children: t.reviews_system_header || "Customer Reviews",
            }),
          }),
          e.jsx(M, { tabs: N, activeTab: r, onTabChange: (S) => w(S) }),
          e.jsx(Q, {
            className: "flex-1 overflow-y-auto px-5 py-5",
            children: e.jsx(W, {
              mode: "wait",
              children: e.jsx(
                s.div,
                {
                  initial: { opacity: 0, y: 8 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: -8 },
                  transition: u.smooth,
                  children: c
                    ? e.jsx(X, {})
                    : r === "reviews"
                      ? e.jsx(re, { t, reviews: m, meta: d })
                      : e.jsx(oe, {
                          t,
                          isLoggedIn: n,
                          formData: l,
                          canSubmit: g,
                          isSubmitting: j,
                          onRatingChange: b,
                          onInputChange: y,
                          onSubmit: f,
                        }),
                },
                c ? "loading" : r,
              ),
            }),
          }),
          e.jsx(Z, {
            children: e.jsx(s.button, {
              type: "button",
              whileHover: { color: "var(--color-foreground)" },
              className: "text-xs text-muted-foreground transition-colors",
              children: t.need_help || "Need help?",
            }),
          }),
        ],
      }),
    ],
  });
}
function re({ t: i, reviews: a, meta: t }) {
  return e.jsxs(s.div, {
    variants: p,
    initial: "hidden",
    animate: "visible",
    className: "space-y-4",
    children: [
      t &&
        e.jsxs(s.section, {
          variants: O,
          className:
            "flex flex-row items-center justify-center gap-6 py-2 max-sm:flex-col max-sm:gap-4",
          children: [
            e.jsx(ie, { avgRating: t.averageRating, className: "shrink-0" }),
            e.jsx(se, {
              distribution: t.ratingDistribution,
              total: t.total,
              className: "flex-1 max-w-[200px] max-sm:max-w-full max-sm:w-full",
            }),
          ],
        }),
      t &&
        e.jsxs(s.p, {
          variants: x,
          className: "text-center text-sm text-muted-foreground",
          children: [t.total, " ", i.total_reviews || "reviews"],
        }),
      e.jsx(s.div, {
        variants: x,
        className: "space-y-3 border-t border-border/50 pt-4",
        children:
          a.length > 0
            ? e.jsx(s.div, {
                variants: p,
                initial: "hidden",
                animate: "visible",
                className: "space-y-3",
                children: a.map((n) =>
                  e.jsx(
                    s.div,
                    { variants: x, children: e.jsx(q, { review: n }) },
                    n.id,
                  ),
                ),
              })
            : e.jsx("p", {
                className: "py-8 text-center text-sm text-muted-foreground",
                children:
                  i.no_reviews || "No reviews yet. Be the first to review!",
              }),
      }),
      a.length > 0 &&
        e.jsxs(s.button, {
          type: "button",
          variants: x,
          whileHover: { x: 4 },
          transition: u.snappy,
          className:
            "w-full text-center text-sm font-medium text-primary hover:text-primary/80 transition-colors py-2",
          children: [i.view_all || "View All", " →"],
        }),
    ],
  });
}
function oe({
  t: i,
  isLoggedIn: a,
  formData: t,
  canSubmit: n,
  isSubmitting: o,
  onRatingChange: r,
  onInputChange: l,
  onSubmit: c,
}) {
  return a
    ? e.jsxs(s.div, {
        variants: p,
        initial: "hidden",
        animate: "visible",
        className: "space-y-4",
        children: [
          e.jsxs(s.div, {
            variants: x,
            children: [
              e.jsx(C, {
                children: i.add_website_review || "Rate your experience",
              }),
              e.jsx("div", {
                className: "mt-2",
                children: e.jsx(I, {
                  rating: t.rating,
                  size: "lg",
                  interactive: !0,
                  onRate: r,
                }),
              }),
            ],
          }),
          e.jsxs(s.div, {
            variants: x,
            children: [
              e.jsx(C, {
                htmlFor: "review-title",
                children: i.add_product_review_title || "Title",
              }),
              e.jsx(V, {
                id: "review-title",
                value: t.title,
                onChange: (m) => l("title", m.target.value),
                placeholder: "Summary of your experience",
              }),
            ],
          }),
          e.jsxs(s.div, {
            variants: x,
            children: [
              e.jsx(C, {
                htmlFor: "review-body",
                children: i.add_website_review_body || "Your review",
              }),
              e.jsx(Y, {
                id: "review-body",
                value: t.body,
                onChange: (m) => l("body", m.target.value),
                rows: 4,
                placeholder: "Tell us about your experience...",
              }),
            ],
          }),
          e.jsx(s.div, {
            variants: x,
            children: e.jsx(L, {
              fullWidth: !0,
              onClick: c,
              disabled: !n,
              children: e.jsx(W, {
                mode: "wait",
                children: e.jsx(
                  s.span,
                  {
                    initial: { opacity: 0, y: 4 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -4 },
                    transition: u.snappy,
                    children: o
                      ? "Submitting..."
                      : i.write_review || "Submit Review",
                  },
                  o ? "submitting" : "idle",
                ),
              }),
            }),
          }),
        ],
      })
    : e.jsxs(s.div, {
        initial: { opacity: 0, scale: 0.96 },
        animate: { opacity: 1, scale: 1 },
        transition: u.spring,
        className: "py-8 text-center",
        children: [
          e.jsxs("p", {
            className: "mb-4 text-sm text-muted-foreground",
            children: [i.sign_in || "Sign in", " to write a review"],
          }),
          e.jsx(L, { fullWidth: !0, children: i.sign_in || "Sign In" }),
        ],
      });
}
function le(i, a) {
  const t = i.attachShadow({ mode: "open" }),
    o = document.querySelectorAll('script[src*="loader.bundle.js"]')[0],
    r = o ? new URL(o.src).origin : window.location.origin,
    l = new CSSStyleSheet();
  l.replaceSync(E), (t.adoptedStyleSheets = [l]);
  const c = document.createElement("div");
  t.appendChild(c),
    F.createRoot(c).render(
      e.jsx(B, {
        config: a,
        apiBaseUrl: r,
        children: e.jsx(ne, { config: a, apiBaseUrl: r }),
      }),
    );
}
typeof window < "u" &&
  ((window.LylrvWidgets = window.LylrvWidgets || {}),
  (window.LylrvWidgets.reviews = { mount: le }));
export { le as mount };
