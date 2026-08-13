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
		"mtime": "2026-08-13T06:41:32.918Z",
		"size": 1209,
		"path": "../llms.txt"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"72-we7sgV+dZnE2HaxXEkdbUR1Xb+c\"",
		"mtime": "2026-08-13T06:41:32.918Z",
		"size": 114,
		"path": "../robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"808-yncw3R8KkSb4dZ8B4IwlIVDT0u0\"",
		"mtime": "2026-08-13T06:41:32.918Z",
		"size": 2056,
		"path": "../sitemap.xml"
	},
	"/assets/about-DASi4xZO.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14af-6EpLbHOesLXcJMm29NVYyL8p60c\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 5295,
		"path": "../assets/about-DASi4xZO.js"
	},
	"/assets/_slug-CR6JCOzJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"268e-n+qBec5qAUdfzbFMZDFWZT840ok\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 9870,
		"path": "../assets/_slug-CR6JCOzJ.js"
	},
	"/assets/agency-action-Bnz-8X_Q.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19dd-wEkzmqMH5mDKyUE0LwTQrflf7j4\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 6621,
		"path": "../assets/agency-action-Bnz-8X_Q.js"
	},
	"/assets/contact-BBO-PC6O.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1446-xxCjecJtfLVHV69E+4HtHvp/O/I\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 5190,
		"path": "../assets/contact-BBO-PC6O.js"
	},
	"/assets/court-summons-CsRqavZq.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a66-cY1b4PbKGqeqVdr+CMQ2ppjUKCg\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 6758,
		"path": "../assets/court-summons-CsRqavZq.js"
	},
	"/assets/dashboard-B6EoCgKU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1b6f-y67stexQB5/xLJ5rVHT5N2xrIkQ\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 7023,
		"path": "../assets/dashboard-B6EoCgKU.js"
	},
	"/assets/auth-y3OlkKG0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2e-6kKN+5yHNcH36CJwE9nPYlMZmq8\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 3630,
		"path": "../assets/auth-y3OlkKG0.js"
	},
	"/assets/file-appeal-2xnMw_TP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1968-qVqeksovrOEABiN18F1nnzEr+kM\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 6504,
		"path": "../assets/file-appeal-2xnMw_TP.js"
	},
	"/assets/faq-Bu3XSSdm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed0-TfMoIQZmE79SRW0B9UkUDkS4HXs\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 3792,
		"path": "../assets/faq-Bu3XSSdm.js"
	},
	"/assets/pricing-iSdioOSK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1044-ezJB9pexuyyBbqFiKEmp+H208Mk\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 4164,
		"path": "../assets/pricing-iSdioOSK.js"
	},
	"/assets/irs-notice-DVTOItHJ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20c2-rN8FFDbcCEJAtSARuJQzwVPzk88\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 8386,
		"path": "../assets/irs-notice-DVTOItHJ.js"
	},
	"/assets/resources-BKTcnF9P.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d64-dHaP/zqBLGjiaqflUlv0XnWAOdw\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 3428,
		"path": "../assets/resources-BKTcnF9P.js"
	},
	"/assets/privacy-C5TIfC4A.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a48-QmBSkQrWo61UIHsNrzRUh6i0d8Y\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 2632,
		"path": "../assets/privacy-C5TIfC4A.js"
	},
	"/assets/routes-JXytlMKX.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d53-PhoMxaq0yL8k4dWTYKkuQmbdau8\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 19795,
		"path": "../assets/routes-JXytlMKX.js"
	},
	"/assets/terms-CDogyxBK.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aaf-f3RA9YAHbdwjazI+GIlLgqwM7Qc\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 2735,
		"path": "../assets/terms-CDogyxBK.js"
	},
	"/assets/styles-BmXskIjP.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"816c-rMHNZU81ThWl/G/SYwA88NJsM2Y\"",
		"mtime": "2026-08-13T06:41:32.303Z",
		"size": 33132,
		"path": "../assets/styles-BmXskIjP.css"
	},
	"/assets/workflow-shell-BGsrQy5a.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"29e3-4U/fAuOlqmLADVzLZ5d9btCyQ7Q\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 10723,
		"path": "../assets/workflow-shell-BGsrQy5a.js"
	},
	"/assets/index-B618hErL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"562b7-O3OlQiJzS05RsLh5NP7esfwVVwA\"",
		"mtime": "2026-08-13T06:41:32.302Z",
		"size": 352951,
		"path": "../assets/index-B618hErL.js"
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
