import Link from "next/link";
import { Suspense } from "react";

import { getSession } from "~/auth/server";

export default function LandingPage() {
  return (
    <div className="bg-ambient noise relative min-h-screen overflow-hidden">
      {/* Navigation */}
      <nav className="reveal-fade relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="text-primary-foreground"
            >
              <path
                d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Lylrv
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#features"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
          >
            Pricing
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Suspense
            fallback={
              <div className="bg-muted h-9 w-20 animate-pulse rounded-md" />
            }
          >
            <AuthNav />
          </Suspense>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-8 lg:pt-32">
        {/* Ambient glow orb */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div className="h-[500px] w-[800px] rounded-full bg-primary/[0.07] blur-[120px]" />
        </div>

        <div className="relative flex flex-col items-center text-center">
          {/* Pill badge */}
          <div className="reveal-up delay-1 mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Now in public beta
          </div>

          {/* Headline */}
          <h1 className="reveal-up delay-2 font-display max-w-4xl text-5xl font-extrabold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
            Turn Every Customer Into a{" "}
            <span className="shimmer-text">Loyal Advocate</span>
          </h1>

          {/* Subheadline */}
          <p className="reveal-up delay-3 mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            The all-in-one loyalty rewards and reviews platform that transforms
            one-time buyers into lifetime customers. Beautiful embeddable
            widgets. Zero friction.
          </p>

          {/* CTA Buttons */}
          <div className="reveal-up delay-4 mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="pulse-glow group relative inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
            >
              Get Started Free
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                <path
                  d="M6 3L11 8L6 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-card/50 px-8 text-sm font-medium text-foreground backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card"
            >
              See How It Works
            </a>
          </div>

          {/* Trust indicators */}
          <div className="reveal-fade delay-6 mt-16 flex flex-col items-center gap-3">
            <div className="flex -space-x-2">
              {[
                "bg-amber-500",
                "bg-emerald-500",
                "bg-sky-500",
                "bg-violet-500",
                "bg-rose-500",
              ].map((color, i) => (
                <div
                  key={i}
                  className={`flex size-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white ${color}`}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Trusted by{" "}
              <span className="font-semibold text-foreground">2,400+</span>{" "}
              businesses worldwide
            </p>
          </div>
        </div>

        {/* Hero visual / Dashboard preview */}
        <div className="reveal-scale delay-7 relative mx-auto mt-20 max-w-5xl">
          <div className="gradient-border overflow-hidden rounded-2xl border bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b bg-muted/50 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-400/60" />
                <div className="size-3 rounded-full bg-amber-400/60" />
                <div className="size-3 rounded-full bg-emerald-400/60" />
              </div>
              <div className="mx-auto flex h-7 w-80 items-center justify-center rounded-md bg-background/60 text-xs text-muted-foreground">
                app.lylrv.com/dashboard
              </div>
            </div>
            <div className="bg-grid-dots relative p-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <DemoStatCard
                  label="Total Customers"
                  value="12,847"
                  change="+18.2%"
                  positive
                />
                <DemoStatCard
                  label="Points Earned"
                  value="2.4M"
                  change="+24.5%"
                  positive
                />
                <DemoStatCard
                  label="Avg. Rating"
                  value="4.87"
                  change="+0.12"
                  positive
                />
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-card p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">Recent Reviews</span>
                    <span className="text-xs text-primary">View all</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Sarah M.",
                        stars: 5,
                        text: "Absolutely love the rewards...",
                      },
                      {
                        name: "James T.",
                        stars: 5,
                        text: "Best loyalty program we've used...",
                      },
                      {
                        name: "Emily R.",
                        stars: 4,
                        text: "Great widget, easy to set up...",
                      },
                    ].map((review, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-lg bg-muted/40 p-3"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {review.name[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {review.name}
                            </span>
                            <div className="flex gap-0.5">
                              {Array.from({ length: review.stars }).map(
                                (_, j) => (
                                  <svg
                                    key={j}
                                    width="10"
                                    height="10"
                                    viewBox="0 0 10 10"
                                    fill="currentColor"
                                    className="text-primary"
                                  >
                                    <path d="M5 0.5L6.12 3.26L9.11 3.58L6.89 5.54L7.54 8.48L5 6.97L2.46 8.48L3.11 5.54L0.89 3.58L3.88 3.26L5 0.5Z" />
                                  </svg>
                                ),
                              )}
                            </div>
                          </div>
                          <p className="mt-0.5 truncate text-xs text-muted-foreground">
                            {review.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border bg-card p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Loyalty Activity
                    </span>
                    <span className="text-xs text-primary">This week</span>
                  </div>
                  {/* Fake chart bars */}
                  <div className="flex items-end gap-2 pt-4">
                    {[40, 65, 55, 80, 45, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex flex-1 flex-col items-center gap-1.5"
                      >
                        <div
                          className="w-full rounded-md bg-primary/20 transition-all duration-500"
                          style={{ height: `${h}px` }}
                        >
                          <div
                            className="w-full rounded-md bg-primary"
                            style={{
                              height: `${h * 0.6}px`,
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {["M", "T", "W", "T", "F", "S", "S"][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative blur blobs */}
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 size-60 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/5 blur-3xl"
            aria-hidden="true"
          />
        </div>
      </section>

      {/* Social proof marquee */}
      <section className="relative z-10 border-y border-border/50 bg-muted/30 py-10">
        <div className="marquee">
          <div className="marquee-inner gap-12">
            {[...Array(2)].map((_, setIdx) =>
              [
                "Shopify",
                "WooCommerce",
                "BigCommerce",
                "Magento",
                "WordPress",
                "Custom Stores",
                "Shopify",
                "WooCommerce",
                "BigCommerce",
                "Magento",
                "WordPress",
                "Custom Stores",
              ].map((brand, i) => (
                <span
                  key={`${setIdx}-${i}`}
                  className="inline-flex items-center gap-2 px-6 text-sm font-medium text-muted-foreground/60"
                >
                  <span className="size-1.5 rounded-full bg-primary/30" />
                  {brand}
                </span>
              )),
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8"
      >
        <div className="mb-16 max-w-2xl">
          <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Platform Features
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Everything You Need to Build Customer Loyalty
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            From points and rewards to reviews and referrals — a complete
            toolkit designed to keep your customers coming back.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              ),
              title: "Loyalty Points Engine",
              description:
                "Award points for purchases, sign-ups, referrals, and custom actions. Define tiers, multipliers, and expiration rules with a visual builder.",
            },
            {
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              ),
              title: "Product Reviews",
              description:
                "Collect verified reviews with photo uploads, Q&A threads, and smart moderation. Display beautiful review widgets anywhere on your store.",
            },
            {
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              ),
              title: "Rewards & Coupons",
              description:
                "Let customers redeem points for discounts, free products, and exclusive perks. Auto-generate unique coupon codes on redemption.",
            },
            {
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              ),
              title: "Referral Programs",
              description:
                "Generate unique referral codes for every customer. Track conversions, reward both parties, and watch your organic growth soar.",
            },
            {
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              ),
              title: "Embeddable Widgets",
              description:
                "Drop a single script tag and get beautiful, customizable widgets that match your brand. Works with any platform — Shopify, WooCommerce, or custom.",
            },
            {
              icon: (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 20V10" />
                  <path d="M18 20V4" />
                  <path d="M6 20v-4" />
                </svg>
              ),
              title: "Analytics & Insights",
              description:
                "Track customer lifetime value, loyalty engagement rates, review sentiment, and referral ROI — all from a single, beautiful dashboard.",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-border/60 bg-card/50 p-7 transition-all duration-300 hover:border-primary/20 hover:bg-card hover:shadow-lg"
            >
              <div className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        className="relative z-10 border-y border-border/50 bg-muted/20"
      >
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Simple Setup
            </span>
            <h2 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Live in Three Steps
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              From sign-up to your first loyal customer in under five minutes.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Connect Your Store",
                description:
                  "Install our plugin or paste a single script tag. Supports Shopify, WooCommerce, and any custom storefront.",
              },
              {
                step: "02",
                title: "Configure Rewards",
                description:
                  "Set up your loyalty tiers, point rules, referral bonuses, and review incentives using our visual builder.",
              },
              {
                step: "03",
                title: "Watch Growth",
                description:
                  "Your customers start earning points, leaving reviews, and referring friends. Track everything in real-time.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center">
                {i < 2 && (
                  <div className="divider-glow absolute right-0 top-12 hidden h-px w-full translate-x-1/2 md:block" />
                )}
                <div className="relative mb-5 inline-flex size-14 items-center justify-center">
                  <div className="absolute inset-0 rounded-2xl bg-primary/10" />
                  <span className="font-display relative text-lg font-bold text-primary">
                    {item.step}
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-tight">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="gradient-border relative overflow-hidden rounded-3xl bg-card p-12 text-center sm:p-16 lg:p-20">
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            aria-hidden="true"
          >
            <div className="h-64 w-[500px] rounded-full bg-primary/10 blur-[100px]" />
          </div>

          <div className="relative">
            <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ready to Build Unbreakable Customer Loyalty?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Join thousands of brands using Lylrv to turn transactions into
              lasting relationships. Free to start, scales with you.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
              >
                Start Free Trial
              </Link>
              <span className="text-sm text-muted-foreground">
                No credit card required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 18 18"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <path
                    d="M9 1L11.47 6.04L17 6.84L13 10.72L13.94 16.24L9 13.67L4.06 16.24L5 10.72L1 6.84L6.53 6.04L9 1Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <span className="font-display text-sm font-bold">Lylrv</span>
            </div>
            <div className="flex items-center gap-8">
              <a
                href="#features"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </a>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Lylrv. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Async auth nav buttons ── */
async function AuthNav() {
  const session = await getSession();

  if (session) {
    return (
      <a
        href="http://localhost:3001/dashboard"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/90"
      >
        Dashboard
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 3L11 8L6 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </a>
    );
  }

  return (
    <>
      <a
        href="http://localhost:3001"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Log In
      </a>
      <a
        href="http://localhost:3001"
        className="inline-flex h-9 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-xs transition-all duration-200 hover:bg-primary/90"
      >
        Get Started
      </a>
    </>
  );
}

/* ── Demo stat card for hero preview ── */
function DemoStatCard({
  label,
  value,
  change,
  positive,
}: {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        <span
          className={`mb-0.5 flex items-center gap-0.5 text-xs font-medium ${
            positive ? "text-emerald-500" : "text-red-400"
          }`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            className={!positive ? "rotate-180" : ""}
          >
            <path d="M6 2.5L9.5 6.5H2.5L6 2.5Z" fill="currentColor" />
          </svg>
          {change}
        </span>
      </div>
    </div>
  );
}
