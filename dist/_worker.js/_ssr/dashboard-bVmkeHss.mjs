import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { T as CircleCheck, d as Search, g as Mail, k as ArrowRight, p as PackageCheck, r as TrendingUp, w as Clock } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-CW9czZUj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-bVmkeHss.js
var import_jsx_runtime = require_jsx_runtime();
var stats = [
	{
		label: "Total mailings",
		value: "4",
		icon: Mail,
		color: "text-slate-700"
	},
	{
		label: "In transit",
		value: "1",
		icon: PackageCheck,
		color: "text-emerald-500"
	},
	{
		label: "Delivered",
		value: "3",
		icon: CircleCheck,
		color: "text-emerald-600"
	},
	{
		label: "Avg. delivery",
		value: "3.2 days",
		icon: Clock,
		color: "text-slate-400"
	}
];
var mailings = [
	{
		id: "NR-2026-0058",
		type: "IRS Notice Response",
		recipient: "IRS — Austin Campus",
		date: "Aug 11, 2026",
		status: "in_transit",
		mailType: "Certified + RR",
		tracking: "9405 5118 9956 4421 0091"
	},
	{
		id: "NR-2026-0051",
		type: "Court Summons Response",
		recipient: "Superior Court Clerk",
		date: "Aug 5, 2026",
		status: "delivered",
		mailType: "Certified + RR",
		tracking: "9405 5118 9956 4398 7762"
	},
	{
		id: "NR-2026-0044",
		type: "Agency Action Response",
		recipient: "EPA Region 9",
		date: "Jul 28, 2026",
		status: "delivered",
		mailType: "Certified",
		tracking: "9405 5118 9956 4312 0045"
	},
	{
		id: "NR-2026-0039",
		type: "Appeal Filing",
		recipient: "SSA Office of Appeals",
		date: "Jul 15, 2026",
		status: "delivered",
		mailType: "Certified + RR",
		tracking: "9405 5118 9956 4208 1123"
	}
];
var statusConfig = {
	in_transit: {
		label: "In transit",
		badge: "badge badge-amber"
	},
	delivered: {
		label: "Delivered",
		badge: "badge badge-green"
	}
};
function DashboardPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "bg-white py-10 border-b border-warm-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "container",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold text-slate-700",
							style: { fontFamily: "var(--font-serif)" },
							children: "My Mailings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-slate-400",
							children: "Track your responses and delivery records."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/workflows/irs-notice",
							className: "btn-emerald",
							children: ["New mailing ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })]
						})]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "py-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "container",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
							children: stats.map(({ label, value, icon: Icon, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "card p-5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-slate-400",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: value
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
										size: 24,
										className: color
									})]
								})
							}, label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 card overflow-hidden",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-warm-border px-5 py-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold text-slate-700",
										children: "Recent mailings"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
											size: 15,
											className: "absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											className: "input-field pl-9 py-2 text-sm",
											placeholder: "Search mailings...",
											style: { width: 200 }
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "hidden md:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
											className: "bg-slate-50 text-left text-xs font-semibold text-slate-400",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-5 py-3",
													children: "Reference"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-5 py-3",
													children: "Type"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-5 py-3",
													children: "Recipient"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-5 py-3",
													children: "Date"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-5 py-3",
													children: "Mail type"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-5 py-3",
													children: "Status"
												})
											] })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
											className: "divide-y divide-warm-border",
											children: mailings.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "hover:bg-cream transition-colors cursor-pointer",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-5 py-3.5 font-mono text-xs font-semibold text-slate-700",
														children: m.id
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-5 py-3.5 text-slate-500",
														children: m.type
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-5 py-3.5 text-slate-500",
														children: m.recipient
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-5 py-3.5 text-slate-400",
														children: m.date
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-5 py-3.5 text-slate-400",
														children: m.mailType
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-5 py-3.5",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: statusConfig[m.status].badge,
															children: statusConfig[m.status].label
														})
													})
												]
											}, m.id))
										})]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "divide-y divide-warm-border md:hidden",
									children: mailings.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-xs font-semibold text-slate-700",
													children: m.id
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: statusConfig[m.status].badge,
													children: statusConfig[m.status].label
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 font-semibold text-slate-700",
												children: m.type
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-slate-400",
												children: m.recipient
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-2 flex items-center gap-3 text-xs text-slate-300",
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
							className: "mt-6 card p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, {
										size: 18,
										className: "text-emerald-500"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-semibold text-slate-700",
										children: "Latest tracking"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-slate-400",
									children: "NR-2026-0058 · Certified + Return Receipt"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 space-y-4",
									children: [
										{
											date: "Aug 12, 9:30 AM",
											event: "Mailed from Austin, TX",
											done: true
										},
										{
											date: "Aug 12, 2:15 PM",
											event: "Processed at USPS facility",
											done: true
										},
										{
											date: "Aug 13",
											event: "In transit to destination facility",
											done: false
										},
										{
											date: "—",
											event: "Out for delivery",
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
											className: `mt-0.5 flex h-6 w-6 items-center justify-center rounded-full ${step.done ? "bg-emerald-50" : "bg-gray-100"}`,
											children: step.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
												size: 14,
												className: "text-emerald-600"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold text-gray-400",
												children: i + 1
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-sm ${step.done ? "text-slate-700" : "text-slate-300"}`,
											children: step.event
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-slate-300",
											children: step.date
										})] })]
									}, i))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex items-center gap-3 rounded-xl border border-dashed border-warm-border bg-white p-5 text-sm text-slate-400",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, {
								size: 18,
								className: "text-emerald-500"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Account features (save drafts, save recipient addresses, re-send) are coming when authentication launches." })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { DashboardPage as component };
