import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-D6ORlrzP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-1d9gQGpH.js
var import_jsx_runtime = require_jsx_runtime();
var guides = [
	{
		slug: "understanding-irs-notices",
		title: "Understanding IRS Notices: CP Letters Explained",
		excerpt: "The IRS sends dozens of notice types. Here's what the most common ones mean and how to respond.",
		readTime: "6 min",
		category: "IRS Notices"
	},
	{
		slug: "responding-to-court-summons",
		title: "How to Respond to a Court Summons",
		excerpt: "A court summons demands a timely response. Here's what to know about deadlines, formats, and proof of filing.",
		readTime: "5 min",
		category: "Court Responses"
	},
	{
		slug: "certified-mail-for-deadlines",
		title: "Why Certified Mail Matters for Deadline-Sensitive Responses",
		excerpt: "When you're responding to a government notice, proof of timely delivery can be critical.",
		readTime: "4 min",
		category: "Mailing"
	}
];
function ResourcesIndex() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-rule/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-2xl px-6 py-16",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "postmark w-fit",
							children: "Resources"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-serif text-4xl md:text-5xl",
							children: "Guides for your responses"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: "Practical, plain-language guides about responding to government notices. Not legal advice — written to help you understand the process."
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-rule/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-4xl px-6 py-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-5",
						children: guides.map((guide) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/resources/$slug",
							params: { slug: guide.slug },
							className: "envelope-card envelope-card-hover block p-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-rule bg-paper-deep",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "h-6 w-6 text-stamp",
										fill: "none",
										viewBox: "0 0 24 24",
										stroke: "currentColor",
										strokeWidth: 1.5,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											d: "M5 3h10l4 4v14H5V3zM9 7h6M9 11h6M9 15h4"
										})
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-stamp",
													children: guide.category
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [guide.readTime, " read"] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "mt-2 font-serif text-xl",
											children: guide.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 text-sm leading-6 text-muted-foreground",
											children: guide.excerpt
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-3 inline-flex items-center gap-1 text-sm font-medium text-stamp",
											children: ["Read guide ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
												className: "h-4 w-4",
												fill: "none",
												viewBox: "0 0 24 24",
												stroke: "currentColor",
												strokeWidth: 1.5,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
													strokeLinecap: "round",
													strokeLinejoin: "round",
													d: "M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
												})
											})]
										})
									]
								})]
							})
						}, guide.slug))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 rounded-md border border-dashed border-rule bg-paper-deep/30 p-6 text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [
								"More guides are being written. Have a topic you'd like covered? Let us know at ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-stamp",
									children: "support@noticerespond.app"
								}),
								"."
							]
						})
					})]
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { ResourcesIndex as component };
