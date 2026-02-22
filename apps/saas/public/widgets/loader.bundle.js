(() => {
  const r = window;
  if (r.__LYLRV_LOADED__) return;
  r.__LYLRV_LOADED__ = !0;
  let e = document.currentScript;
  if (!e) {
    const n = document.querySelectorAll('script[src*="loader.bundle.js"]');
    n.length > 0 && (e = n[0]);
  }
  if (!e) {
    console.error("[Lylrv] Could not find script tag");
    return;
  }
  const i = new URL(e.src),
    c = i.searchParams.get("shop");
  if (!c) {
    console.error("[Lylrv] Missing 'shop' parameter in script URL");
    return;
  }
  const s = i.origin;
  async function a() {
    try {
      const n = await fetch(
        `${s}/api/widget/config?shop=${encodeURIComponent(c)}`,
      );
      return n.ok
        ? await n.json()
        : (console.error("[Lylrv] Failed to load config:", n.status), null);
    } catch (n) {
      return console.error("[Lylrv] Error loading config:", n), null;
    }
  }
  async function d(n) {
    try {
      const o = await import(`${s}/widgets/${n}.bundle.js`);
      return o && typeof o.mount === "function"
        ? o
        : (console.error(
            `[Lylrv] Widget ${n} does not export a mount function`,
          ),
          null);
    } catch (t) {
      return console.error(`[Lylrv] Error loading widget ${n}:`, t), null;
    }
  }
  function u(n, _t) {
    const o = document.getElementById(`lylrv-${n}-container`);
    if (o) return o;
    throw new Error("Inline embedding only - no dynamic container creation");
  }
  async function l() {
    const n = await a();
    if (!n || !n.enabled) {
      console.log("[Lylrv] Widgets disabled or no config found");
      return;
    }
    r.LYLRV_WP_DATA &&
      (console.log("[Lylrv] Found WP Data:", r.LYLRV_WP_DATA),
      (n.user = r.LYLRV_WP_DATA.user),
      (n.context = r.LYLRV_WP_DATA.context)),
      (r.__LYLRV_CONFIG__ = n);
    for (const t of n.widgets)
      try {
        const o = await d(t);
        if (o) {
          const f = u(t, n.styles.position);
          o.mount(f, n);
        }
      } catch (o) {
        console.error(`[Lylrv] Failed to initialize ${t}:`, o);
      }
  }
  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", l)
    : l();
})();
