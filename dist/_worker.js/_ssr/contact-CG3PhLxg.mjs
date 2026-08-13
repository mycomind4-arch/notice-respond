import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as CircleCheck, g as Mail, k as ArrowRight, m as MessageSquare, w as Clock } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-CG3PhLxg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ContactPage() {
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		email: "",
		subject: "",
		message: ""
	});
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
							children: "Contact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-3 text-4xl font-bold text-slate-700 md:text-5xl",
							style: { fontFamily: "var(--font-serif)" },
							children: "Get in touch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-slate-400",
							children: "Questions, feedback, or partnership ideas? We'd love to hear from you."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-12 md:py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "container max-w-4xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-8 md:grid-cols-[1fr_1.5fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, {
										size: 22,
										className: "text-emerald-500"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 font-semibold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Email us"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-slate-400",
										children: "For general questions and support:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-semibold text-slate-700",
										children: "support@noticerespond.app"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
										size: 22,
										className: "text-emerald-500"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 font-semibold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Response time"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-slate-400",
										children: "We typically respond within 1–2 business days."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, {
										size: 22,
										className: "text-emerald-500"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 font-semibold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "What we can help with"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
										className: "mt-2 space-y-1.5 text-sm text-slate-400",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Mailing status and tracking" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Billing and refund questions" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Product feedback and feature requests" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "· Partnership and API inquiries" })
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 alert alert-warning",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Legal questions:" }), " Notice Respond is not a law firm and cannot provide legal advice."]
								})
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "card p-6 md:p-8",
							children: submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center py-10",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
											size: 32,
											className: "text-emerald-600"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-5 text-xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Message sent!"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm text-slate-400",
										children: [
											"Thanks for reaching out, ",
											form.name || "there",
											". We'll get back to you within 1–2 business days."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										className: "btn-outline mt-6",
										children: "Back to home"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-xl font-bold text-slate-700",
									style: { fontFamily: "var(--font-serif)" },
									children: "Send a message"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-slate-400",
									children: "Fill out the form and we'll get back to you."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "input-label",
											children: "Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "input-field",
											value: form.name,
											onChange: (e) => setForm({
												...form,
												name: e.target.value
											}),
											placeholder: "Your name"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "input-label",
											children: "Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "input-field",
											type: "email",
											value: form.email,
											onChange: (e) => setForm({
												...form,
												email: e.target.value
											}),
											placeholder: "you@example.com"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "input-label",
											children: "Subject"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "input-field",
											value: form.subject,
											onChange: (e) => setForm({
												...form,
												subject: e.target.value
											}),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "",
													children: "Select a topic..."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "support",
													children: "Support question"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "billing",
													children: "Billing or refund"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "feedback",
													children: "Product feedback"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "partnership",
													children: "Partnership / API"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "other",
													children: "Other"
												})
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
											className: "input-label",
											children: "Message"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
											className: "input-field min-h-32",
											value: form.message,
											onChange: (e) => setForm({
												...form,
												message: e.target.value
											}),
											placeholder: "How can we help?"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											onClick: () => form.email.trim() && form.message.trim() && setSubmitted(true),
											disabled: !form.email.trim() || !form.message.trim(),
											className: "btn-primary w-full justify-center",
											children: ["Send message ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
										})
									]
								})
							] })
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { ContactPage as component };
