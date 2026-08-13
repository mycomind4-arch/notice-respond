import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-D6ORlrzP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BebArRx9.js
var import_jsx_runtime = require_jsx_runtime();
var stats = [
	{
		label: "Total responses",
		value: "5"
	},
	{
		label: "In transit",
		value: "1"
	},
	{
		label: "Delivered",
		value: "4"
	},
	{
		label: "Avg. delivery",
		value: "4.2 days"
	}
];
var mailings = [
	{
		id: "NR-2026-0052",
		type: "IRS Notice Response",
		recipient: "IRS — Department of the Treasury",
		date: "Aug 11, 2026",
		status: "in_transit",
		mailType: "Certified"
	},
	{
		id: "NR-2026-0044",
		type: "Court Summons Response",
		recipient: "Superior Court of California",
		date: "Aug 2, 2026",
		status: "delivered",
		mailType: "Certified"
	},
	{
		id: "NR-2026-0038",
		type: "Agency Action Response",
		recipient: "State Licensing Board",
		date: "Jul 20, 2026",
		status: "delivered",
		mailType: "Registered"
	},
	{
		id: "NR-2026-0031",
		type: "Appeal Filing",
		recipient: "Social Security Administration",
		date: "Jul 8, 2026",
		status: "delivered",
		mailType: "Certified"
	},
	{
		id: "NR-2026-0024",
		type: "IRS Notice Response",
		recipient: "IRS — Austin, TX",
		date: "Jun 15, 2026",
		status: "delivered",
		mailType: "Certified"
	}
];
var statusBadge = {
	in_transit: "text-stamp",
	delivered: "text-emerald-700"
};
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-5xl px-6 py-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "postmark w-fit",
								children: "My Mailings"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-serif text-4xl",
								children: "Your response records"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Track your notice responses and delivery records."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/workflows/irs-notice",
							className: "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5",
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
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid grid-cols-2 gap-4 md:grid-cols-4",
						children: stats.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "envelope-card p-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-xs uppercase tracking-widest text-muted-foreground",
								children: s.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-2xl font-serif",
								children: s.value
							})]
						}, s.label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 envelope-card overflow-hidden",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-between border-b border-rule/60 px-5 py-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-lg",
									children: "Recent responses"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "hidden md:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "bg-paper-deep/30 text-left text-xs uppercase tracking-wider text-muted-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-5 py-3 font-medium",
												children: "Reference"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-5 py-3 font-medium",
												children: "Type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-5 py-3 font-medium",
												children: "Recipient"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-5 py-3 font-medium",
												children: "Date"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-5 py-3 font-medium",
												children: "Mail type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-5 py-3 font-medium",
												children: "Status"
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-rule/40",
										children: mailings.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-paper-deep/20 transition-colors cursor-pointer",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-5 py-3.5 font-mono text-xs font-medium text-foreground",
													children: m.id
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-5 py-3.5 text-ink-soft",
													children: m.type
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-5 py-3.5 text-ink-soft",
													children: m.recipient
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-5 py-3.5 text-muted-foreground",
													children: m.date
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-5 py-3.5 text-muted-foreground",
													children: m.mailType
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-5 py-3.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `font-mono text-xs ${statusBadge[m.status]}`,
														children: m.status
													})
												})
											]
										}, m.id))
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "divide-y divide-rule/40 md:hidden",
								children: mailings.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-xs font-medium text-foreground",
												children: m.id
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `font-mono text-xs ${statusBadge[m.status]}`,
												children: m.status
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2 font-medium text-foreground",
											children: m.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-sm text-muted-foreground",
											children: m.recipient
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-2 flex items-center gap-3 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.date }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: m.mailType })
											]
										})
									]
								}, m.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 envelope-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									className: "h-5 w-5 text-stamp",
									fill: "none",
									viewBox: "0 0 24 24",
									stroke: "currentColor",
									strokeWidth: 1.5,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										d: "M22 12h-4l-3 9L9 3l-3 9H2"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-lg",
									children: "Latest tracking"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "NR-2026-0052 · Certified Mail"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-4",
								children: [
									{
										date: "Aug 12, 9:30 AM",
										event: "Mailed from Los Angeles, CA",
										done: true
									},
									{
										date: "Aug 12, 2:15 PM",
										event: "Processed at USPS facility",
										done: true
									},
									{
										date: "Aug 13",
										event: "In transit",
										done: false
									},
									{
										date: "—",
										event: "Delivered (signature required)",
										done: false
									}
								].map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${step.done ? "bg-stamp/10" : "border border-rule bg-card"}`,
										children: step.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											className: "h-3.5 w-3.5 text-stamp",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											strokeWidth: 2,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M5 13l4 4L19 7"
											})
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] font-mono text-muted-foreground",
											children: i + 1
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-sm ${step.done ? "text-foreground" : "text-muted-foreground"}`,
										children: step.event
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: step.date
									})] })]
								}, i))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex items-center gap-3 rounded-md border border-dashed border-rule bg-paper-deep/30 px-5 py-4 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							className: "h-5 w-5 shrink-0 text-stamp",
							fill: "none",
							viewBox: "0 0 24 24",
							stroke: "currentColor",
							strokeWidth: 1.5,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								strokeLinecap: "round",
								strokeLinejoin: "round",
								d: "M12 6v6l4 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Account features (save drafts, re-send, saved addresses) are coming when authentication launches." })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { DashboardPage as component };
