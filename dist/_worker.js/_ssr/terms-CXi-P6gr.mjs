import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-CXi-P6gr.js
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		title: "Acceptance of Terms",
		body: "By using Notice Respond, you agree to these Terms of Service."
	},
	{
		title: "Description of Service",
		body: "Notice Respond provides guided workflows for preparing responses to government notices and physical mailing services via USPS."
	},
	{
		title: "Not Legal Advice",
		body: "Notice Respond is not a law firm, CPA firm, or government agency. We do not provide legal or tax advice or representation. The AI assistant organizes information you provide but does not invent facts or draw legal conclusions."
	},
	{
		title: "User Responsibilities",
		body: "You are responsible for the accuracy of all information. You must review every draft before approving it for mailing."
	},
	{
		title: "Acceptable Use",
		body: "You agree not to use Notice Respond to send fraudulent or misleading correspondence."
	},
	{
		title: "Payment & Refunds",
		body: "Payment is processed via Stripe before mailing. Refunds are available if the mailing hasn't been submitted for processing."
	},
	{
		title: "Limitation of Liability",
		body: "Notice Respond is provided 'as is.' Our liability is limited to the cost of the mailing service."
	},
	{
		title: "Contact",
		body: "For questions about these terms, contact us at support@noticerespond.app."
	}
];
function TermsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-6 py-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-10 w-10 items-center justify-center rounded-lg border border-rule bg-paper-deep",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								className: "h-5 w-5 text-stamp",
								fill: "none",
								viewBox: "0 0 24 24",
								stroke: "currentColor",
								strokeWidth: 1.5,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									strokeLinecap: "round",
									strokeLinejoin: "round",
									d: "M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-3xl",
							children: "Terms of Service"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Last updated: August 2026"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Important:" }), " Notice Respond is not a law firm, CPA firm, or government agency and does not provide legal or tax advice."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 space-y-6",
						children: sections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl",
							children: s.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm leading-7 text-muted-foreground",
							children: s.body
						})] }, s.title))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { TermsPage as component };
