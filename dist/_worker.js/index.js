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
var _lazy_uZM1fI = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_uZM1fI
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
		"mtime": "2026-08-15T18:15:59.061Z",
		"size": 1209,
		"path": "../llms.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"808-yncw3R8KkSb4dZ8B4IwlIVDT0u0\"",
		"mtime": "2026-08-15T18:15:59.061Z",
		"size": 2056,
		"path": "../sitemap.xml"
	},
	"/assets/agency-action-BOKojl1o.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19dd-xHyqxac9/nX8mcba5KCP/alOqHI\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 6621,
		"path": "../assets/agency-action-BOKojl1o.js"
	},
	"/assets/contact-C0QUoXN8.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1446-R6wwgDM4jaZh/SqbuRiHhmt3txQ\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 5190,
		"path": "../assets/contact-C0QUoXN8.js"
	},
	"/assets/dashboard-BLbuQ-Yy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1d4c-7R1zQDTthLOgW7OrRmd0RbYF3Fk\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 7500,
		"path": "../assets/dashboard-BLbuQ-Yy.js"
	},
	"/assets/faq-D-NCI3mt.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ed0-1ONaG38B35d7iR560py2SRwTd/A\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 3792,
		"path": "../assets/faq-D-NCI3mt.js"
	},
	"/assets/analyze-BGSJJw8E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1575e-ch2kLSuNCfZEZgP1sJJJcRLSrys\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 87902,
		"path": "../assets/analyze-BGSJJw8E.js"
	},
	"/assets/court-summons-C1Dv-pXM.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1a66-oMzY5xH/OseV1dJKdaFtYukcuAA\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 6758,
		"path": "../assets/court-summons-C1Dv-pXM.js"
	},
	"/assets/irs-notice-UzreZi0b.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"20c2-lr/lwosYEQNn+pvjLUYUILdzzJ0\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 8386,
		"path": "../assets/irs-notice-UzreZi0b.js"
	},
	"/assets/file-appeal-DZ2nbL7v.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1968-XUeiFRb94ZnCYGiThJe4WceivM4\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 6504,
		"path": "../assets/file-appeal-DZ2nbL7v.js"
	},
	"/assets/privacy-Db1ZBrQ0.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a48-sN5ady6Rwllu4Tsn9w29pvqAHzk\"",
		"mtime": "2026-08-15T18:15:58.305Z",
		"size": 2632,
		"path": "../assets/privacy-Db1ZBrQ0.js"
	},
	"/assets/index-DX8gvcrs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"56a12-WNWm0pdMdythJs/McqTljRLmsuM\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 354834,
		"path": "../assets/index-DX8gvcrs.js"
	},
	"/assets/auth-B5wULtDQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e2e-RrOOh8AEmiFB4hQ6BXADPBBEVlY\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 3630,
		"path": "../assets/auth-B5wULtDQ.js"
	},
	"/assets/resources-4JpUcXii.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d64-5iWBsDhX9mcq7sMl346f9Ll5zp8\"",
		"mtime": "2026-08-15T18:15:58.305Z",
		"size": 3428,
		"path": "../assets/resources-4JpUcXii.js"
	},
	"/assets/routes-Bi-Z28Ao.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4d53-ABkl140u4jRHsTFqAGQ6jfL+Asc\"",
		"mtime": "2026-08-15T18:15:58.305Z",
		"size": 19795,
		"path": "../assets/routes-Bi-Z28Ao.js"
	},
	"/assets/terms-DeyhQyGV.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"aaf-kP+oUP3WgL2j92xKKAL5zdtU+50\"",
		"mtime": "2026-08-15T18:15:58.305Z",
		"size": 2735,
		"path": "../assets/terms-DeyhQyGV.js"
	},
	"/assets/workflow-shell-DCJGwqXT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"29e3-2zAlan0ctkaBGpqP64U8guuRBTs\"",
		"mtime": "2026-08-15T18:15:58.305Z",
		"size": 10723,
		"path": "../assets/workflow-shell-DCJGwqXT.js"
	},
	"/assets/styles-RZZMphg5.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"a665-4eizcYfg3tKN+CL52gxmApQE0hE\"",
		"mtime": "2026-08-15T18:15:58.305Z",
		"size": 42597,
		"path": "../assets/styles-RZZMphg5.css"
	},
	"/assets/notice-type-B-pr_m_y.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"47d39-UB74I+srmm9ZRQsN7uHkIE/ZRGc\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 294201,
		"path": "../assets/notice-type-B-pr_m_y.js"
	},
	"/assets/pricing-CPivCDF1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1044-q3fQEcWXxWdKfMBp5X1EzdxcnPs\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 4164,
		"path": "../assets/pricing-CPivCDF1.js"
	},
	"/assets/about-BdDtSlP_.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"14af-UdJsgrEkIx3qw8u/GSGwC05HLxY\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 5295,
		"path": "../assets/about-BdDtSlP_.js"
	},
	"/assets/_slug-B09H0Srx.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"26a7-/+QBVQXti1AtO9fzjrI1HJi77Pw\"",
		"mtime": "2026-08-15T18:15:58.304Z",
		"size": 9895,
		"path": "../assets/_slug-B09H0Srx.js"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"72-we7sgV+dZnE2HaxXEkdbUR1Xb+c\"",
		"mtime": "2026-08-15T18:15:59.061Z",
		"size": 114,
		"path": "../robots.txt"
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
