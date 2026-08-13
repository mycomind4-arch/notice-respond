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
		"mtime": "2026-08-13T06:21:18.859Z",
		"size": 1209,
		"path": "../llms.txt"
	},
	"/robots.txt": {
		"type": "text/plain; charset=utf-8",
		"etag": "\"72-we7sgV+dZnE2HaxXEkdbUR1Xb+c\"",
		"mtime": "2026-08-13T06:21:18.859Z",
		"size": 114,
		"path": "../robots.txt"
	},
	"/sitemap.xml": {
		"type": "application/xml",
		"etag": "\"808-yncw3R8KkSb4dZ8B4IwlIVDT0u0\"",
		"mtime": "2026-08-13T06:21:18.859Z",
		"size": 2056,
		"path": "../sitemap.xml"
	},
	"/assets/_slug-Cr3U8kwU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2342-GYbP2KGUlPMFGzJVjEGLc7ooGhk\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 9026,
		"path": "../assets/_slug-Cr3U8kwU.js"
	},
	"/assets/about-ovsLV5Qb.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1460-jT8J0ndYgY+F+FgTUlWoDWBxZ/M\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 5216,
		"path": "../assets/about-ovsLV5Qb.js"
	},
	"/assets/agency-action-B1NcLoBm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3e83-hnwsJL6N9O7oaHweZhk/Vj59mZk\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 16003,
		"path": "../assets/agency-action-B1NcLoBm.js"
	},
	"/assets/auth-BZE3cpm5.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1265-MZfTB7E7GzMAVLTDj021xkxypss\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 4709,
		"path": "../assets/auth-BZE3cpm5.js"
	},
	"/assets/check-C4mPG8AP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"71-B0qh3vbnFvS5XREGNrTNt3Dc1z0\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 113,
		"path": "../assets/check-C4mPG8AP.js"
	},
	"/assets/chevron-down-fhpQ-u5W.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"75-KQ2aadFHT/xdzNHq9XDTTNzUAeM\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 117,
		"path": "../assets/chevron-down-fhpQ-u5W.js"
	},
	"/assets/circle-check-mGSNDHnT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a7-0HEYaarV0FNn3gnEt3HRSoN0Pts\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 167,
		"path": "../assets/circle-check-mGSNDHnT.js"
	},
	"/assets/clock-BJyrg_SL.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"9e-krVYusm+B4vR5loDhbsJUHMRv7M\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 158,
		"path": "../assets/clock-BJyrg_SL.js"
	},
	"/assets/contact-D2YjZR8l.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"154a-4FsZlwRKGZX+tlh8PDzIvoSLL5A\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 5450,
		"path": "../assets/contact-D2YjZR8l.js"
	},
	"/assets/court-summons-BrtLepGU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4084-UIKoFwP16UcQXWFmerAeAyzw1C8\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 16516,
		"path": "../assets/court-summons-BrtLepGU.js"
	},
	"/assets/dashboard-DcoRn3zs.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1bed-CAWYHI//0TaY7EwqbScnu4U6MNE\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 7149,
		"path": "../assets/dashboard-DcoRn3zs.js"
	},
	"/assets/faq-BrtXnWay.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1439-FIuaVNi8yw9pwXEiVCZ4zb8QMXM\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 5177,
		"path": "../assets/faq-BrtXnWay.js"
	},
	"/assets/file-appeal-BLMlpXV3.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"3f37-dt2tuhczalewqKsCeyLVXKxkUBY\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 16183,
		"path": "../assets/file-appeal-BLMlpXV3.js"
	},
	"/assets/file-text-ml0sJcZm.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"176-hOmaNShiZ32shBtJ5ZLkWZvVcYQ\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 374,
		"path": "../assets/file-text-ml0sJcZm.js"
	},
	"/assets/file-up-DEU6GQeQ.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156-9TRudKm2OKQ9JwxNuRT157+XI2A\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 342,
		"path": "../assets/file-up-DEU6GQeQ.js"
	},
	"/assets/irs-notice-EHgsNKDf.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"4283-EpCLr0tQEGmcBWOvr9b8LqC2pe4\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 17027,
		"path": "../assets/irs-notice-EHgsNKDf.js"
	},
	"/assets/lock-Cw85OwLe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c3-mnteA89oh+5KIMp6DgpN5RjHTXU\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 195,
		"path": "../assets/lock-Cw85OwLe.js"
	},
	"/assets/mail-bfK-09Wu.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"ca-rOQgJLKaT4uJsRIYNTOHNxHCrPg\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 202,
		"path": "../assets/mail-bfK-09Wu.js"
	},
	"/assets/package-check-k2IyFNYT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"19f-HH5YAaysDuhnwibasHxSpLdIMQk\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 415,
		"path": "../assets/package-check-k2IyFNYT.js"
	},
	"/assets/pricing-CNp8uBsU.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"12a3-6TZdKhYcmUTwkxHyHAK3S/DZv/o\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 4771,
		"path": "../assets/pricing-CNp8uBsU.js"
	},
	"/assets/privacy-hpHraCau.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1043-DZ9Udm68DFUsEj6hj+Vm3fWDYRo\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 4163,
		"path": "../assets/privacy-hpHraCau.js"
	},
	"/assets/index-CizJFeP2.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5670d-GW6z+ZnnEepW+sR8dsG1zpG4JJg\"",
		"mtime": "2026-08-13T06:21:18.169Z",
		"size": 354061,
		"path": "../assets/index-CizJFeP2.js"
	},
	"/assets/resources-DOQKtRF6.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"e06-AaIviY5+aCN24ZBR0OB0ttabXBc\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 3590,
		"path": "../assets/resources-DOQKtRF6.js"
	},
	"/assets/shield-alert-BbUMkaUv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"156-OjCCTGt7CS3HEJLYZEkGgQBFcco\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 342,
		"path": "../assets/shield-alert-BbUMkaUv.js"
	},
	"/assets/sparkles-Cn4Ygp20.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"1e3-FeuuZPovrzEYc9YSNyU+43P1smI\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 483,
		"path": "../assets/sparkles-Cn4Ygp20.js"
	},
	"/assets/routes-gc4ZUHTT.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5751-He8aYGBSL5h7h3qfPuoDTAqpkFo\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 22353,
		"path": "../assets/routes-gc4ZUHTT.js"
	},
	"/assets/shield-check-Bqy09VsG.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"135-Zys3aFCs1QV5wc3bB4Cqxw7+bng\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 309,
		"path": "../assets/shield-check-Bqy09VsG.js"
	},
	"/assets/stamp-B9MkFKd1.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"136-nPM/TfEua+WuhMIQfCCU8aYK1Tc\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 310,
		"path": "../assets/stamp-B9MkFKd1.js"
	},
	"/assets/terms-DRL_pyYH.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"c7f-PqFFOvfz2PlhZBgcA2Tszv4e/VM\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 3199,
		"path": "../assets/terms-DRL_pyYH.js"
	},
	"/assets/workflows-CRlJDl2E.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"853-qrxH2StvGCcPS8f2Y8WT3NXoiVk\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 2131,
		"path": "../assets/workflows-CRlJDl2E.js"
	},
	"/assets/styles-yA-Rt9lr.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"7bd0-VssKJHBBOo8Bhg7uOB2b/IH/1dI\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 31696,
		"path": "../assets/styles-yA-Rt9lr.css"
	},
	"/assets/triangle-alert-4bnYTuGP.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"16e-JBpACh6JU+WHUqZmjdpxYobIwVA\"",
		"mtime": "2026-08-13T06:21:18.170Z",
		"size": 366,
		"path": "../assets/triangle-alert-4bnYTuGP.js"
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
