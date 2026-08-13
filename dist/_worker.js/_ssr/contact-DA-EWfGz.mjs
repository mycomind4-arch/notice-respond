import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-D6ORlrzP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-DA-EWfGz.js
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
							children: "Contact"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 font-serif text-4xl",
							children: "Get in touch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-muted-foreground",
							children: "Questions, feedback, or need help? We'd love to hear from you."
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "border-b border-rule/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto max-w-4xl px-6 py-12",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-8 md:grid-cols-[1fr_1.5fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "h-5 w-5 text-stamp",
										fill: "none",
										viewBox: "0 0 24 24",
										stroke: "currentColor",
										strokeWidth: 1.5,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											d: "M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 font-serif text-lg",
										children: "Email us"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: "For general questions and support:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 font-medium text-foreground",
										children: "support@noticerespond.app"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 envelope-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "h-5 w-5 text-stamp",
										fill: "none",
										viewBox: "0 0 24 24",
										stroke: "currentColor",
										strokeWidth: 1.5,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											d: "M12 6v6l4 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 font-serif text-lg",
										children: "Response time"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: "Typically within 1–2 business days."
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-xs text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Legal questions:" }), " Notice Respond is not a law firm and cannot provide legal advice."]
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "envelope-card p-6 md:p-8",
							children: submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "py-10 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stamp/10",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											className: "h-8 w-8 text-stamp",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											strokeWidth: 2,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M5 13l4 4L19 7"
											})
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-5 font-serif text-2xl",
										children: "Message sent!"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm text-muted-foreground",
										children: [
											"Thanks, ",
											form.name || "there",
											". We'll get back to you within 1–2 business days."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										className: "mt-6 inline-flex items-center rounded-full border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
										children: "Back to home"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-xl",
									children: "Send a message"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
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
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => form.email.trim() && form.message.trim() && setSubmitted(true),
											disabled: !form.email.trim() || !form.message.trim(),
											className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:transform-none disabled:shadow-none",
											children: "Send message →"
										})
									]
								})
							] })
						})]
					})
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { ContactPage as component };
