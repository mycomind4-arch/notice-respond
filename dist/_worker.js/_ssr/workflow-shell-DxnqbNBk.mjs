import { n as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workflow-shell-DxnqbNBk.js
var import_jsx_runtime = require_jsx_runtime();
var workflows = {
	"irs-notice": {
		id: "irs-notice",
		title: "Respond to an IRS Notice",
		description: "Organize an IRS notice or letter, prepare a written response, and mail it with proof of delivery.",
		disclaimer: "Notice Respond provides document preparation and mailing assistance. It is not a law firm, CPA firm, or tax professional and does not provide legal or tax advice.",
		steps: [
			"intro",
			"document",
			"facts",
			"objective",
			"draft",
			"review",
			"attachments",
			"recipient",
			"mailing",
			"checkout",
			"submitted"
		]
	},
	"court-summons": {
		id: "court-summons",
		title: "Respond to a Court Summons",
		description: "Prepare a written response to a court summons or complaint and file it by mail with proof of delivery.",
		disclaimer: "Notice Respond is not a law firm and does not provide legal advice. Court filings have strict deadlines and procedural requirements. Consult an attorney if you are unsure.",
		steps: [
			"intro",
			"document",
			"facts",
			"objective",
			"draft",
			"review",
			"attachments",
			"recipient",
			"mailing",
			"checkout",
			"submitted"
		]
	},
	"agency-action": {
		id: "agency-action",
		title: "Respond to an Agency Action",
		description: "Prepare a written response to a regulatory agency notice, licensing board action, or FOIA determination.",
		disclaimer: "Agency responses may have strict deadlines and specific formatting requirements. Review the agency's instructions carefully. Notice Respond is not a law firm.",
		steps: [
			"intro",
			"document",
			"facts",
			"objective",
			"draft",
			"review",
			"attachments",
			"recipient",
			"mailing",
			"checkout",
			"submitted"
		]
	},
	"file-appeal": {
		id: "file-appeal",
		title: "File an Appeal",
		description: "Prepare an appeal letter for a denied claim, decision, or ruling and mail it with proof of delivery.",
		disclaimer: "Appeals often have short deadlines and specific requirements. Review the appeal instructions from the agency or court. Notice Respond is not a law firm.",
		steps: [
			"intro",
			"document",
			"facts",
			"objective",
			"draft",
			"review",
			"attachments",
			"recipient",
			"mailing",
			"checkout",
			"submitted"
		]
	}
};
var MAIL_OPTIONS = [
	{
		id: "standard",
		label: "Standard",
		price: "$4.99",
		desc: "3–7 business days · Tracking included"
	},
	{
		id: "certified",
		label: "Certified",
		price: "$14.94",
		desc: "Delivery tracking + confirmation · 3–7 days"
	},
	{
		id: "registered",
		label: "Registered",
		price: "$32.49",
		desc: "Secure handling + tracking · 5–10 days"
	}
];
function Stepper({ steps, current, onStep }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "flex items-center justify-between gap-1 overflow-x-auto",
		children: steps.map((s, i) => {
			const done = i < current;
			const active = i === current;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-1 shrink-0 items-center gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => onStep && i <= current && onStep(i),
						className: `flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] transition-colors ${active ? "border-stamp bg-stamp text-accent-foreground" : done ? "border-ink bg-ink text-primary-foreground" : "border-rule bg-card text-muted-foreground"}`,
						children: String(i + 1).padStart(2, "0")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: `text-xs ${active ? "text-foreground" : "text-muted-foreground"}`,
						children: s.label
					}),
					i < steps.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "flex-1 border-t border-dashed border-rule" })
				]
			}, s.id);
		})
	});
}
function WorkflowShell({ title, steps, step, setStep, canContinue, onNext, onBack, children, finalLabel = "Pay and send" }) {
	const isLast = step === steps.length - 1;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-3xl px-4 py-10 sm:px-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "text-sm text-muted-foreground hover:text-stamp transition-colors",
							children: "← Notice Respond"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mb-6 font-serif text-3xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stepper, {
						steps,
						current: step,
						onStep: (i) => setStep(() => i)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-10 envelope-card p-6 md:p-10",
						children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: onBack,
								disabled: step === 0,
								className: "text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30",
								children: "← Back"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: onNext,
								disabled: !canContinue,
								className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30 disabled:transform-none disabled:shadow-none",
								children: [isLast ? finalLabel : "Continue", " →"]
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function Success({ title, href }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-lg px-6 py-32 text-center",
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-6 font-serif text-4xl",
						children: title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-muted-foreground",
						children: "Your response is being prepared for mailing."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 inline-flex items-center gap-2 rounded-lg border border-rule/60 px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "Tracking number:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono font-medium text-foreground",
							children: "— Pending —"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 flex justify-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "inline-flex items-center rounded-full border border-input px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted",
							children: "Back to home"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: href,
							className: "inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-stamp",
							children: "Start another"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function UploadZone({ label, sublabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "upload-zone mt-6 block",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
				className: "mx-auto text-muted-foreground",
				width: "28",
				height: "28",
				viewBox: "0 0 24 24",
				fill: "none",
				stroke: "currentColor",
				strokeWidth: 1.5,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
					strokeLinecap: "round",
					strokeLinejoin: "round",
					d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-3 block font-medium text-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block text-xs text-muted-foreground",
				children: sublabel
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "file",
				accept: "application/pdf,image/jpeg,image/png",
				multiple: true,
				className: "sr-only"
			})
		]
	});
}
function MailOptions({ selected, onSelect }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 grid gap-3 sm:grid-cols-2",
		children: MAIL_OPTIONS.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `mail-option ${selected === opt.id ? "selected" : ""}`,
			onClick: () => onSelect(opt.id),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium text-foreground",
					children: opt.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: opt.desc
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-serif text-lg",
						children: opt.price
					}), selected === opt.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						className: "ml-auto h-4 w-4 text-stamp",
						fill: "none",
						viewBox: "0 0 24 24",
						stroke: "currentColor",
						strokeWidth: 2,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							strokeLinecap: "round",
							strokeLinejoin: "round",
							d: "M5 13l4 4L19 7"
						})
					})]
				})]
			})
		}, opt.id))
	});
}
function ReviewChecks({ items, checks, setChecks }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-6 space-y-3",
		children: items.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
			className: "check-card",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				type: "checkbox",
				checked: checks[i],
				onChange: (e) => setChecks((c) => c.map((v, j) => j === i ? e.target.checked : v))
			}), item]
		}, item))
	});
}
function RecipientForm({ recipient, setRecipient, orgPlaceholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 grid gap-4 sm:grid-cols-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "input-label",
					children: "Recipient name *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input-field",
					value: recipient.name,
					onChange: (e) => setRecipient((r) => ({
						...r,
						name: e.target.value
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "input-label",
					children: "Organization"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input-field",
					value: recipient.org,
					onChange: (e) => setRecipient((r) => ({
						...r,
						org: e.target.value
					})),
					placeholder: orgPlaceholder || "Organization"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "input-label",
					children: "Address line 1 *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input-field",
					value: recipient.address1,
					onChange: (e) => setRecipient((r) => ({
						...r,
						address1: e.target.value
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sm:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "input-label",
					children: "Address line 2"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					className: "input-field",
					value: recipient.address2,
					onChange: (e) => setRecipient((r) => ({
						...r,
						address2: e.target.value
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "input-label",
				children: "City *"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input-field",
				value: recipient.city,
				onChange: (e) => setRecipient((r) => ({
					...r,
					city: e.target.value
				}))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "input-label",
				children: "State *"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input-field",
				value: recipient.state,
				onChange: (e) => setRecipient((r) => ({
					...r,
					state: e.target.value
				}))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
				className: "input-label",
				children: "ZIP Code *"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				className: "input-field",
				value: recipient.zip,
				onChange: (e) => setRecipient((r) => ({
					...r,
					zip: e.target.value
				}))
			})] })
		]
	});
}
function CheckoutStep({ mailType, recipient }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "postmark w-fit",
			children: "Checkout"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
			className: "mt-4 font-serif text-3xl",
			children: "Review and pay"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 space-y-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Mail type"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: MAIL_OPTIONS.find((m) => m.id === mailType)?.label
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Recipient"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: recipient.name || "—"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between rounded-lg border border-rule/60 px-4 py-3 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Total"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-serif text-lg",
						children: MAIL_OPTIONS.find((m) => m.id === mailType)?.price
					})]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 rounded-md border border-rule/70 bg-paper-deep/40 p-3 text-sm text-muted-foreground",
			children: "Secure checkout via Stripe is being connected."
		})
	] });
}
//#endregion
export { Success as a, workflows as c, ReviewChecks as i, MailOptions as n, UploadZone as o, RecipientForm as r, WorkflowShell as s, CheckoutStep as t };
