(() => {
	const r = window;
	if (r.__LYLRV_LOADED__) return;
	r.__LYLRV_LOADED__ = !0;
	const i = document.currentScript;
	if (!i) {
		console.error("[Lylrv] Could not find script tag");
		return;
	}
	const c = new URL(i.src),
		s = c.searchParams.get("shop");
	if (!s) {
		console.error("[Lylrv] Missing 'shop' parameter in script URL");
		return;
	}
	const l = c.origin;
	async function d() {
		try {
			const n = await fetch(
				`${l}/api/widget/config?shop=${encodeURIComponent(s)}`,
			);
			return n.ok
				? await n.json()
				: (console.error("[Lylrv] Failed to load config:", n.status), null);
		} catch (n) {
			return console.error("[Lylrv] Error loading config:", n), null;
		}
	}
	async function u(n) {
		try {
			const o = await import(`${l}/widgets/${n}.bundle.js`);
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
	function f(n, t) {
		const o = document.getElementById(`lylrv-${n}-container`);
		if (o) return o;
		const e = document.createElement("div");
		return (
			(e.id = `lylrv-${n}-container`),
			(e.style.cssText = `
			position: fixed;
			bottom: 20px;
			${t}: 20px;
			z-index: 999999;
			font-family: system-ui, -apple-system, sans-serif;
		`),
			document.body.appendChild(e),
			e
		);
	}
	async function a() {
		const n = await d();
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
				const o = await u(t);
				if (o) {
					const e = f(t, n.styles.position);
					o.mount(e, n);
				}
			} catch (o) {
				console.error(`[Lylrv] Failed to initialize ${t}:`, o);
			}
	}
	document.readyState === "loading"
		? document.addEventListener("DOMContentLoaded", a)
		: a();
})();
