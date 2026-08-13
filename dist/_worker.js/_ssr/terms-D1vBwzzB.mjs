import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { b as FileText, l as ShieldAlert } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/terms-D1vBwzzB.js
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		title: "Acceptance of Terms",
		body: "By using Notice Respond, you agree to these Terms of Service. If you do not agree, do not use the service."
	},
	{
		title: "Description of Service",
		body: "Notice Respond provides guided workflows for preparing responses to government notices and physical mailing services via USPS."
	},
	{
		title: "Not Legal Advice",
		body: "Notice Respond is not a law firm, CPA firm, or government agency. We do not provide legal advice, legal representation, or tax advice. The AI assistant organizes information you provide but does not invent facts or draw legal conclusions. If you need legal advice, consult a qualified attorney."
	},
	{
		title: "User Responsibilities",
		body: "You are responsible for the accuracy of all information you provide. You must review every draft before approving it for mailing. You are responsible for verifying that the recipient address is correct and meeting all applicable deadlines."
	},
	{
		title: "Acceptable Use",
		body: "You agree not to use Notice Respond to send fraudulent, threatening, or harassing correspondence. You may not file documents you know to be false or misleading."
	},
	{
		title: "Payment & Refunds",
		body: "Payment is processed securely via Stripe before mailing. If your mailing has not been submitted for processing, you may request a full refund. Once a mailing is in process, refunds are not available."
	},
	{
		title: "Limitation of Liability",
		body: "Notice Respond is provided 'as is.' We are not liable for outcomes related to your correspondence, including denied claims, missed deadlines, or delivery failures beyond our control. Our liability is limited to the cost of the mailing service provided."
	},
	{
		title: "Contact",
		body: "For questions about these terms, contact us at support@noticerespond.app."
	}
];
function TermsPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-white py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									size: 20,
									className: "text-slate-700"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "text-3xl font-bold text-slate-700",
								style: { fontFamily: "var(--font-serif)" },
								children: "Terms of Service"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-slate-400",
								children: "Last updated: August 2026"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "alert alert-warning mt-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
								size: 18,
								className: "shrink-0"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Important:" }), " Notice Respond is not a law firm and does not provide legal advice."] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-8 space-y-6",
							children: sections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold text-slate-700",
								style: { fontFamily: "var(--font-serif)" },
								children: s.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-7 text-slate-400",
								children: s.body
							})] }, s.title))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { TermsPage as component };
