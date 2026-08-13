import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { a as Success, c as workflows, i as ReviewChecks, n as MailOptions, o as UploadZone, r as RecipientForm, s as WorkflowShell, t as CheckoutStep } from "./workflow-shell-DyWhVH4G.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agency-action-CbuHfw5u.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STEPS = [
	{
		id: "intro",
		label: "Start"
	},
	{
		id: "notice",
		label: "Notice"
	},
	{
		id: "facts",
		label: "Facts"
	},
	{
		id: "objective",
		label: "Objective"
	},
	{
		id: "draft",
		label: "Draft"
	},
	{
		id: "review",
		label: "Review"
	},
	{
		id: "attachments",
		label: "Documents"
	},
	{
		id: "recipient",
		label: "Recipient"
	},
	{
		id: "mailing",
		label: "Mail"
	},
	{
		id: "checkout",
		label: "Checkout"
	},
	{
		id: "done",
		label: "Done"
	}
];
var REVIEW_CHECKS = [
	"I reviewed every factual statement in this draft.",
	"Agency name, notice number, and reference numbers are correct.",
	"I reviewed the agency's instructions and response requirements.",
	"I understand Notice Respond is not providing legal advice."
];
function AgencyAction() {
	const definition = workflows["agency-action"];
	const [step, setStep] = (0, import_react.useState)(0);
	const [agencyName, setAgencyName] = (0, import_react.useState)("");
	const [noticeType, setNoticeType] = (0, import_react.useState)("");
	const [noticeDate, setNoticeDate] = (0, import_react.useState)("");
	const [responseDeadline, setResponseDeadline] = (0, import_react.useState)("");
	const [referenceNumber, setReferenceNumber] = (0, import_react.useState)("");
	const [facts, setFacts] = (0, import_react.useState)("");
	const [objective, setObjective] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	const [checks, setChecks] = (0, import_react.useState)(REVIEW_CHECKS.map(() => false));
	const [mailType, setMailType] = (0, import_react.useState)("certified");
	const [recipient, setRecipient] = (0, import_react.useState)({
		name: "",
		org: "",
		address1: "",
		address2: "",
		city: "",
		state: "",
		zip: ""
	});
	const [done, setDone] = (0, import_react.useState)(false);
	const allChecked = checks.every(Boolean);
	function generateDraft() {
		return `Re: Response to Agency Notice
${agencyName ? `Agency: ${agencyName}` : ""}
${noticeType ? `Notice Type: ${noticeType}` : ""}
${referenceNumber ? `Reference: ${referenceNumber}` : ""}
${noticeDate ? `Notice Date: ${noticeDate}` : ""}
${responseDeadline ? `Response Deadline: ${responseDeadline}` : ""}

Dear Sir or Madam,

I am writing in response to the notice referenced above. ${objective || "[Your objective will appear here.]"}

${facts || "[The facts you provided will appear here.]"}

Sincerely,
[Your Name]`;
	}
	function canContinue() {
		switch (step) {
			case 1: return agencyName.trim().length > 0;
			case 2: return facts.trim().length > 0;
			case 3: return objective.trim().length > 0;
			case 5: return allChecked;
			case 7: return !!(recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip);
			default: return true;
		}
	}
	function next() {
		if (step === 4 && !draft) setDraft(generateDraft());
		if (step === STEPS.length - 1) {
			setDone(true);
			return;
		}
		setStep((s) => Math.min(s + 1, STEPS.length - 1));
	}
	if (done) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Success, {
		title: "Your agency response has been submitted",
		href: "/workflows/agency-action"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(WorkflowShell, {
		title: "Respond to an Agency Action",
		steps: STEPS,
		step,
		setStep,
		canContinue: canContinue(),
		onNext: next,
		onBack: () => setStep((s) => Math.max(s - 1, 0)),
		children: [
			step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "1 · Start"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-4xl",
					children: "Respond to an agency action"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "Prepare a written response to a regulatory agency notice, licensing board action, or FOIA determination."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 rounded-md border border-rule/70 bg-paper-deep/40 p-4 text-sm text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono text-xs uppercase tracking-widest text-stamp",
						children: "Disclaimer"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2",
						children: definition.disclaimer
					})]
				})
			] }),
			step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "2 · Notice"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "Start with the notice"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadZone, {
					label: "Upload agency notice",
					sublabel: "PDF, JPG, or PNG"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-4 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "input-label",
							children: "Agency name *"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input-field",
							value: agencyName,
							onChange: (e) => setAgencyName(e.target.value),
							placeholder: "State Board, EPA, FDA, etc."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "input-label",
							children: "Notice type"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input-field",
							value: noticeType,
							onChange: (e) => setNoticeType(e.target.value),
							placeholder: "Code enforcement, licensing, FOIA, etc."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "input-label",
							children: "Reference number"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							className: "input-field",
							value: referenceNumber,
							onChange: (e) => setReferenceNumber(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "input-label",
							children: "Notice date"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							className: "input-field",
							value: noticeDate,
							onChange: (e) => setNoticeDate(e.target.value)
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							className: "input-label",
							children: "Response deadline"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "date",
							className: "input-field",
							value: responseDeadline,
							onChange: (e) => setResponseDeadline(e.target.value)
						})] })
					]
				})
			] }),
			step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "3 · Facts"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "What facts should the response address?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "Use your own words. Only include information you can verify."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "input-field mt-6 min-h-48",
					value: facts,
					onChange: (e) => setFacts(e.target.value)
				})
			] }),
			step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "4 · Objective"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "What do you want to accomplish?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "input-field mt-6 min-h-40",
					value: objective,
					onChange: (e) => setObjective(e.target.value)
				})
			] }),
			step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "5 · Draft"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "Your response letter"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "Review every fact. This is editable."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					className: "input-field mt-6 min-h-72 font-mono text-sm leading-6",
					value: draft,
					onChange: (e) => setDraft(e.target.value)
				})
			] }),
			step === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "6 · Review"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "Review before anything is mailed"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReviewChecks, {
					items: REVIEW_CHECKS,
					checks,
					setChecks
				})
			] }),
			step === 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "7 · Documents"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "Add supporting documents"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadZone, {
					label: "Add attachments",
					sublabel: "Evidence, permits, prior correspondence"
				})
			] }),
			step === 7 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "8 · Recipient"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "Where should we send it?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecipientForm, {
					recipient,
					setRecipient,
					orgPlaceholder: agencyName || "Agency name"
				})
			] }),
			step === 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "postmark w-fit",
					children: "9 · Mail"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 font-serif text-3xl",
					children: "Choose your mail type"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-muted-foreground",
					children: "For agency responses, Certified mail is recommended."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailOptions, {
					selected: mailType,
					onSelect: setMailType
				})
			] }),
			step === 9 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckoutStep, {
				mailType,
				recipient
			})
		]
	});
}
//#endregion
export { AgencyAction as component };
