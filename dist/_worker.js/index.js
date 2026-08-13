globalThis.__nitro_main__ = import.meta.url;
import { n as HTTPError, r as defineLazyEventHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { r as FastResponse } from "./_libs/h3-v2+rou3+srvx.mjs";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_OfGUPP = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_OfGUPP
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
[].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new FastResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/llms.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"4b9-dfYzFFFKsmFta89WmV0vZG65cEg\"",
		"mtime": "2026-08-13T05:54:07.653Z",
		"size": 1209,
		"path": "../llms.txt"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"72-we7sgV+dZnE2HaxXEkdbUR1Xb+c\"",
		"mtime": "2026-08-13T05:54:07.652Z",
		"size": 114,
		"path": "../robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"808-yncw3R8KkSb4dZ8B4IwlIVDT0u0\"",
		"mtime": "2026-08-13T05:54:07.653Z",
		"size": 2056,
		"path": "../sitemap.xml"
	},
	"/assets/_slug-DattvR2c.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2342-CRzpFP6oZJyC5SK9EmM2c6eRV6A\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 9026,
		"path": "../assets/_slug-DattvR2c.js"
	},
	"/assets/about-I2sVxCOj.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1460-Ne2t6lFaUlC+9FH8yRjxQHQtO5Y\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 5216,
		"path": "../assets/about-I2sVxCOj.js"
	},
	"/assets/agency-action-Cz6YrWe-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3ef8-cMrdHpCjAKNuxwQJ4kIXDgfbEG8\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 16120,
		"path": "../assets/agency-action-Cz6YrWe-.js"
	},
	"/assets/auth-BxJqlHFg.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1265-pkwZEN/juLUCLq4ai0ak0geL/7c\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 4709,
		"path": "../assets/auth-BxJqlHFg.js"
	},
	"/assets/chevron-down-DwGhd2BO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"75-OkCwxHoHh+e1Ce4RbSx4YD1mwWc\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 117,
		"path": "../assets/chevron-down-DwGhd2BO.js"
	},
	"/assets/check-DLHQ5maf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-bbbk6LgAy9q2q9oWa9kd4Y9le2k\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 113,
		"path": "../assets/check-DLHQ5maf.js"
	},
	"/assets/circle-check-B2_HYfj3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7-lpQstqHlxC5whTVwzusVlSFQyS4\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 167,
		"path": "../assets/circle-check-B2_HYfj3.js"
	},
	"/assets/contact-BfhuvUhL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"154a-hy81kKXLGHGe4ixLRHl5m/GWxac\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 5450,
		"path": "../assets/contact-BfhuvUhL.js"
	},
	"/assets/dashboard-BoMcN5wM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bed-R9EmaXxEEvyrKUy6Iq1a6xNUqsM\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 7149,
		"path": "../assets/dashboard-BoMcN5wM.js"
	},
	"/assets/court-summons-BdiFkUDk.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"40fc-uElrbhkCfaVmroSjsuroI5pMoQ4\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 16636,
		"path": "../assets/court-summons-BdiFkUDk.js"
	},
	"/assets/clock-BUDWTKLW.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e-y3dZl4XLSYAbDGhXTn71IkGCvyQ\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 158,
		"path": "../assets/clock-BUDWTKLW.js"
	},
	"/assets/faq-cbIMetJF.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1439-nYwb1oabJxdnF9mSe0NYPM/2s2Y\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 5177,
		"path": "../assets/faq-cbIMetJF.js"
	},
	"/assets/file-appeal-DHTggGzO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3faf-3U350f6TOopA0r8d/aEHv33FDJ0\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 16303,
		"path": "../assets/file-appeal-DHTggGzO.js"
	},
	"/assets/file-text-C1D2nJqG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-AmUTLZrcZ/uvtOgO0gVNqxwhiF8\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 374,
		"path": "../assets/file-text-C1D2nJqG.js"
	},
	"/assets/file-up-CJz9qTs5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156-yuL5qfEvovZ8aJEJ8qLArtqpc/Y\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 342,
		"path": "../assets/file-up-CJz9qTs5.js"
	},
	"/assets/irs-notice-BTIbYPlA.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"42f8-6Y0zXDh+ajsivZKuyFCW+0XTwPM\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 17144,
		"path": "../assets/irs-notice-BTIbYPlA.js"
	},
	"/assets/lock-dr0Qvxb7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-jhZcDtjWSU6m57/5zP7oBoCTzGA\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 195,
		"path": "../assets/lock-dr0Qvxb7.js"
	},
	"/assets/mail-Brpsj4ae.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-GqqN7B3HbaaC56sRkdD2oem0dZ8\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 202,
		"path": "../assets/mail-Brpsj4ae.js"
	},
	"/assets/package-check-guXh0vIv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19f-shVxrbR9nf24pi314Ou4MYHxnbk\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 415,
		"path": "../assets/package-check-guXh0vIv.js"
	},
	"/assets/pricing-DbjA_taZ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"13e2-Ff99thyZA/k90YYlyqpEPbo8lY4\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 5090,
		"path": "../assets/pricing-DbjA_taZ.js"
	},
	"/assets/index-CAY2xSEd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5671b-KZR8N/BYdTBVrctrhyNAxJAoSvI\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 354075,
		"path": "../assets/index-CAY2xSEd.js"
	},
	"/assets/privacy-BuE4Gugd.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1043-129bbS7a5WKEdJXWNOu/8TLRS68\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 4163,
		"path": "../assets/privacy-BuE4Gugd.js"
	},
	"/assets/resources-GCi0Gn_X.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e06-xJ/Jz8PVOk2kda2bhiXL5ccqz/Q\"",
		"mtime": "2026-08-13T05:54:06.959Z",
		"size": 3590,
		"path": "../assets/resources-GCi0Gn_X.js"
	},
	"/assets/routes-DG0V8h8w.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"57c3-8k9T8U6RAURKL0XoNi8XIVcpK5o\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 22467,
		"path": "../assets/routes-DG0V8h8w.js"
	},
	"/assets/shield-alert-Dd1C2h0f.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156-m7SWZNu5qjfIfvBPN+KkNtbu4J0\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 342,
		"path": "../assets/shield-alert-Dd1C2h0f.js"
	},
	"/assets/shield-check-qU03pDFm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-LVAhqt45e266PzzEVfejPug5Pvw\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 309,
		"path": "../assets/shield-check-qU03pDFm.js"
	},
	"/assets/sparkles-CTeJnr17.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e3-6F1O8E21XJbYtWSPf0OV5TWpQHw\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 483,
		"path": "../assets/sparkles-CTeJnr17.js"
	},
	"/assets/stamp-cOx764Kv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136-gyBYeaOPVVJzHjgdRhbjv+Ha+b0\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 310,
		"path": "../assets/stamp-cOx764Kv.js"
	},
	"/assets/styles-yA-Rt9lr.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"7bd0-VssKJHBBOo8Bhg7uOB2b/IH/1dI\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 31696,
		"path": "../assets/styles-yA-Rt9lr.css"
	},
	"/assets/terms-CBXoIy5N.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c7f-nRGiGj3eKGKaus5ZzOZ7umyGhQc\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 3199,
		"path": "../assets/terms-CBXoIy5N.js"
	},
	"/assets/triangle-alert-CGYGgR8I.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e-Y1XZCPuAe0IWnTpsj2wVX3xcZn0\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 366,
		"path": "../assets/triangle-alert-CGYGgR8I.js"
	},
	"/assets/workflows-D7UsUcax.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"853-uNi3r/N1uhkr+KNMoIzJYgod5pE\"",
		"mtime": "2026-08-13T05:54:06.960Z",
		"size": 2131,
		"path": "../assets/workflows-D7UsUcax.js"
	}
};
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/_module-handler.mjs
function augmentReq(cfReq, ctx) {
	const req = cfReq;
	req.ip = cfReq.headers.get("cf-connecting-ip") || void 0;
	req.runtime ??= { name: "cloudflare" };
	req.runtime.cloudflare = {
		...req.runtime.cloudflare,
		...ctx
	};
	req.waitUntil = ctx.context?.waitUntil.bind(ctx.context);
}
//#endregion
//#region node_modules/nitro/dist/presets/cloudflare/runtime/cloudflare-pages.mjs
var nitroApp = useNitroApp();
var cloudflare_pages_default = {
	async fetch(cfReq, env, context) {
		augmentReq(cfReq, {
			env,
			context
		});
		const url = new URL(cfReq.url);
		if (env.ASSETS && isPublicAssetURL(url.pathname)) return env.ASSETS.fetch(cfReq);
		return nitroApp.fetch(cfReq);
	},
	scheduled(event, env, context) {}
};
//#endregion
export { cloudflare_pages_default as default };
