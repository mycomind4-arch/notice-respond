import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/faq-CpjweNu_.js
var import_jsx_runtime = require_jsx_runtime();
var categories = [
	{
		name: "Using Notice Respond",
		questions: [
			{
				q: "Is this legal advice?",
				a: "No. Notice Respond is a correspondence tool, not a law firm, CPA firm, or government agency. We help you prepare and send documents — we do not provide legal or tax advice, and the AI assistant never invents facts or legal conclusions."
			},
			{
				q: "What types of notices can I respond to?",
				a: "IRS notices and letters, court summonses and complaints, regulatory agency actions, licensing board decisions, FOIA determinations, and appeals of denied claims or rulings."
			},
			{
				q: "How does the drafting work?",
				a: "You provide your facts and objective in your own words. The AI assistant organizes that information into a professional draft. Everything is editable, and the AI never invents facts."
			},
			{
				q: "Do I need to review the draft?",
				a: "Yes. Before anything is mailed, you must confirm a review checklist and approve the final document."
			},
			{
				q: "Can I edit the draft?",
				a: "Absolutely. The draft is fully editable — change anything, add paragraphs, or start over."
			}
		]
	},
	{
		name: "Mailing & Delivery",
		questions: [
			{
				q: "How does physical mail work?",
				a: "Your final document is printed, placed in a business envelope, and mailed via USPS. You never need a printer."
			},
			{
				q: "How long does delivery take?",
				a: "Standard mail typically arrives in 3–7 business days. Certified follows the same timeline with added tracking."
			},
			{
				q: "Can I track my letter?",
				a: "Yes. Every mailing includes a USPS tracking number. Certified mail adds signature tracking and proof of delivery."
			},
			{
				q: "What's proof of timely submission?",
				a: "Certified mail provides a USPS delivery record — your proof that the response was mailed on time."
			}
		]
	},
	{
		name: "Privacy & Security",
		questions: [
			{
				q: "Is my data secure?",
				a: "All documents and personal information are stored with encryption. We never sell your data or use it for marketing."
			},
			{
				q: "Can I delete my data?",
				a: "Yes. You can request full deletion at any time."
			},
			{
				q: "Do you train AI on my data?",
				a: "No. We never use your documents or correspondence content to train AI models."
			}
		]
	},
	{
		name: "Legal & Scope",
		questions: [{
			q: "Is Notice Respond a law firm?",
			a: "No. Notice Respond is a document preparation and mailing service. We do not provide legal advice or representation."
		}, {
			q: "Can this replace an attorney?",
			a: "No. If your case involves complex legal questions, consult a qualified attorney."
		}]
	}
];
function FAQPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-rule/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-4xl px-6 py-20",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "postmark w-fit",
							children: "FAQ"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-serif text-4xl md:text-5xl",
							children: "Frequently asked questions"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: "Everything you need to know about how Notice Respond works."
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-rule/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-3xl px-6 py-16",
					children: categories.map((cat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-serif text-xl",
							children: cat.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 divide-y divide-rule/70 border-y border-rule/70",
							children: cat.questions.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("details", {
								className: "group py-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("summary", {
									className: "flex cursor-pointer items-center justify-between list-none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-serif text-lg",
										children: item.q
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-stamp transition-transform group-open:rotate-45",
										children: "＋"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-muted-foreground",
									children: item.a
								})]
							}, item.q))
						})]
					}, cat.name))
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { FAQPage as component };
