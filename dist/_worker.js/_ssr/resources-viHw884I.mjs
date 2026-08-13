import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as BookOpen, k as ArrowRight, w as Clock } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-viHw884I.js
var import_jsx_runtime = require_jsx_runtime();
var guides = [
	{
		slug: "understanding-irs-notices",
		title: "Understanding IRS Notices: CP Letters Explained",
		excerpt: "The IRS sends dozens of notice types. Here's what the most common ones mean and how to respond.",
		readTime: "6 min",
		category: "IRS Notices",
		icon: "📋"
	},
	{
		slug: "responding-to-court-summons",
		title: "How to Respond to a Court Summons",
		excerpt: "A court summons demands a timely response. Here's what to know about deadlines, formats, and proof of filing.",
		readTime: "5 min",
		category: "Court Responses",
		icon: "⚖️"
	},
	{
		slug: "certified-mail-for-deadlines",
		title: "Why Certified Mail Matters for Deadline-Sensitive Responses",
		excerpt: "When you're responding to a government notice, proof of timely delivery can be critical.",
		readTime: "4 min",
		category: "Mailing",
		icon: "📮"
	}
];
function ResourcesIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-white py-16 md:py-20 border-b border-warm-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container max-w-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "eyebrow",
							children: "Resources"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 text-4xl font-bold text-slate-700 md:text-5xl",
							style: { fontFamily: "var(--font-serif)" },
							children: "Guides for your responses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-slate-400",
							children: "Practical, plain-language guides about responding to government notices. Not legal advice — written to help you understand the process."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-12 md:py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container max-w-4xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5",
						children: guides.map((guide) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/resources/$slug",
							params: { slug: guide.slug },
							className: "card group p-6 transition hover:-translate-y-0.5 hover:shadow-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl",
									children: guide.icon
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-xs text-slate-400",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-emerald-600",
												children: guide.category
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex items-center gap-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { size: 12 }),
													" ",
													guide.readTime
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 text-xl font-semibold text-slate-700 group-hover:text-emerald-600 transition-colors",
											style: { fontFamily: "var(--font-serif)" },
											children: guide.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm leading-6 text-slate-400",
											children: guide.excerpt
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600",
											children: ["Read guide ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												size: 14,
												className: "transition-transform group-hover:translate-x-1"
											})]
										})
									]
								})]
							})
						}, guide.slug))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 rounded-xl border border-dashed border-warm-border bg-white p-6 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
							size: 24,
							className: "mx-auto text-slate-300"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 text-sm text-slate-400",
							children: [
								"More guides are being written. Have a topic you'd like covered? Let us know at ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold text-emerald-600",
									children: "support@noticerespond.app"
								}),
								"."
							]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { ResourcesIndex as component };
