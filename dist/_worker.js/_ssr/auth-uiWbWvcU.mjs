import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as CircleCheck, k as ArrowRight, x as FileCheck } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-uiWbWvcU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const [tab, setTab] = (0, import_react.useState)("signup");
	const [email, setEmail] = (0, import_react.useState)("");
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-12 md:py-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "container max-w-4xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid overflow-hidden rounded-2xl border border-warm-border md:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-8 md:p-10",
							style: { background: "linear-gradient(135deg, #1e293b 0%, #131c2e 100%)" },
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex h-9 w-9 items-center justify-center rounded-lg bg-white/15",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, {
											size: 18,
											className: "text-emerald-400"
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-lg font-bold text-white",
										style: { fontFamily: "var(--font-serif)" },
										children: "Notice Respond"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "mt-8 text-2xl font-bold text-white",
									style: { fontFamily: "var(--font-serif)" },
									children: "Your responses, organized and sent."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-sm leading-7 text-white/60",
									children: "Create an account to save your drafts, track mailings, and keep a permanent record of what you sent."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-8 space-y-3",
									children: [
										"Save and resume workflows",
										"Track all your mailings in one place",
										"Keep proof of delivery records",
										"Re-use recipient addresses"
									].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-2 text-sm text-white/70",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
												size: 16,
												className: "text-emerald-400"
											}),
											" ",
											item
										]
									}, item))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-col justify-center bg-white p-8 md:p-10",
							children: submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
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
										children: "You're on the list!"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-3 text-sm text-slate-400",
										children: [
											"We'll notify you at ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-slate-700",
												children: email
											}),
											" when accounts launch."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/",
										className: "btn-outline mt-6",
										children: "Back to home"
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-1 rounded-xl bg-slate-50 p-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setTab("signup"),
									className: `flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "signup" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`,
									children: "Get notified"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setTab("signin"),
									className: `flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "signin" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`,
									children: "Sign in"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6",
								children: [tab === "signup" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Authentication coming soon"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-slate-400",
										children: "Enter your email to be notified when accounts launch."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "input-label mt-5",
										children: "Email address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "input-field",
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										placeholder: "you@example.com"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => email.trim() && setSubmitted(true),
										disabled: !email.trim(),
										className: "btn-emerald mt-5 w-full justify-center",
										children: ["Notify me ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
									})
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Welcome back"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-slate-400",
										children: "Account sign-in is coming soon. Enter your email to be notified."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										className: "input-label mt-5",
										children: "Email address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										className: "input-field",
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										placeholder: "you@example.com"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: () => email.trim() && setSubmitted(true),
										disabled: !email.trim(),
										className: "btn-primary mt-5 w-full justify-center",
										children: ["Notify me ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
									})
								] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-5 text-xs text-slate-300",
									children: [
										"By continuing, you agree to our ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/terms",
											className: "text-emerald-600 hover:underline",
											children: "Terms"
										}),
										" and ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
											to: "/privacy",
											className: "text-emerald-600 hover:underline",
											children: "Privacy Policy"
										}),
										"."
									]
								})]
							})] })
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { AuthPage as component };
