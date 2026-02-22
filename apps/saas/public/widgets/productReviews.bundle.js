import { a as le } from "./config-BHVJYPGW.js"; /**
 * @license lucide-react v0.562.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
import {
  l as ae,
  e as C,
  t as h,
  b as ie,
  T as ne,
  W as oe,
  B as R,
  s as re,
  m as s,
  c as se,
  f as u,
  A as W,
} from "./styles-ceTt42xX.js";
import {
  I as ee,
  L as k,
  R as te,
  T as U,
  S as V,
  u as X,
  a as Z,
} from "./textarea-C9oKMbZN.js";
import { j as e, c as K, r as m } from "./vendor-react-DoxZ-W3t.js";

const de = [
    [
      "path",
      {
        d: "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",
        key: "18u6gg",
      },
    ],
    ["circle", { cx: "12", cy: "13", r: "3", key: "1vg3eu" }],
  ],
  ce = se("camera", de);
function me(t) {
  return m.useMemo(() => le(t), [t]);
}
function ue(t, a) {
  const { shop: i, productId: n, apiBaseUrl: r } = a,
    [d, o] = m.useState("reviews"),
    [l, g] = m.useState({ rating: 0, title: "", body: "" }),
    [c, v] = m.useState([]),
    [b, f] = m.useState(null),
    y = ie(t),
    x = me(t),
    w = t.user?.isLoggedIn || !1,
    S = t.context?.product?.hasPurchased || !1,
    T = t.clientConfig?.interactions || [],
    F = T.find((p) => p.trigger === "review"),
    Q = T.find((p) => p.trigger === "reviewImgs"),
    I = F?.pointsGained || 50,
    j = Q?.pointsGained || 100,
    {
      reviews: q,
      meta: H,
      isLoading: A,
      error: B,
      refetch: M,
    } = X({ shop: i, apiBaseUrl: r, type: "product", productId: n }),
    { mutate: P, isPending: N } = Z({
      shop: i,
      apiBaseUrl: r,
      onSuccess: () => {
        g({ rating: 0, title: "", body: "" }), v([]), o("reviews"), M();
      },
    }),
    E = m.useCallback((p) => {
      g((_) => ({ ..._, rating: p }));
    }, []),
    O = m.useCallback((p, _) => {
      g((L) => ({ ...L, [p]: _ }));
    }, []),
    Y = m.useCallback((p) => {
      if (!p) return;
      const _ = Array.from(p);
      v((L) => [...L, ..._].slice(0, 5));
    }, []),
    $ = m.useCallback((p) => {
      v((_) => _.filter((_L, J) => J !== p));
    }, []),
    D = m.useCallback(() => {
      l.rating !== 0 &&
        P({
          rating: l.rating,
          title: l.title,
          body: l.body,
          images: c.length > 0 ? c : void 0,
        });
    }, [l, c, P]),
    G = l.rating > 0 && w && S;
  return {
    t: y,
    theme: x,
    isLoggedIn: w,
    hasPurchased: S,
    reviewPoints: I,
    reviewWithImagesPoints: j,
    activeTab: d,
    setActiveTab: o,
    reviews: q,
    meta: H,
    isLoading: A,
    error: B,
    imageViewerOpen: b,
    setImageViewerOpen: f,
    formData: l,
    imageFiles: c,
    handleRatingChange: E,
    handleInputChange: O,
    handleAddImages: Y,
    handleRemoveImage: $,
    handleSubmit: D,
    canSubmit: G,
    isSubmitting: N,
  };
}
const he = ({ t, onSubmit: a, isLoading: i = !1 }) => {
    const [n, r] = m.useState(""),
      d = (o) => {
        o.preventDefault(), n.trim().length >= 3 && (a(n), r(""));
      };
    return e.jsxs(s.div, {
      variants: C,
      initial: "hidden",
      animate: "visible",
      className: "rounded-xl border border-border/60 bg-card p-5",
      children: [
        e.jsx(s.h3, {
          variants: u,
          className: "mb-4 text-center font-semibold",
          children: t.add_question_page_title || "Ask a Question",
        }),
        e.jsxs("form", {
          onSubmit: d,
          className: "flex flex-col gap-3",
          children: [
            e.jsxs(s.div, {
              variants: u,
              children: [
                e.jsx(k, {
                  htmlFor: "question-body",
                  children: t.add_question_body || "Your Question",
                }),
                e.jsx(U, {
                  id: "question-body",
                  value: n,
                  onChange: (o) => r(o.target.value),
                  placeholder:
                    t.add_question_placeholder ||
                    "What would you like to know?",
                  className: "w-full rounded-lg",
                  rows: 4,
                }),
              ],
            }),
            e.jsx(s.div, {
              variants: u,
              children: e.jsx(R, {
                type: "submit",
                className: "w-full",
                disabled: i || n.trim().length < 3,
                children: t.add_question || "Submit Question",
              }),
            }),
          ],
        }),
      ],
    });
  },
  xe = ({
    t,
    isLoggedIn: a,
    hasPurchased: i,
    reviewPoints: n,
    reviewWithImagesPoints: r,
    formData: d,
    canSubmit: o,
    isSubmitting: l,
    onRatingChange: g,
    onInputChange: c,
    onAddImages: v,
    onRemoveImage: b,
    onSubmit: f,
    onCancel: y,
  }) =>
    a
      ? i
        ? e.jsxs(s.div, {
            variants: C,
            initial: "hidden",
            animate: "visible",
            className:
              "space-y-4 rounded-xl border border-border/60 bg-card p-5",
            children: [
              e.jsx(s.h3, {
                variants: u,
                className: "font-semibold text-foreground",
                children:
                  t.add_product_review_page_title || "Write a Product Review",
              }),
              e.jsx(s.div, {
                variants: u,
                className:
                  "rounded-lg bg-primary/8 p-3 text-sm text-primary border border-primary/10",
                children: e.jsxs("span", {
                  className: "font-medium",
                  children: [
                    t.you_will_gain || "You'll earn",
                    " ",
                    e.jsxs("strong", { children: [n, "-", r] }),
                    " ",
                    t.points || "points",
                    "!",
                  ],
                }),
              }),
              e.jsxs(s.div, {
                variants: u,
                children: [
                  e.jsx(k, { children: "Rating *" }),
                  e.jsx("div", {
                    className: "mt-1.5",
                    children: e.jsx(V, {
                      rating: d.rating,
                      size: "lg",
                      interactive: !0,
                      onRate: g,
                      className: "text-yellow-400",
                    }),
                  }),
                ],
              }),
              e.jsxs(s.div, {
                variants: u,
                children: [
                  e.jsx(k, {
                    htmlFor: "review-title",
                    children: t.add_product_review_title || "Review Title",
                  }),
                  e.jsx(ee, {
                    id: "review-title",
                    value: d.title,
                    onChange: (x) => c("title", x.target.value),
                    placeholder: "Summarize your experience",
                  }),
                ],
              }),
              e.jsxs(s.div, {
                variants: u,
                children: [
                  e.jsx(k, {
                    htmlFor: "review-body",
                    children: t.add_product_review_body || "Your Review",
                  }),
                  e.jsx(U, {
                    id: "review-body",
                    value: d.body,
                    onChange: (x) => c("body", x.target.value),
                    rows: 4,
                    placeholder:
                      "Tell others about your experience with this product...",
                  }),
                ],
              }),
              e.jsxs(s.div, {
                variants: u,
                children: [
                  e.jsxs(k, {
                    children: [
                      t.add_product_review_images || "Add Photos",
                      " (+",
                      r - n,
                      " pts)",
                    ],
                  }),
                  e.jsxs("div", {
                    className: "mt-1.5 flex flex-wrap items-center gap-2",
                    children: [
                      e.jsxs(s.label, {
                        whileHover: {
                          borderColor: "var(--color-primary)",
                          backgroundColor: "var(--color-accent)",
                        },
                        className:
                          "flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-3 text-center transition-colors",
                        children: [
                          e.jsx("input", {
                            type: "file",
                            accept: "image/*",
                            multiple: !0,
                            className: "hidden",
                            onChange: (x) => v(x.target.files),
                          }),
                          e.jsx(ce, {
                            className: "h-5 w-5 text-muted-foreground",
                          }),
                          e.jsx("span", {
                            className: "text-sm text-muted-foreground",
                            children: "Add Photos",
                          }),
                        ],
                      }),
                      e.jsx(W, {
                        children: d.images.map((x, w) =>
                          e.jsxs(
                            s.div,
                            {
                              initial: { opacity: 0, scale: 0.8 },
                              animate: { opacity: 1, scale: 1 },
                              exit: { opacity: 0, scale: 0.8 },
                              transition: h.springStiff,
                              className: "relative h-14 w-14",
                              children: [
                                e.jsx("img", {
                                  src: URL.createObjectURL(x),
                                  alt: "",
                                  className:
                                    "h-full w-full rounded-lg object-cover ring-1 ring-border/40",
                                }),
                                e.jsx(s.button, {
                                  type: "button",
                                  onClick: () => b(w),
                                  whileHover: { scale: 1.15 },
                                  whileTap: { scale: 0.9 },
                                  className:
                                    "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground shadow-sm",
                                  children: "x",
                                }),
                              ],
                            },
                            w,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
              e.jsxs(s.div, {
                variants: u,
                className: "flex gap-2",
                children: [
                  e.jsx(R, {
                    variant: "outline",
                    onClick: y,
                    className: "flex-1",
                    children: "Cancel",
                  }),
                  e.jsx(R, {
                    onClick: f,
                    disabled: !o,
                    className: "flex-1",
                    children: e.jsx(W, {
                      mode: "wait",
                      children: e.jsx(
                        s.span,
                        {
                          initial: { opacity: 0, y: 4 },
                          animate: { opacity: 1, y: 0 },
                          exit: { opacity: 0, y: -4 },
                          transition: h.snappy,
                          children: l
                            ? "Submitting..."
                            : t.write_review || "Submit Review",
                        },
                        l ? "submitting" : "idle",
                      ),
                    }),
                  }),
                ],
              }),
            ],
          })
        : e.jsx(s.div, {
            initial: { opacity: 0, scale: 0.96 },
            animate: { opacity: 1, scale: 1 },
            transition: h.spring,
            className:
              "rounded-xl border border-border/60 bg-card p-6 text-center",
            children: e.jsx("p", {
              className: "text-sm text-muted-foreground",
              children: "Only verified purchasers can write reviews.",
            }),
          })
      : e.jsxs(s.div, {
          initial: { opacity: 0, scale: 0.96 },
          animate: { opacity: 1, scale: 1 },
          transition: h.spring,
          className:
            "rounded-xl border border-border/60 bg-card p-6 text-center",
          children: [
            e.jsxs("p", {
              className: "mb-4 text-sm text-muted-foreground",
              children: [t.sign_in || "Sign in", " to write a review"],
            }),
            e.jsx(R, { children: t.sign_in || "Sign In" }),
          ],
        }),
  ge = ({
    showForm: t,
    t: a,
    isLoggedIn: i,
    hasPurchased: n,
    hasUserAlreadyReviewed: r,
    reviewPoints: d,
    reviewWithImagesPoints: o,
    formData: l,
    canSubmit: g,
    isSubmitting: c,
    onRatingChange: v,
    onInputChange: b,
    onAddImages: f,
    onRemoveImage: y,
    onSubmitReview: x,
    onCancel: w,
    onSubmitQuestion: S,
  }) =>
    t
      ? t === "question"
        ? i
          ? e.jsx(he, { t: a, onSubmit: S })
          : e.jsxs(s.div, {
              initial: { opacity: 0, scale: 0.96 },
              animate: { opacity: 1, scale: 1 },
              transition: h.spring,
              className:
                "rounded-xl border border-border/60 bg-card p-6 text-center",
              children: [
                e.jsxs("p", {
                  className: "mb-4 text-sm text-muted-foreground",
                  children: [a.sign_in || "Sign in", " to ask a question"],
                }),
                e.jsx(R, { children: a.sign_in || "Sign In" }),
              ],
            })
        : t === "review"
          ? r
            ? e.jsx(s.div, {
                initial: { opacity: 0, scale: 0.96 },
                animate: { opacity: 1, scale: 1 },
                transition: h.spring,
                className:
                  "rounded-xl border border-border/60 bg-card p-6 text-center",
                children: e.jsx("p", {
                  className: "text-sm text-muted-foreground",
                  children:
                    a.already_reviewed ||
                    "You have already reviewed this product.",
                }),
              })
            : e.jsx(xe, {
                t: a,
                isLoggedIn: i,
                hasPurchased: n,
                reviewPoints: d,
                reviewWithImagesPoints: o,
                formData: l,
                canSubmit: g,
                isSubmitting: c,
                onRatingChange: v,
                onInputChange: b,
                onAddImages: f,
                onRemoveImage: y,
                onSubmit: x,
                onCancel: w,
              })
          : null
      : null,
  z = (t) => {
    const a = [];
    for (const i of t)
      i.images && Array.isArray(i.images) && a.push(...i.images);
    return a;
  },
  pe = (t) => z(t).length > 0,
  ve = (t) => {
    typeof window < "u" &&
      window.parent.postMessage(
        { "show-images": { images: t.filter((a) => a.length > 0) } },
        "*",
      );
  },
  we = ({ allReviewsImages: t, t: a }) => {
    const i = () => {
      ve(t);
    };
    return t.length === 0
      ? null
      : e.jsxs("div", {
          className: "flex max-h-20 flex-row gap-1.5 overflow-x-scroll",
          children: [
            t
              .filter((n) => n.length > 0)
              .slice(0, 3)
              .map((n, r) =>
                e.jsx(
                  s.button,
                  {
                    type: "button",
                    onClick: i,
                    whileHover: { scale: 1.05 },
                    whileTap: { scale: 0.95 },
                    transition: h.springStiff,
                    className:
                      "h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl ring-1 ring-border/40",
                    children: e.jsx("img", {
                      src: n,
                      alt: `Review ${r.toString()}`,
                      className: "h-full w-full object-cover",
                      loading: "lazy",
                    }),
                  },
                  r.toString(),
                ),
              ),
            e.jsx(s.button, {
              type: "button",
              onClick: i,
              whileHover: { scale: 1.05 },
              whileTap: { scale: 0.95 },
              transition: h.springStiff,
              className:
                "flex h-20 w-20 flex-shrink-0 cursor-pointer select-none items-center justify-center rounded-xl bg-secondary text-white text-sm font-medium",
              children: a.view_all || "View All",
            }),
          ],
        });
  },
  be = ({
    avgRating: t,
    totalReviews: a,
    t: i,
    theme: n,
    isReviewsContainImages: r,
    allReviewsImages: d,
    onToggleReviewForm: o,
    onToggleQuestionForm: l,
  }) =>
    e.jsx(s.section, {
      variants: C,
      initial: "hidden",
      animate: "visible",
      className: "flex w-full flex-row items-center justify-between",
      children: e.jsxs("section", {
        className: "flex w-full flex-col items-start justify-start",
        children: [
          e.jsxs(s.div, {
            variants: u,
            className: "flex w-full flex-col items-start justify-start gap-1",
            children: [
              e.jsx("h1", {
                className: "text-[1.75rem] font-bold leading-7 tracking-tight",
                children: i.reviews_system_header || "Customer Reviews",
              }),
              e.jsxs("section", {
                className: "flex flex-row items-center gap-2",
                children: [
                  e.jsx(V, { rating: t, className: "text-yellow-400" }),
                  e.jsxs("p", {
                    className: "text-base text-muted-foreground",
                    children: ["(", a, " ", i.total_reviews || "Reviews", ")"],
                  }),
                ],
              }),
            ],
          }),
          e.jsx(s.h1, {
            variants: {
              hidden: { opacity: 0, scale: 0.8, y: 20 },
              visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                transition: { ...h.springBouncy, delay: 0.15 },
              },
            },
            className:
              "mt-3 w-full text-start text-[5.625rem] font-extralight tracking-tighter text-secondary leading-none",
            children: t.toFixed(1),
          }),
          e.jsxs(s.div, {
            variants: u,
            className: "flex min-w-28 w-full flex-wrap gap-4",
            children: [
              e.jsxs("div", {
                className: "flex flex-col justify-between gap-2",
                children: [
                  e.jsx(s.div, {
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 },
                    children: e.jsx(R, {
                      className: "text-base",
                      onClick: o,
                      children: i.add_product_review || "Write a Review",
                    }),
                  }),
                  e.jsx(s.div, {
                    whileHover: { scale: 1.02 },
                    whileTap: { scale: 0.98 },
                    children: e.jsx(R, {
                      variant: "outline",
                      className: "text-base",
                      onClick: l,
                      children: i.add_question || "Ask a Question",
                    }),
                  }),
                ],
              }),
              r && e.jsx(we, { allReviewsImages: d, t: i }),
            ],
          }),
        ],
      }),
    }),
  fe = ({ question: t, t: a }) => {
    const i = t.author;
    return e.jsxs(s.div, {
      whileHover: { y: -1 },
      transition: { type: "spring", stiffness: 400, damping: 30 },
      className:
        "rounded-xl border border-border/60 bg-card p-4 transition-shadow duration-300 hover:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)]",
      children: [
        e.jsx("div", {
          className: "relative mb-2 flex flex-row items-start justify-between",
          children: e.jsxs("div", {
            className: "flex flex-row items-center justify-start gap-2",
            children: [
              e.jsx("img", {
                src: `https://avatar.iran.liara.run/username?username=${encodeURIComponent(t.author)}`,
                alt: i,
                className:
                  "h-10 w-10 rounded-full bg-muted object-cover ring-2 ring-border/40",
              }),
              e.jsxs("div", {
                className: "flex flex-col items-start justify-start",
                children: [
                  e.jsx("h1", {
                    className: "text-[0.9rem] font-bold text-card-foreground",
                    children: i,
                  }),
                  e.jsx("p", {
                    className: "text-xs text-muted-foreground",
                    children: ae(t.createdAt),
                  }),
                ],
              }),
            ],
          }),
        }),
        e.jsxs("div", {
          className: "flex flex-col gap-2",
          children: [
            e.jsx("h3", {
              className:
                "wrap-break-word text-lg font-semibold text-card-foreground leading-snug",
              children: t.body,
            }),
            e.jsx("p", {
              className:
                "wrap-break-word text-sm text-muted-foreground leading-relaxed",
              children: t.answer
                ? t.answer
                : a.no_answer_yet || "No answer yet",
            }),
          ],
        }),
      ],
    });
  },
  ye = ({ questions: t, t: a }) =>
    t.length === 0
      ? e.jsx(s.p, {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: h.smooth,
          className: "py-4 text-center text-muted-foreground",
          children: a.no_questions_yet || "No questions yet",
        })
      : e.jsx(s.div, {
          variants: C,
          initial: "hidden",
          animate: "visible",
          className: "space-y-3",
          children: t.map((i, n) =>
            e.jsx(
              s.div,
              { variants: u, children: e.jsx(fe, { question: i, t: a }) },
              n.toString(),
            ),
          ),
        }),
  je = ({ reviews: t, t: a, onImageClick: i, onWriteReview: n }) =>
    t.length === 0
      ? e.jsxs(s.div, {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: h.smooth,
          className: "py-8 text-center",
          children: [
            e.jsx("p", {
              className: "text-muted-foreground",
              children: a.no_reviews_yet || "No reviews yet for this product.",
            }),
            n &&
              e.jsxs(s.button, {
                type: "button",
                onClick: n,
                whileHover: { x: 4 },
                transition: h.snappy,
                className:
                  "mt-3 text-sm font-medium text-primary hover:underline",
                children: [
                  a.be_first_to_review || "Be the first to review",
                  " →",
                ],
              }),
          ],
        })
      : e.jsx(s.div, {
          variants: C,
          initial: "hidden",
          animate: "visible",
          className: "space-y-4",
          children: t.map((r) =>
            e.jsx(
              s.div,
              {
                variants: u,
                children: e.jsx(te, { review: r, onImageClick: i }),
              },
              r.id,
            ),
          ),
        }),
  Ne = ({
    reviews: t,
    questions: a,
    t: i,
    onImageClick: n,
    onWriteReview: r,
    questionsLoading: d = !1,
  }) => {
    const [o, l] = m.useState("reviews"),
      g = [
        {
          id: "reviews",
          label: `${i.reviews_tab_title || "Reviews"} (${t.length})`,
        },
        { id: "questions", label: i.questions_tab_title || "Questions" },
      ];
    return e.jsxs("div", {
      className: "w-full space-y-4",
      children: [
        e.jsx(ne, { tabs: g, activeTab: o, onTabChange: l }),
        e.jsx(W, {
          mode: "wait",
          children: e.jsxs(
            s.div,
            {
              initial: { opacity: 0, y: 8 },
              animate: { opacity: 1, y: 0 },
              exit: { opacity: 0, y: -8 },
              transition: h.smooth,
              className: "mt-4",
              children: [
                o === "reviews" &&
                  e.jsx(je, {
                    reviews: t,
                    t: i,
                    onImageClick: n,
                    onWriteReview: r,
                  }),
                o === "questions" &&
                  e.jsx(e.Fragment, {
                    children: d
                      ? e.jsx(s.div, {
                          variants: C,
                          initial: "hidden",
                          animate: "visible",
                          className: "space-y-4",
                          children: [1, 2, 3].map((c) =>
                            e.jsx(
                              s.div,
                              {
                                variants: u,
                                className:
                                  "h-20 rounded-xl bg-muted/60 animate-pulse",
                              },
                              c,
                            ),
                          ),
                        })
                      : e.jsx(ye, { questions: a, t: i }),
                  }),
              ],
            },
            o,
          ),
        }),
      ],
    });
  };
function _e({ config: t, apiBaseUrl: a }) {
  const i = t.context?.product?.id;
  if (!i) return null;
  const {
      t: n,
      theme: r,
      isLoggedIn: d,
      hasPurchased: o,
      reviewPoints: l,
      reviewWithImagesPoints: g,
      reviews: c,
      meta: v,
      formData: b,
      handleRatingChange: f,
      handleInputChange: y,
      handleAddImages: x,
      handleRemoveImage: w,
      handleSubmit: S,
      canSubmit: T,
      isSubmitting: F,
      setImageViewerOpen: Q,
    } = ue(t, { shop: t.shop || "", productId: i, apiBaseUrl: a }),
    [I, j] = m.useState("none"),
    q = m.useMemo(() => z(c), [c]),
    H = m.useMemo(() => pe(c), [c]),
    A = () => {
      j((N) => (N === "review" ? "none" : "review"));
    },
    B = () => {
      j((N) => (N === "question" ? "none" : "question"));
    },
    M = (N) => {
      console.log("Question submitted:", N), j("none");
    },
    P = async () => {
      await S(), j("none");
    };
  return e.jsxs(s.div, {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: h.slowReveal,
    className: "w-full space-y-8 bg-transparent",
    style: { direction: r.isRTL ? "rtl" : "ltr" },
    children: [
      e.jsx(be, {
        avgRating: v?.averageRating || 0,
        totalReviews: v?.total || 0,
        t: n,
        theme: r,
        isReviewsContainImages: H,
        allReviewsImages: q,
        onToggleReviewForm: A,
        onToggleQuestionForm: B,
      }),
      e.jsx(W, {
        mode: "wait",
        children:
          I !== "none" &&
          e.jsx(
            s.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              transition: h.spring,
              children: e.jsx(ge, {
                showForm: I,
                t: n,
                isLoggedIn: d,
                hasPurchased: o,
                hasUserAlreadyReviewed: !1,
                reviewPoints: l,
                reviewWithImagesPoints: g,
                formData: b,
                canSubmit: T,
                isSubmitting: F,
                onRatingChange: f,
                onInputChange: y,
                onAddImages: x,
                onRemoveImage: w,
                onSubmitReview: P,
                onCancel: () => j("none"),
                onSubmitQuestion: M,
              }),
            },
            I,
          ),
      }),
      e.jsx(Ne, {
        reviews: c,
        questions: [],
        t: n,
        onImageClick: Q,
        onWriteReview: A,
      }),
    ],
  });
}
function Re(t, a) {
  const i = t.attachShadow({ mode: "open" }),
    r = document.querySelectorAll('script[src*="loader.bundle.js"]')[0],
    d = r ? new URL(r.src).origin : window.location.origin,
    o = new CSSStyleSheet();
  o.replaceSync(re), (i.adoptedStyleSheets = [o]);
  const l = document.createElement("div");
  (l.className = "w-full"),
    i.appendChild(l),
    K.createRoot(l).render(
      e.jsx(oe, {
        config: a,
        apiBaseUrl: d,
        children: e.jsx(_e, { config: a, apiBaseUrl: d }),
      }),
    );
}
typeof window < "u" &&
  ((window.LylrvWidgets = window.LylrvWidgets || {}),
  (window.LylrvWidgets["product-reviews"] = { mount: Re }));
export { Re as mount };
