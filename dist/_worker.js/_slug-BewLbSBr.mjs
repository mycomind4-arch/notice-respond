import { n as require_jsx_runtime } from "./_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader, t as Route$4 } from "./_ssr/router-D6ORlrzP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_slug-BewLbSBr.js
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
	if (!guide) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-lg px-6 py-32 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "postmark mx-auto w-fit",
						children: "404"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-6 font-serif text-3xl",
						children: "Guide not found"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/resources",
						className: "mt-6 inline-flex items-center rounded-full border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
						children: "Back to resources"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-b border-rule/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-2xl px-6 py-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/resources",
								className: "inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-stamp transition-colors",
								children: "← All guides"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 flex items-center gap-3 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-medium text-stamp",
										children: guide.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [guide.readTime, " read"] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-serif text-3xl md:text-4xl",
								children: guide.title
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-b border-rule/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto max-w-2xl px-6 py-10 prose-content",
						children: guide.content
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-b border-rule/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mx-auto max-w-6xl px-6 py-20 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "postmark mx-auto w-fit",
								children: "Ready to respond"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-4 font-serif text-4xl",
								children: "Start your response today."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/workflows/irs-notice",
								className: "mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5",
								children: ["Respond to a notice ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
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
					})
				})
			] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function H2({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mt-10 text-xl font-bold text-foreground",
		style: { fontFamily: "var(--font-serif)" },
		children
	});
}
function P({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "mt-4 text-sm leading-7 text-muted-foreground",
		children
	});
}
function UL({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-4 space-y-2 pl-5 text-sm text-muted-foreground",
		style: { listStyle: "disc" },
		children
	});
}
function Callout({ children, type = "info" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: `mt-6 rounded-md p-4 text-sm ${type === "warning" ? "border border-rule/70 bg-stamp/5 text-ink-soft" : type === "success" ? "border border-rule/70 bg-paper-deep/40 text-ink-soft" : "border border-rule/70 bg-paper-deep/40 text-ink-soft"}`,
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Important:" }), " IRS notices have response deadlines — typically 30–90 days. Ignoring a notice can lead to escalating collection actions, liens, or levies."]
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
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tip:" }), " Certified mail with return receipt gives you a signed card back — physical proof that the IRS received your response."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			className: "text-xs mt-8",
			children: "This guide is for informational purposes only and does not constitute legal or tax advice."
		})
	] });
}
function CourtContent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Receiving a court summons can be stressful, but understanding the process helps you respond effectively and on time." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "What is a court summons?" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "A summons is a formal court document that requires you to respond to a complaint within a specific timeframe. The deadline varies by jurisdiction but is often 20–30 days." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "warning",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Important:" }), " Missing the response deadline can result in a default judgment against you. If you're unsure about your situation, consult a qualified attorney."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "What to do when you receive a summons" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Read the entire document carefully" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Note the court name, case number, and response deadline" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Identify what the complaint alleges" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Prepare a written response addressing each allegation" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "File your response with the court by the deadline" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "Keep proof of filing — certified mail provides a USPS record" })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "What your response should include" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "A proper response typically includes: the court name, case number, your name, a response to each numbered allegation (admit, deny, or lack knowledge), and any affirmative defenses." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "success",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tip:" }), " Filing by certified mail gives you proof of timely submission — critical for court deadlines."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			className: "text-xs mt-8",
			children: "This guide is for informational purposes only and does not constitute legal advice."
		})
	] });
}
function CertifiedMailContent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "When responding to a government notice, how you mail your response can be just as important as what it says. Certified mail provides proof that your response was sent and received — which can be critical for deadlines." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "What is Certified Mail?" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, { children: "Certified Mail is a USPS service that provides a mailing receipt and electronic verification that an item was delivered. For an additional fee, you can add a Return Receipt that provides a signed card confirming delivery." }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "Why it matters for notices" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(UL, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Proof of timely mailing:" }), " The USPS postmark and receipt confirm when you mailed your response"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Proof of delivery:" }), " Electronic delivery confirmation shows the item was received"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Signature verification:" }), " Return Receipt provides a physical signature card"] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Mailing record:" }), " The USPS retains records that can be retrieved if needed"] })
		] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Callout, {
			type: "info",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Note:" }), " Certified mail adds a surcharge but can be essential for deadline-sensitive correspondence. The peace of mind is often worth the cost."]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(H2, { children: "Standard vs. Certified vs. Registered" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Standard mail:" }), " Cheapest option, includes tracking, but no proof of delivery or signature."] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Certified mail:" }), " Adds delivery confirmation and signature tracking. Recommended for most government responses."] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(P, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Registered mail:" }), " Highest security, insured, signature required. Used for sensitive or high-value documents."] }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(P, {
			className: "text-xs mt-8",
			children: "This guide is for informational purposes only and does not constitute legal advice."
		})
	] });
}
//#endregion
export { GuidePage as component };
