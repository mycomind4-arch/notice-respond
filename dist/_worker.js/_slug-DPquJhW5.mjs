import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { A as ArrowLeft, c as ShieldCheck, n as TriangleAlert, p as PackageCheck, w as Clock } from "./_libs/lucide-react.mjs";
import { i as SiteHeader, n as Route$4, r as SiteFooter } from "./_ssr/router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-DPquJhW5.js
var import_jsx_runtime = require_jsx_runtime();
function GuidePage() {
	const slug = Route$4.useParams().slug;
	const guide = {
		"understanding-irs-notices": {
			title: "Understanding IRS Notices: CP Letters Explained",
			category: "IRS Notices",
			readTime: "6 min",
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IRSContent, {})
		},
		"responding-to-court-summons": {
			title: "How to Respond to a Court Summons",
			category: "Court Responses",
			readTime: "5 min",
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CourtContent, {})
		},
		"certified-mail-for-deadlines": {
			title: "Why Certified Mail Matters for Deadline-Sensitive Responses",
			category: "Mailing",
			readTime: "4 min",
			content: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CertifiedMailContent, {})
		}
	}[slug];
	if (!guide) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "container py-20 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold text-slate-700",
					children: "Guide not found"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/resources",
					className: "btn-outline mt-6",
					children: "Back to resources"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "bg-white py-12 md:py-16 border-b border-warm-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "container max-w-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/resources",
								className: "inline-flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-600",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 15 }), " All guides"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-3 text-xs text-slate-400",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 text-3xl font-bold text-slate-700 md:text-4xl",
								style: { fontFamily: "var(--font-serif)" },
								children: guide.title
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "py-10 md:py-14",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "container max-w-2xl prose-content",
						children: guide.content
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					style: { background: "linear-gradient(135deg, #1e293b 0%, #131c2e 100%)" },
					className: "py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "container max-w-2xl text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold text-white",
								style: { fontFamily: "var(--font-serif)" },
								children: "Ready to respond?"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-white/60",
								children: "Start a guided workflow and get your response in the mail today."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/workflows/irs-notice",
								className: "btn-emerald mt-6",
								children: "Start now"
							})
						]
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function H2({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mt-10 text-xl font-bold text-slate-700",
		style: { fontFamily: "var(--font-serif)" },
		children
	});
}
function P({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm leading-7 text-slate-500",
		children
	});
}
function UL({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 space-y-2 pl-5 text-sm text-slate-500",
		style: { listStyle: "disc" },
		children
	});
}
function Callout({ children, type = "info" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `mt-6 ${type === "warning" ? "alert alert-warning" : type === "success" ? "alert alert-success" : "alert alert-info"}`,
		children
	});
}
function IRSContent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "The IRS sends millions of notices each year. Understanding which one you received and what it means is the first step toward responding effectively." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "Common IRS notice types" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CP14:" }), " Balance due — you owe taxes and need to pay or set up a payment plan"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CP2000:" }), " Proposed adjustment — the IRS found a discrepancy between your return and reported income"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CP501/CP503/CP504:" }), " Reminder/Intent to levy — escalating collection notices"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "LT11/LT1058:" }), " Final notice of intent to levy — serious collection action is imminent"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "CP90/CP244:" }), " Final notice of intent to levy and notice of your right to a hearing"] })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "warning",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 16,
					className: "inline mr-1"
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Important:" }),
				" IRS notices have response deadlines — typically 30–90 days. Ignoring a notice can lead to escalating collection actions, liens, or levies."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "How to read an IRS notice" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Every IRS notice includes: a notice number (top right), your tax year, a response deadline, and instructions. The notice number tells you what type of action the IRS is taking." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "Steps to respond" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Read the entire notice carefully" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Note the response deadline immediately" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Gather supporting documentation" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Write a clear response letter addressing each item" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Mail certified with return receipt for proof of timely delivery" })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "success",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, {
					size: 16,
					className: "inline mr-1"
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tip:" }),
				" Certified mail with return receipt gives you a signed card back — physical proof that the IRS received your response."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			className: "text-xs text-slate-300 mt-8",
			children: "This guide is for informational purposes only and does not constitute legal or tax advice."
		})
	] });
}
function CourtContent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "A court summons is a formal notice that you are being sued or required to appear in court. Responding properly and on time is critical — missing the deadline can result in a default judgment against you." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "What a summons includes" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The court name and case number" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The plaintiff (who is suing you) and defendant" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "The deadline to respond (often 20–30 days)" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Instructions for how to respond" })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "warning",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 16,
					className: "inline mr-1"
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Critical:" }),
				" Missing the response deadline can result in a default judgment — meaning the court rules against you automatically."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "Steps to respond" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Read the summons and complaint carefully" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Note the response deadline immediately" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Prepare a written answer addressing each allegation" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "File the answer with the court clerk by the deadline" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Mail certified with return receipt for proof of timely filing" })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, {
			size: 16,
			className: "inline mr-1"
		}), " Court filings have strict procedural requirements. If you are unsure how to respond, consult a qualified attorney."] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			className: "text-xs text-slate-300 mt-8",
			children: "This guide is for informational purposes only and does not constitute legal advice."
		})
	] });
}
function CertifiedMailContent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "When responding to a government notice — whether an IRS letter, a court summons, or an agency action — proof that your response arrived on time can be just as important as the response itself." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "What is certified mail?" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Certified Mail is a USPS service that provides a tracking number and a delivery record. With the return receipt option, you also receive a signed card confirming who accepted the delivery." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "Why it matters for deadline-sensitive responses" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Proof of timely submission:" }), " If an agency claims they didn't receive your response, your certified mail receipt proves otherwise"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Delivery date confirmation:" }), " The USPS delivery record shows exactly when your letter arrived"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Signature proof:" }), " With return receipt, you have a physical card showing who signed for the delivery"] })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "warning",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					size: 16,
					className: "inline mr-1"
				}),
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Don't rely on first-class mail alone" }),
				" for deadline-sensitive responses. While it includes tracking, it doesn't provide signature proof or a delivery record."
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			className: "text-xs text-slate-300 mt-8",
			children: "This guide is for informational purposes only and does not constitute legal advice."
		})
	] });
}
//#endregion
export { GuidePage as component };
