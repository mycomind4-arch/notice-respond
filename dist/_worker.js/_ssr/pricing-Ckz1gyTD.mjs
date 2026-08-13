import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as Check, a as Stamp, c as ShieldCheck, g as Mail, k as ArrowRight, p as PackageCheck, s as Shield, w as Clock } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pricing-Ckz1gyTD.js
var import_jsx_runtime = require_jsx_runtime();
var tiers = [
	{
		type: "First-Class",
		price: "$3.99",
		desc: "Standard delivery for non-urgent responses",
		features: [
			"3–5 business days",
			"USPS tracking included",
			"Professional printing & envelope",
			"Mailing record retained"
		],
		icon: Mail,
		featured: false
	},
	{
		type: "Certified",
		price: "$8.99",
		desc: "Trackable delivery with signature proof",
		features: [
			"3–5 business days",
			"Signature tracking",
			"Proof of delivery",
			"Mailing record retained"
		],
		icon: PackageCheck,
		featured: false
	},
	{
		type: "Certified + Return Receipt",
		price: "$12.99",
		desc: "Signed return receipt card mailed back to you",
		features: [
			"3–5 business days",
			"All Certified features",
			"Signed return receipt card",
			"Recommended for notice responses"
		],
		icon: ShieldCheck,
		featured: true
	},
	{
		type: "Registered",
		price: "$15.99",
		desc: "Highest security for sensitive documents",
		features: [
			"Insured delivery",
			"Signature required",
			"Highest security handling",
			"Mailing record retained"
		],
		icon: Stamp,
		featured: false
	}
];
var faqs = [
	{
		q: "Is there a subscription?",
		a: "No. You pay per mailing — no monthly fee, no commitment. Prices include everything: printing, paper, envelope, and postage."
	},
	{
		q: "What payment methods do you accept?",
		a: "All major credit and debit cards via Stripe. Checkout happens securely before your letter is mailed."
	},
	{
		q: "Can I get a refund?",
		a: "If your mailing hasn't been submitted for processing yet, you can request a full refund. Once it's in the mail, refunds are not available."
	},
	{
		q: "Do you offer bulk pricing?",
		a: "For high-volume senders, contact us about enterprise pricing and API access."
	}
];
function PricingPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-white py-16 md:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mx-auto max-w-2xl text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "eyebrow",
									children: "Simple, transparent pricing"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-3 text-4xl font-bold text-slate-700 md:text-5xl",
									style: { fontFamily: "var(--font-serif)" },
									children: "Pay per mailing. No subscription."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-slate-400",
									children: "Every price includes printing, paper, envelope, postage, and tracking. You only pay when you send."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4",
							children: tiers.map(({ type, price, desc, features, icon: Icon, featured }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `card p-6 ${featured ? "ring-2 ring-emerald-400" : ""}`,
								children: [
									featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "badge badge-emerald mb-3",
										children: "Recommended"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
											size: 24,
											className: "text-slate-700"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-4 text-lg font-semibold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: type
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-slate-400",
										children: desc
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 text-4xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: price
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-slate-300",
										children: "per mailing"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-5 space-y-2",
										children: features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-2 text-sm text-slate-500",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
													size: 15,
													className: "text-emerald-500"
												}),
												" ",
												f
											]
										}, f))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/workflows/irs-notice",
										className: `mt-6 w-full justify-center text-center ${featured ? "btn-emerald" : "btn-primary"}`,
										children: ["Start ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
									})
								]
							}, type))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-400",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										size: 16,
										className: "text-emerald-500"
									}), " 3–5 business days"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
										size: 16,
										className: "text-emerald-500"
									}), " Bank-grade encryption"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
										size: 16,
										className: "text-emerald-500"
									}), " Mailing record retained"]
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-cream py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container max-w-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-bold text-slate-700",
						style: { fontFamily: "var(--font-serif)" },
						children: "Pricing questions"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 space-y-3",
						children: faqs.map(({ q, a }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-semibold text-slate-700",
								children: q
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm leading-6 text-slate-400",
								children: a
							})]
						}, q))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { PricingPage as component };
