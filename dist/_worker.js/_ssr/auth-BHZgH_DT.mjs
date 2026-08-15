import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-BHZgH_DT.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [submitted, setSubmitted] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "mx-auto max-w-4xl px-6 py-16",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid overflow-hidden rounded-2xl border border-rule md:grid-cols-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-8 md:p-10",
						style: { background: "linear-gradient(135deg, oklch(0.25 0.04 240) 0%, oklch(0.2 0.035 240) 100%)" },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "postmark w-fit",
								style: {
									borderColor: "rgba(16,185,129,.2)",
									color: "oklch(0.72 0.08 160)",
									background: "rgba(16,185,129,.05)"
								},
								children: "Notice Respond"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-8 font-serif text-3xl text-white",
								children: "Your responses, organized and sent."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm leading-7 text-white/60",
								children: "Create an account to save drafts, track responses, and keep a permanent record of your correspondence."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-8 space-y-3",
								children: [
									"Save and resume workflows",
									"Track all responses in one place",
									"Keep proof of timely submission",
									"Re-use recipient addresses"
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-2 text-sm text-white/70",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "h-4 w-4 text-stamp-soft",
										fill: "none",
										viewBox: "0 0 24 24",
										stroke: "currentColor",
										strokeWidth: 2,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											d: "M5 13l4 4L19 7"
										})
									}), item]
								}, item))
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col justify-center bg-card p-8 md:p-10",
						children: submitted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
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
									children: "You're on the list!"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-3 text-sm text-muted-foreground",
									children: [
										"We'll notify you at ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: email
										}),
										" when accounts launch."
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
								className: "font-serif text-2xl",
								children: "Authentication coming soon"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => email.trim() && setSubmitted(true),
								disabled: !email.trim(),
								className: "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:transform-none disabled:shadow-none",
								children: "Notify me →"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-5 text-xs text-muted-foreground",
								children: [
									"By continuing, you agree to our ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/terms",
										className: "text-stamp hover:underline",
										children: "Terms"
									}),
									" and ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/privacy",
										className: "text-stamp hover:underline",
										children: "Privacy Policy"
									}),
									"."
								]
							})
						] })
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { AuthPage as component };
