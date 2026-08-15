import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/privacy-CGGbROCV.js
var import_jsx_runtime = require_jsx_runtime();
var sections = [
	{
		title: "Information We Collect",
		body: "We collect information you provide directly: your name, email address, mailing addresses, correspondence content, and uploaded documents."
	},
	{
		title: "How We Use Your Information",
		body: "Your information is used solely to provide the Notice Respond service. We never use your documents for marketing or training AI models."
	},
	{
		title: "Data Storage & Security",
		body: "All data is stored with industry-standard encryption. Documents are stored in private, access-controlled storage."
	},
	{
		title: "Document Handling",
		body: "Your documents are processed only to fulfill your mailing request. The final approved document is transmitted to our mailing partner (MailMyPDF) for printing and USPS delivery."
	},
	{
		title: "Third-Party Services",
		body: "We use MailMyPDF (mailing fulfillment), Stripe (payment processing), and USPS (delivery)."
	},
	{
		title: "Your Rights",
		body: "You have the right to access, export, and delete your data at any time."
	},
	{
		title: "Data Retention",
		body: "Mailing records are retained for proof-of-submission documentation. Account data is deleted within 30 days of your deletion request."
	},
	{
		title: "Contact",
		body: "For privacy questions, contact us at privacy@noticerespond.app."
	}
];
function PrivacyPage() {
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
									d: "M12 3l8 4v6c0 5-3.5 7-8 8-4.5-1-8-3-8-8V7l8-4zM9 12l2 2 4-4"
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-serif text-3xl",
							children: "Privacy Policy"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Last updated: August 2026"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground",
						children: "Your documents and correspondence details are sensitive. This policy explains exactly how we handle them."
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
export { PrivacyPage as component };
