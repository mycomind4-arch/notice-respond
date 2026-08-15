import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
import { f as createSegment, i as VoiceBadge, m as getRepository, n as NOTICE_TYPE_META, p as getOwnerId, r as NarrationButton, s as buildScript } from "./notice-type-DGSGnlOI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BdVu7Lsh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_BADGE = {
	intake: "text-muted-foreground",
	analyzed: "text-stamp",
	in_progress: "text-stamp",
	ready: "text-emerald-700",
	mailed: "text-stamp",
	delivered: "text-emerald-700",
	closed: "text-muted-foreground",
	archived: "text-muted-foreground"
};
var STATUS_LABEL = {
	intake: "Intake",
	analyzed: "Analyzed",
	in_progress: "In Progress",
	ready: "Ready",
	mailed: "Mailed",
	delivered: "Delivered",
	closed: "Closed",
	archived: "Archived"
};
function formatDate(iso) {
	try {
		return new Date(iso).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	} catch {
		return iso;
	}
}
function DashboardPage() {
	const [summaries, setSummaries] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		getRepository().listSummaries(getOwnerId()).then((data) => {
			setSummaries(data);
			setLoading(false);
		}).catch(() => {
			setLoading(false);
		});
	}, []);
	const stats = (0, import_react.useMemo)(() => {
		const total = summaries.length;
		const inProgress = summaries.filter((s) => s.status === "in_progress" || s.status === "analyzed").length;
		const ready = summaries.filter((s) => s.status === "ready").length;
		summaries.filter((s) => s.status === "mailed" || s.status === "delivered").length;
		const withDrafts = summaries.filter((s) => s.hasDraft).length;
		return [
			{
				label: "Total cases",
				value: String(total)
			},
			{
				label: "In progress",
				value: String(inProgress)
			},
			{
				label: "Ready to mail",
				value: String(ready)
			},
			{
				label: "With drafts",
				value: String(withDrafts)
			}
		];
	}, [summaries]);
	const summaryScript = buildScript("summary", "Dashboard Summary", [
		createSegment("Your case dashboard.", "heading", { pauseAfter: 500 }),
		createSegment(`You have ${summaries.length} total cases. ${stats[1].value} in progress, ${stats[2].value} ready to mail.`, "body", { pauseAfter: 400 }),
		createSegment("To analyze a new notice, click the Analysis Studio button.", "instruction", { pauseAfter: 500 })
	]);
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
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "postmark w-fit",
									children: "My Cases"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceBadge, { active: true })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-serif text-4xl",
								children: "Your case records"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Track your notice responses and case status."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
								script: summaryScript,
								label: "Listen to summary"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/workflows/analyze",
								className: "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5",
								children: ["Analysis Studio ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
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
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between border-b border-rule/60 px-5 py-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-serif text-lg",
								children: "Recent cases"
							})
						}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 py-10 text-center text-sm text-muted-foreground",
							children: "Loading cases…"
						}) : summaries.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-10 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No saved cases yet."
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/workflows/analyze",
								className: "mt-3 inline-flex items-center gap-2 rounded-full border border-stamp px-4 py-2 text-sm font-medium text-stamp transition-colors hover:bg-stamp hover:text-accent-foreground",
								children: "Analyze your first notice"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-paper-deep/30 text-left text-xs uppercase tracking-wider text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Agency"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Deadline"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Readiness"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Updated"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-rule/40",
									children: summaries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-paper-deep/20 transition-colors cursor-pointer",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5 text-ink-soft",
												children: NOTICE_TYPE_META[s.noticeType]?.label || s.noticeType
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5 text-ink-soft",
												children: s.agency || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5 font-mono text-xs text-muted-foreground",
												children: s.referenceNumber || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5 text-muted-foreground",
												children: s.deadlineDate ? formatDate(s.deadlineDate) : "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-1.5 w-16 overflow-hidden rounded-full bg-muted",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "h-full rounded-full bg-primary",
															style: { width: `${s.readinessScore}%` }
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs text-muted-foreground",
														children: [s.readinessScore, "%"]
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `font-mono text-xs ${STATUS_BADGE[s.status] || "text-muted-foreground"}`,
													children: STATUS_LABEL[s.status] || s.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-5 py-3.5 text-muted-foreground",
												children: formatDate(s.updatedAt)
											})
										]
									}, s.id))
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "divide-y divide-rule/40 md:hidden",
							children: summaries.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: NOTICE_TYPE_META[s.noticeType]?.label || s.noticeType
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `font-mono text-xs ${STATUS_BADGE[s.status] || "text-muted-foreground"}`,
											children: STATUS_LABEL[s.status] || s.status
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-sm text-muted-foreground",
										children: s.agency || "Unknown agency"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-2 flex items-center gap-3 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(s.updatedAt) }),
											s.deadlineDate && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Deadline: ", formatDate(s.deadlineDate)] })] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [s.readinessScore, "% ready"] })
										]
									})
								]
							}, s.id))
						})] })]
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
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Cases are automatically saved as you work. Connect Supabase to persist cases across sessions." })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { DashboardPage as component };
