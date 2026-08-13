import { n as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ArrowLeft, C as CreditCard, D as Check, T as CircleCheck, a as Stamp, g as Mail, k as ArrowRight, l as ShieldAlert, n as TriangleAlert, p as PackageCheck, y as FileUp } from "../_libs/lucide-react.mjs";
import { i as SiteHeader, r as SiteFooter } from "./router-BnYsaCSw.mjs";
import { t as workflows } from "./workflows-CntJTiKq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/irs-notice-By0h5yfI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var stepLabels = [
	"Start",
	"Notice",
	"Facts",
	"Objective",
	"Draft",
	"Review",
	"Attachments",
	"Recipient",
	"Mailing",
	"Checkout",
	"Done"
];
var mailOptions = [
	{
		id: "standard",
		label: "Standard",
		price: "$4.99",
		desc: "3–7 business days · Tracking included",
		icon: Mail
	},
	{
		id: "certified",
		label: "Certified",
		price: "$14.94",
		desc: "Delivery tracking + confirmation · 3–7 days",
		icon: PackageCheck
	},
	{
		id: "registered",
		label: "Registered",
		price: "$32.49",
		desc: "Secure handling + tracking · 5–10 days",
		icon: Stamp
	}
];
var reviewChecks = [
	"I reviewed every factual statement in this draft.",
	"Names, dates, notice numbers, and amounts are correct.",
	"I reviewed the uploaded notice and IRS instructions.",
	"I understand Notice Respond is not providing legal or tax advice."
];
function IRSNotice() {
	const definition = workflows["irs-notice"];
	const [step, setStep] = (0, import_react.useState)(0);
	const [noticeNumber, setNoticeNumber] = (0, import_react.useState)("");
	const [noticeType, setNoticeType] = (0, import_react.useState)("");
	const [noticeDate, setNoticeDate] = (0, import_react.useState)("");
	const [responseDeadline, setResponseDeadline] = (0, import_react.useState)("");
	const [taxYear, setTaxYear] = (0, import_react.useState)("");
	const [facts, setFacts] = (0, import_react.useState)("");
	const [objective, setObjective] = (0, import_react.useState)("");
	const [draft, setDraft] = (0, import_react.useState)("");
	const [checks, setChecks] = (0, import_react.useState)(reviewChecks.map(() => false));
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
	const progress = (0, import_react.useMemo)(() => Math.round(step / (stepLabels.length - 1) * 100), [step]);
	const allChecked = checks.every(Boolean);
	function generateDraft() {
		return `Re: Response to IRS Notice ${noticeNumber || "[Notice Number]"}
${noticeType ? `Notice Type: ${noticeType}` : ""}
${taxYear ? `Tax Year: ${taxYear}` : ""}
${noticeDate ? `Notice Date: ${noticeDate}` : ""}
${responseDeadline ? `Response Deadline: ${responseDeadline}` : ""}

Dear Sir or Madam,

I am writing in response to the notice referenced above. ${objective || "[Your objective will appear here.]"}

${facts || "[The facts you provided will appear here.]"}

Please find enclosed the requested information and documentation. I respectfully request that you consider this response in a timely manner.

Sincerely,
[Your Name]`;
	}
	function canContinue() {
		switch (step) {
			case 1: return noticeNumber.trim().length > 0;
			case 2: return facts.trim().length > 0;
			case 3: return objective.trim().length > 0;
			case 5: return allChecked;
			case 7: return recipient.name && recipient.address1 && recipient.city && recipient.state && recipient.zip;
			default: return true;
		}
	}
	function next() {
		if (step === 4 && !draft) setDraft(generateDraft());
		setStep((s) => Math.min(s + 1, stepLabels.length - 1));
	}
	function back() {
		setStep((s) => Math.max(s - 1, 0));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen bg-cream",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "container py-8 md:py-12",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mb-8",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs font-semibold text-slate-400",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										"Step ",
										step + 1,
										" of ",
										stepLabels.length
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [progress, "% complete"] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "progress-track mt-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "progress-fill",
										style: { width: `${progress}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 hidden justify-between text-[11px] text-slate-300 sm:flex",
									children: stepLabels.map((label, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: i <= step ? "font-semibold text-slate-700" : "",
										children: label
									}, label))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "card p-6 md:p-10",
							children: [
								step === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "Guided workflow"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "mt-3 text-3xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Respond to an IRS notice"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 leading-7 text-slate-400",
										children: "We'll help you organize the notice, confirm the information you provide, prepare an editable draft, and move toward mailing. Nothing is sent until you review and approve it."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "alert alert-warning mt-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
											size: 18,
											className: "mb-2 shrink-0"
										}), definition.disclaimer]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-6 grid gap-3 sm:grid-cols-2",
										children: [
											"Upload or identify the notice",
											"Confirm your facts and objective",
											"Review and edit the draft",
											"Choose mailing and send"
										].map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2 text-sm text-slate-500",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400",
												children: i + 1
											}), item]
										}, item))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "alert alert-info mt-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
												size: 16,
												className: "inline mr-1"
											}),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "IRS notice deadlines:" }),
											" Most IRS notices give you 30–90 days to respond. Note your deadline immediately and plan to mail well before it expires."
										]
									})
								] }),
								step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "1 · Upload / identify"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Start with the notice"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "Upload the notice when document processing is connected, or identify it here so the workflow can begin."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "upload-zone mt-7 block",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {
												className: "mx-auto text-slate-400",
												size: 28
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-3 block font-semibold text-slate-500",
												children: "Upload IRS notice"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-sm text-slate-300",
												children: "PDF, JPG, or PNG · Secure storage will be added"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: "application/pdf,image/jpeg,image/png",
												className: "sr-only"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-6 grid gap-4 sm:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "input-label",
												children: "Notice number (e.g., CP2000) *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "input-field",
												value: noticeNumber,
												onChange: (e) => setNoticeNumber(e.target.value),
												placeholder: "CP2000, CP14, LT11, etc."
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "input-label",
												children: "Notice type"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "input-field",
												value: noticeType,
												onChange: (e) => setNoticeType(e.target.value),
												placeholder: "Proposed adjustment, balance due, etc."
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "input-label",
												children: "Tax year"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "input-field",
												value: taxYear,
												onChange: (e) => setTaxYear(e.target.value),
												placeholder: "2025"
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
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "sm:col-span-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "input-label",
													children: "Response deadline"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													type: "date",
													className: "input-field",
													value: responseDeadline,
													onChange: (e) => setResponseDeadline(e.target.value)
												})]
											})
										]
									})
								] }),
								step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "2 · Your facts"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "What facts should the response address?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "Use your own words. The drafting assistant must not invent facts. Only include information you can verify."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "input-field mt-6 min-h-48",
										value: facts,
										onChange: (e) => setFacts(e.target.value),
										placeholder: "Enter the relevant facts you want included in your response..."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "alert alert-info mt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Tip:" }), " Include the tax year, amounts in question, and any documentation you have. Reference specific line items from the notice."]
									})
								] }),
								step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "3 · Your objective"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "What do you want the response to accomplish?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "Describe the outcome you want. This guides the tone and structure of the draft."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "input-field mt-6 min-h-40",
										value: objective,
										onChange: (e) => setObjective(e.target.value),
										placeholder: "Example: I want to provide documentation showing the income reported on the CP2000 is correct and no adjustment is needed."
									})
								] }),
								step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "4 · Draft"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Prepare your response"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "This draft is a starting point based on the information you provided. Review every fact, name, date, and statement before sending."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
										className: "input-field mt-6 min-h-72 font-mono text-sm leading-6",
										value: draft,
										onChange: (e) => setDraft(e.target.value)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "alert alert-warning mt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, {
											size: 16,
											className: "shrink-0"
										}), " This draft was generated from your input. It is not legal or tax advice. Review and edit carefully before proceeding."]
									})
								] }),
								step === 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "5 · Review"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Review before anything is mailed"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "Please confirm each item below before proceeding."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-6 space-y-3",
										children: reviewChecks.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "check-card",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: checks[i],
												onChange: (e) => setChecks((c) => c.map((v, j) => j === i ? e.target.checked : v))
											}), item]
										}, item))
									})
								] }),
								step === 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "6 · Attachments"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Add supporting documents"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "Add only the documents you intend to send and verify that they match the notice instructions."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
										className: "upload-zone mt-6 block",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, {
												className: "mx-auto text-slate-400",
												size: 28
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-3 block font-semibold text-slate-500",
												children: "Add attachments"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block text-sm text-slate-300",
												children: "PDF, JPG, or PNG · Secure document storage coming soon"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "file",
												accept: "application/pdf,image/jpeg,image/png",
												multiple: true,
												className: "sr-only"
											})
										]
									})
								] }),
								step === 7 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "7 · Recipient"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Where should we send it?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "Enter the mailing address from the IRS notice. This is typically found in the response instructions section."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
													onChange: (e) => setRecipient({
														...recipient,
														name: e.target.value
													}),
													placeholder: "IRS — [Campus Name]"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "sm:col-span-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
													className: "input-label",
													children: "Organization / Office"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													className: "input-field",
													value: recipient.org,
													onChange: (e) => setRecipient({
														...recipient,
														org: e.target.value
													}),
													placeholder: "Optional"
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
													onChange: (e) => setRecipient({
														...recipient,
														address1: e.target.value
													}),
													placeholder: "Street address"
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
													onChange: (e) => setRecipient({
														...recipient,
														address2: e.target.value
													}),
													placeholder: "P.O. Box, suite, etc."
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "input-label",
												children: "City *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "input-field",
												value: recipient.city,
												onChange: (e) => setRecipient({
													...recipient,
													city: e.target.value
												})
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "input-label",
												children: "State *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "input-field",
												value: recipient.state,
												onChange: (e) => setRecipient({
													...recipient,
													state: e.target.value
												}),
												placeholder: "TX"
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
												className: "input-label",
												children: "ZIP Code *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												className: "input-field",
												value: recipient.zip,
												onChange: (e) => setRecipient({
													...recipient,
													zip: e.target.value
												}),
												placeholder: "73301"
											})] })
										]
									})
								] }),
								step === 8 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "8 · Mailing options"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Choose your mail type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-slate-400",
										children: "For IRS responses, certified mail with return receipt is recommended for proof of timely delivery."
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-6 grid gap-3 sm:grid-cols-2",
										children: mailOptions.map(({ id, label, price, desc, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `mail-option ${mailType === id ? "selected" : ""}`,
											onClick: () => setMailType(id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
														size: 20,
														className: "text-slate-500"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-semibold text-slate-700",
														children: label
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-slate-400",
														children: desc
													})] })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-right",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-lg font-bold text-slate-700",
														style: { fontFamily: "var(--font-serif)" },
														children: price
													}), mailType === id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
														size: 16,
														className: "ml-auto text-emerald-500"
													})]
												})]
											})
										}, id))
									})
								] }),
								step === 9 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "eyebrow",
										children: "9 · Checkout"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "mt-3 text-2xl font-bold text-slate-700",
										style: { fontFamily: "var(--font-serif)" },
										children: "Review and pay"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-6 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-500",
													children: "Mail type"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-slate-700",
													children: mailOptions.find((m) => m.id === mailType)?.label
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-500",
													children: "Recipient"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-slate-700",
													children: recipient.name || "—"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between rounded-lg border border-warm-border px-4 py-3 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-500",
													children: "Total"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-lg font-bold text-slate-700",
													style: { fontFamily: "var(--font-serif)" },
													children: mailOptions.find((m) => m.id === mailType)?.price
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "alert alert-info mt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, {
											size: 16,
											className: "shrink-0"
										}), " Secure checkout via Stripe is being connected."]
									})
								] }),
								step === 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
											className: "mt-5 text-2xl font-bold text-slate-700",
											style: { fontFamily: "var(--font-serif)" },
											children: "Your mailing has been submitted"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-slate-400",
											children: "Your response is being prepared for mailing. You'll receive a tracking number once it ships."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-6 inline-flex items-center gap-2 rounded-xl border border-warm-border px-4 py-3 text-sm",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, {
													size: 16,
													className: "text-emerald-500"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-slate-500",
													children: "Tracking number:"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-semibold text-slate-700",
													children: "— Pending —"
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-8 flex justify-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/",
												className: "btn-outline",
												children: "Back to home"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/workflows/irs-notice",
												className: "btn-primary",
												children: "Start another"
											})]
										})
									]
								}),
								step < 10 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: back,
										disabled: step === 0,
										className: "btn-ghost disabled:opacity-30",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { size: 16 }), " Back"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: next,
										disabled: !canContinue(),
										className: "btn-primary",
										children: [
											step === 9 ? "Pay and send" : "Continue",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { size: 16 })
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-6 text-center",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/",
								className: "text-sm text-slate-400 hover:text-emerald-600",
								children: "← Back to Notice Respond"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
//#endregion
export { IRSNotice as component };
