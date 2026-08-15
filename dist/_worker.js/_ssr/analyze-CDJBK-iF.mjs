import { r as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as SiteFooter, r as SiteHeader } from "./router-qGrcUNmF.mjs";
import { a as nullType, c as recordType, i as enumType, l as stringType, n as arrayType, o as numberType, r as booleanType, s as objectType, u as unionType } from "../_libs/zod.mjs";
import { a as buildAnalysisNarration, c as buildStrategyNarration, d as createCase, g as updateCase, h as transitionStatus, i as VoiceBadge, l as buildWalkthroughNarration, m as getRepository, n as NOTICE_TYPE_META, o as buildDeadlineNarration, p as getOwnerId, r as NarrationButton, t as DictationInput, u as classifyNoticeType } from "./notice-type-DGSGnlOI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/analyze-CDJBK-iF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var factSourceSchema = enumType([
	"extracted",
	"user",
	"inferred"
]);
var factConfidenceSchema = enumType([
	"high",
	"medium",
	"low"
]);
var noticeFactSchema = objectType({
	id: stringType(),
	label: stringType(),
	value: stringType(),
	source: factSourceSchema.default("extracted"),
	confidence: factConfidenceSchema.default("medium"),
	userConfirmed: booleanType().default(false),
	sourceExcerpt: stringType().optional(),
	extractionMethod: stringType().optional(),
	createdAt: stringType().default(() => (/* @__PURE__ */ new Date()).toISOString())
});
function createFact(label, value, source = "extracted", confidence = "medium", options) {
	return noticeFactSchema.parse({
		id: options?.id ?? crypto.randomUUID(),
		label,
		value,
		source,
		confidence,
		userConfirmed: options?.userConfirmed ?? false,
		sourceExcerpt: options?.sourceExcerpt,
		extractionMethod: options?.extractionMethod
	});
}
var deadlineTypeSchema = enumType([
	"response",
	"filing",
	"hearing",
	"payment",
	"appeal",
	"other"
]);
var deadlineCertaintySchema = enumType([
	"explicit",
	"calculated",
	"inferred",
	"ambiguous",
	"missing"
]);
var deadlineSchema = objectType({
	id: stringType(),
	type: deadlineTypeSchema.default("response"),
	date: stringType().optional(),
	rawText: stringType().optional(),
	certainty: deadlineCertaintySchema.default("missing"),
	calculationMethod: stringType().optional(),
	startDate: stringType().optional(),
	daysWindow: numberType().optional(),
	businessDays: booleanType().default(false),
	sourceExcerpt: stringType().optional(),
	notes: stringType().optional()
});
function createDeadline(params) {
	return deadlineSchema.parse({
		id: crypto.randomUUID(),
		type: params.type ?? "response",
		date: params.date,
		rawText: params.rawText,
		certainty: params.certainty ?? "missing",
		calculationMethod: params.calculationMethod,
		startDate: params.startDate,
		daysWindow: params.daysWindow,
		businessDays: params.businessDays ?? false,
		sourceExcerpt: params.sourceExcerpt
	});
}
var MONTH_MAP = {
	january: 1,
	february: 2,
	march: 3,
	april: 4,
	may: 5,
	june: 6,
	july: 7,
	august: 8,
	september: 9,
	october: 10,
	november: 11,
	december: 12,
	jan: 1,
	feb: 2,
	mar: 3,
	apr: 4,
	jun: 6,
	jul: 7,
	aug: 8,
	sep: 9,
	oct: 10,
	nov: 11,
	dec: 12
};
function parseDate(text) {
	if (!text) return void 0;
	const isoMatch = text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
	if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
	const longMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/i);
	if (longMatch) {
		const month = MONTH_MAP[longMatch[1].toLowerCase()];
		const day = parseInt(longMatch[2]);
		const year = parseInt(longMatch[3]);
		if (month && day && year) return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	}
	const slashMatch = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
	if (slashMatch) {
		const month = parseInt(slashMatch[1]);
		const day = parseInt(slashMatch[2]);
		const year = parseInt(slashMatch[3]);
		if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	}
}
function daysUntil(dateString) {
	if (!dateString) return null;
	const target = /* @__PURE__ */ new Date(dateString + "T00:00:00");
	if (isNaN(target.getTime())) return null;
	const now = /* @__PURE__ */ new Date();
	now.setHours(0, 0, 0, 0);
	const diff = target.getTime() - now.getTime();
	return Math.ceil(diff / 864e5);
}
function deadlineUrgency(dateString) {
	const days = daysUntil(dateString);
	if (days === null) return "unknown";
	if (days < 0) return "expired";
	if (days <= 3) return "critical";
	if (days <= 14) return "urgent";
	return "normal";
}
var URGENCY_META = {
	expired: {
		label: "Expired",
		color: "red"
	},
	critical: {
		label: "Critical — Act Now",
		color: "red"
	},
	urgent: {
		label: "Urgent",
		color: "amber"
	},
	normal: {
		label: "On Track",
		color: "green"
	},
	unknown: {
		label: "Unknown",
		color: "gray"
	}
};
function validateDeadline(deadline) {
	const warnings = [];
	const errors = [];
	if (!deadline.date) warnings.push("No deadline date identified. Check the notice carefully.");
	if (deadline.certainty === "ambiguous") warnings.push("Deadline language is ambiguous. Verify the exact date with the issuing agency.");
	if (deadline.certainty === "missing") warnings.push("No deadline was found in the notice. Contact the agency to confirm any response deadlines.");
	if (deadline.date) {
		const days = daysUntil(deadline.date);
		if (days !== null && days < 0) warnings.push("The deadline has already passed. Contact the agency immediately.");
		if (days !== null && days <= 3 && days >= 0) warnings.push("The deadline is within 3 days. Act immediately.");
	}
	if (deadline.businessDays && !deadline.startDate) errors.push("Business-day calculation requires a start date.");
	return {
		warnings,
		errors
	};
}
var AGENCY_PATTERNS = [
	{
		pattern: /internal\s+revenue\s+service/i,
		name: "IRS"
	},
	{
		pattern: /\bIRS\b/,
		name: "IRS"
	},
	{
		pattern: /department\s+of\s+the\s+treasury/i,
		name: "IRS"
	},
	{
		pattern: /franchise\s+tax\s+board/i,
		name: "California Franchise Tax Board"
	},
	{
		pattern: /superior\s+court/i,
		name: "Superior Court"
	},
	{
		pattern: /social\s+security\s+administration/i,
		name: "Social Security Administration"
	},
	{
		pattern: /board\s+of\s+(professional\s+)?licens/i,
		name: "State Board of Professional Licensing"
	},
	{
		pattern: /department\s+of\s+(?:motor\s+vehicles|transportation)/i,
		name: "DMV"
	},
	{
		pattern: /employment\s+development\s+department/i,
		name: "EDD"
	},
	{
		pattern: /county\s+of\s+\w+/i,
		name: "County Court"
	}
];
function detectAgency(text) {
	for (const { pattern, name } of AGENCY_PATTERNS) if (pattern.test(text)) return name;
	const firstLine = text.split("\n")[0]?.trim();
	if (firstLine && firstLine.length > 5 && firstLine.length < 100) return firstLine;
}
function detectReferenceNumber(text) {
	const cpMatch = text.match(/\b(CP\d{3,4}[-\w]*)\b/i);
	if (cpMatch) return cpMatch[1];
	const caseMatch = text.match(/(?:case|notice|claim|license)\s*(?:number|no\.?)\s*:?\s*([A-Z0-9][-A-Z0-9]{3,})/i);
	if (caseMatch) return caseMatch[1];
	const noticeMatch = text.match(/notice\s*(?:number|no\.?)\s*:?\s*([A-Z0-9][-A-Z0-9]{3,})/i);
	if (noticeMatch) return noticeMatch[1];
	const refMatch = text.match(/(?:reference|control)\s*(?:number|no\.?)\s*:?\s*([A-Z0-9][-A-Z0-9]{3,})/i);
	if (refMatch) return refMatch[1];
	const claimMatch = text.match(/claim\s*(?:number|no\.?)\s*:?\s*(\d{3}-\d{2}-\d{4}[-A-Z]?)/i);
	if (claimMatch) return claimMatch[1];
}
function detectAmountOwed(text) {
	const dueMatch = text.match(/amount\s*(?:due|owed|owed|payable)\s*:?\s*(\$[\d,]+\.?\d*)/i);
	if (dueMatch) return dueMatch[1];
	const oweMatch = text.match(/you\s+owe\s+(\$[\d,]+\.?\d*)/i);
	if (oweMatch) return oweMatch[1];
	const balanceMatch = text.match(/(?:unpaid\s+)?balance\s+(?:of\s+)?(\$[\d,]+\.?\d*)/i);
	if (balanceMatch) return balanceMatch[1];
	const payMatch = text.match(/(?:pay|payment\s+of)\s+(\$[\d,]+\.?\d*)/i);
	if (payMatch) return payMatch[1];
}
function detectAppealRights(text) {
	for (const pattern of [
		/right\s+to\s+appeal/i,
		/may\s+(?:file|request)\s+(?:an?\s+)?appeal/i,
		/appeal\s+(?:this\s+)?(?:decision|determination)/i,
		/if\s+you\s+disagree.*?appeal/i,
		/you\s+have\s+\d+\s+days\s+to\s+appeal/i
	]) {
		const match = text.match(pattern);
		if (match) return match[0];
	}
}
function detectDeadlines(text) {
	const deadlines = [];
	const respondByMatch = text.match(/(?:must|should|need\s+to)\s+respond\s+by\s+(.{3,40}?)(?:\.|,|\n|$)/i);
	if (respondByMatch) {
		const dateStr = parseDate(respondByMatch[1]);
		if (dateStr) deadlines.push({ deadline: createDeadline({
			type: "response",
			date: dateStr,
			rawText: respondByMatch[0],
			certainty: "explicit",
			sourceExcerpt: respondByMatch[0]
		}) });
	}
	const withinMatch = text.match(/(?:respond|file|reply).{0,20}within\s+(\d+)\s+days?\s+of\s+(.+?)(?:\.|,|\n|$)/i);
	if (withinMatch) {
		const days = parseInt(withinMatch[1]);
		const startText = withinMatch[2];
		const startDate = parseDate(startText) || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const computedDate = computeDateFromDays(startDate, days);
		if (computedDate && !deadlines.some((d) => d.deadline.date === computedDate)) deadlines.push({ deadline: createDeadline({
			type: "response",
			date: computedDate,
			rawText: withinMatch[0],
			certainty: "calculated",
			calculationMethod: `${days} calendar days from ${startDate}`,
			startDate,
			daysWindow: days,
			businessDays: false,
			sourceExcerpt: withinMatch[0]
		}) });
	}
	const byMatch = text.match(/\bby\s+((?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4})/i);
	if (byMatch && !deadlines.some((d) => d.deadline.sourceExcerpt === byMatch[0])) {
		const dateStr = parseDate(byMatch[1]);
		if (dateStr && !deadlines.some((d) => d.deadline.date === dateStr)) deadlines.push({ deadline: createDeadline({
			type: "response",
			date: dateStr,
			rawText: byMatch[0],
			certainty: "explicit",
			sourceExcerpt: byMatch[0]
		}) });
	}
	const payByMatch = text.match(/pay\s+by\s+(.{3,40}?)(?:\.|,|\n|$)/i);
	if (payByMatch && !deadlines.some((d) => d.deadline.sourceExcerpt === payByMatch[0])) {
		const dateStr = parseDate(payByMatch[1]);
		if (dateStr && !deadlines.some((d) => d.deadline.date === dateStr)) deadlines.push({ deadline: createDeadline({
			type: "payment",
			date: dateStr,
			rawText: payByMatch[0],
			certainty: "explicit",
			sourceExcerpt: payByMatch[0]
		}) });
	}
	return deadlines;
}
function computeDateFromDays(startDate, days) {
	const start = /* @__PURE__ */ new Date(startDate + "T00:00:00");
	if (isNaN(start.getTime())) return void 0;
	const result = new Date(start);
	result.setDate(result.getDate() + days);
	return result.toISOString().split("T")[0];
}
function detectNoticeDate(text) {
	const dateMatch = text.match(/\bdate\s*:?\s*(.{5,30}?)(?:\n|$)/i);
	if (dateMatch) {
		const parsed = parseDate(dateMatch[1]);
		if (parsed) return parsed;
	}
	const datedMatch = text.match(/\bdated\s*:?\s*(.{5,30}?)(?:\n|$)/i);
	if (datedMatch) {
		const parsed = parseDate(datedMatch[1]);
		if (parsed) return parsed;
	}
	const anyDate = parseDate(text.split("\n").slice(0, 5).join("\n"));
	if (anyDate) return anyDate;
}
function extractFacts(text) {
	const facts = [];
	const agency = detectAgency(text);
	if (agency) facts.push(createFact("Issuing Agency", agency, "extracted", "high", {
		sourceExcerpt: agency,
		extractionMethod: "pattern_match"
	}));
	const refNum = detectReferenceNumber(text);
	if (refNum) facts.push(createFact("Reference Number", refNum, "extracted", "high", {
		sourceExcerpt: refNum,
		extractionMethod: "pattern_match"
	}));
	const noticeDate = detectNoticeDate(text);
	if (noticeDate) facts.push(createFact("Notice Date", noticeDate, "extracted", "high", {
		sourceExcerpt: noticeDate,
		extractionMethod: "date_parse"
	}));
	const amount = detectAmountOwed(text);
	if (amount) facts.push(createFact("Amount Owed", amount, "extracted", "high", {
		sourceExcerpt: amount,
		extractionMethod: "pattern_match"
	}));
	const deadlineMatches = text.match(/(?:respond|reply|file).{0,20}by\s+(.{3,40}?)(?:\.|,|\n|$)/gi);
	if (deadlineMatches) for (const match of deadlineMatches) {
		const dateStr = parseDate(match);
		if (dateStr && !facts.some((f) => f.label === "Response Deadline" && f.value === dateStr)) facts.push(createFact("Response Deadline", dateStr, "extracted", "high", {
			sourceExcerpt: match.substring(0, 100),
			extractionMethod: "date_parse"
		}));
	}
	const taxYearMatch = text.match(/\b(20\d{2})\s+tax\s+(?:year|return)\b/i);
	if (taxYearMatch) facts.push(createFact("Tax Year", taxYearMatch[1], "extracted", "medium", {
		sourceExcerpt: taxYearMatch[0],
		extractionMethod: "pattern_match"
	}));
	const licenseMatch = text.match(/license\s*(?:number|no\.?)\s*:?\s*([A-Z0-9][-A-Z0-9]{3,})/i);
	if (licenseMatch) facts.push(createFact("License Number", licenseMatch[1], "extracted", "high", {
		sourceExcerpt: licenseMatch[0],
		extractionMethod: "pattern_match"
	}));
	const caseNumMatch = text.match(/case\s*(?:number|no\.?)\s*:?\s*([A-Z]{0,3}[-]?\d{2,4}[-]\d{2,6})/i);
	if (caseNumMatch && !facts.some((f) => f.label === "Reference Number")) facts.push(createFact("Case Number", caseNumMatch[1], "extracted", "high", {
		sourceExcerpt: caseNumMatch[0],
		extractionMethod: "pattern_match"
	}));
	return facts;
}
function extractFromText(text) {
	const facts = extractFacts(text);
	const deadlines = detectDeadlines(text);
	const agency = detectAgency(text);
	const referenceNumber = detectReferenceNumber(text);
	const noticeDate = detectNoticeDate(text);
	const amountOwed = detectAmountOwed(text);
	const appealRights = detectAppealRights(text);
	let confidence = .2;
	if (agency) confidence += .15;
	if (referenceNumber) confidence += .15;
	if (noticeDate) confidence += .1;
	if (amountOwed) confidence += .1;
	if (deadlines.length > 0) confidence += .15;
	if (facts.length >= 4) confidence += .15;
	confidence = Math.min(.95, confidence);
	return {
		facts,
		deadlines,
		agency,
		referenceNumber,
		noticeDate,
		amountOwed,
		appealRights,
		extractionConfidence: confidence,
		rawText: text
	};
}
enumType([
	"ready",
	"needs_review",
	"incomplete",
	"blocked",
	"draft"
]);
function runReadinessReview(input) {
	const checks = [];
	let blockingIssues = 0;
	let issuesRequiringAttention = 0;
	const hasAgency = !!input.agency;
	checks.push({
		label: "Issuing agency identified",
		passed: hasAgency,
		detail: hasAgency ? `Agency: ${input.agency}` : "No agency identified",
		blocking: !hasAgency
	});
	if (!hasAgency) {
		blockingIssues++;
		issuesRequiringAttention++;
	}
	const hasRef = !!input.referenceNumber;
	checks.push({
		label: "Reference number identified",
		passed: hasRef,
		detail: hasRef ? `Reference: ${input.referenceNumber}` : "No reference number found",
		blocking: false
	});
	if (!hasRef) issuesRequiringAttention++;
	const hasDeadline = !!input.deadline.date && input.deadline.certainty !== "missing";
	checks.push({
		label: "Response deadline identified",
		passed: hasDeadline,
		detail: hasDeadline ? `Deadline: ${input.deadline.date} (${input.deadline.certainty})` : "No deadline identified",
		blocking: !hasDeadline
	});
	if (!hasDeadline) {
		blockingIssues++;
		issuesRequiringAttention++;
	}
	const factCount = input.facts.length;
	const minFacts = 2;
	checks.push({
		label: "Facts extracted from notice",
		passed: factCount >= minFacts,
		detail: `${factCount} fact(s) extracted`,
		blocking: false
	});
	if (factCount < minFacts) issuesRequiringAttention++;
	const confirmedCount = input.facts.filter((f) => f.userConfirmed || f.confidence === "high").length;
	checks.push({
		label: "Facts confirmed or high-confidence",
		passed: confirmedCount >= Math.ceil(factCount * .5),
		detail: `${confirmedCount}/${factCount} confirmed or high-confidence`,
		blocking: false
	});
	if (confirmedCount < Math.ceil(factCount * .5)) issuesRequiringAttention++;
	const hasDraft = input.draft.length > 50;
	checks.push({
		label: "Response draft generated",
		passed: hasDraft,
		detail: hasDraft ? `Draft: ${input.draft.length} chars` : "No draft generated",
		blocking: false
	});
	if (!hasDraft) issuesRequiringAttention++;
	checks.push({
		label: "Signature present",
		passed: input.hasSignature,
		detail: input.hasSignature ? "Signed" : "Missing signature",
		blocking: false
	});
	if (!input.hasSignature) issuesRequiringAttention++;
	const passedChecks = checks.filter((c) => c.passed).length;
	const score = Math.round(passedChecks / checks.length * 100);
	let state;
	if (blockingIssues > 0) state = "blocked";
	else if (score >= 85 && issuesRequiringAttention <= 1) state = "ready";
	else if (score >= 60) state = "needs_review";
	else if (score >= 30) state = "incomplete";
	else state = "draft";
	return {
		score,
		state,
		issuesRequiringAttention,
		blockingIssues,
		checks
	};
}
var strategyTypeSchema = enumType([
	"factual_correction",
	"payment_plan",
	"dispute_full",
	"dispute_partial",
	"appeal_rights",
	"request_extension",
	"request_hearing",
	"foia_request",
	"compliance_acknowledgment",
	"supplemental_submission",
	"no_response_needed"
]);
var strategySchema = objectType({
	id: stringType(),
	type: strategyTypeSchema,
	description: stringType(),
	reason: stringType().default(""),
	confidence: enumType([
		"high",
		"medium",
		"low"
	]).default("medium"),
	risks: arrayType(stringType()).default([]),
	prerequisites: arrayType(stringType()).default([])
});
var STRATEGY_TYPE_LABELS = {
	factual_correction: "Factual Correction",
	payment_plan: "Request Payment Plan",
	dispute_full: "Full Dispute",
	dispute_partial: "Partial Dispute",
	appeal_rights: "Exercise Appeal Rights",
	request_extension: "Request Extension",
	request_hearing: "Request Hearing",
	foia_request: "FOIA Request/Appeal",
	compliance_acknowledgment: "Acknowledge and Comply",
	supplemental_submission: "Supplemental Submission",
	no_response_needed: "No Response Needed"
};
function recommendStrategies(input) {
	const strategies = [];
	if (input.factConfidence === "high" && !input.hasContradictions) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "factual_correction",
		description: "Respond with corrected facts supported by documentation. Assert that the notice contains factual errors and provide the correct information.",
		reason: "High-confidence facts were extracted and no contradictions detected. A factual correction response is appropriate.",
		confidence: "high",
		risks: ["If your corrections are not accepted, you may need to escalate to an appeal."],
		prerequisites: ["Verify all corrected facts against your records", "Gather supporting documentation"]
	}));
	if (input.hasUnsupportedAllegations || input.hasContradictions) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "dispute_full",
		description: "Dispute the notice in full by challenging the factual basis and providing contradicting evidence.",
		reason: "Unsupported allegations or contradictions were detected. A full dispute may be warranted.",
		confidence: "medium",
		risks: ["Full disputes can take longer to resolve", "May trigger further investigation"],
		prerequisites: ["Gather all contradicting evidence", "Be prepared for follow-up questions"]
	}));
	if (input.hasEvidence && input.factConfidence !== "low") strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "dispute_partial",
		description: "Accept some aspects of the notice while disputing specific items with supporting evidence.",
		reason: "Evidence is available and fact confidence is reasonable. A partial dispute allows targeted challenges.",
		confidence: "medium",
		risks: ["Partial acceptance may be treated as full acceptance in some contexts"],
		prerequisites: ["Clearly identify which items you accept and which you dispute", "Provide evidence for disputed items"]
	}));
	if (input.hasPaymentDemand && !input.deadlineExpired) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "payment_plan",
		description: "Acknowledge the balance and request a payment plan or installment agreement.",
		reason: "The notice includes a payment demand and the deadline has not expired. A payment plan may be available.",
		confidence: "high",
		risks: ["Interest and penalties may continue to accrue", "Payment plans may have setup fees"],
		prerequisites: ["Know how much you can pay per month", "Be prepared to provide financial information"]
	}));
	if (input.hasAppealRights) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "appeal_rights",
		description: "Exercise your appeal rights by filing a formal appeal with the appropriate body.",
		reason: "The notice explicitly states you have appeal rights. This preserves your options.",
		confidence: "high",
		risks: ["Appeals have strict deadlines", "May require additional documentation or representation"],
		prerequisites: ["Confirm the appeal deadline", "Understand the appeal process for this agency"]
	}));
	if (input.hasDeadline && !input.deadlineExpired && input.hasMissingInformation) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "request_extension",
		description: "Request an extension of the response deadline while you gather missing information.",
		reason: "The deadline has not expired and information is missing. An extension may provide additional time.",
		confidence: "medium",
		risks: ["Extensions are not guaranteed", "Some agencies do not offer extensions"],
		prerequisites: ["Contact the agency before the deadline expires", "Explain what information you are gathering"]
	}));
	if (input.hasProceduralIssues || input.noticeType === "license_suspension") strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "request_hearing",
		description: "Request a formal hearing to contest the proposed action.",
		reason: "Procedural issues were detected or this notice type typically allows for hearings.",
		confidence: "high",
		risks: ["Hearings may require legal representation", "Strict deadlines for hearing requests"],
		prerequisites: ["Confirm hearing request deadline", "Consider consulting an attorney"]
	}));
	if (input.hasEvidence && !input.hasContradictions) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "supplemental_submission",
		description: "Provide supplemental documentation to support your position without disputing the notice.",
		reason: "Evidence is available and no contradictions detected. A supplemental submission may resolve the matter.",
		confidence: "medium",
		risks: ["May not change the outcome if the notice is factually correct"],
		prerequisites: ["Organize documents clearly", "Include a cover letter explaining each document"]
	}));
	if (input.factConfidence === "high" && !input.hasContradictions && !input.hasUnsupportedAllegations) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "compliance_acknowledgment",
		description: "Acknowledge the notice and confirm compliance with the requirements.",
		reason: "Facts are high-confidence with no contradictions or unsupported allegations. The notice appears correct.",
		confidence: "high",
		risks: ["Only appropriate if you agree with the notice"],
		prerequisites: ["Review the notice carefully", "Confirm you can meet the requirements"]
	}));
	if (strategies.length === 0) strategies.push(strategySchema.parse({
		id: crypto.randomUUID(),
		type: "supplemental_submission",
		description: "Provide a written response with any supporting information and documentation.",
		reason: "A written response with supporting documentation is always better than no response.",
		confidence: "low",
		risks: ["May not address the core issue"],
		prerequisites: ["Review the notice", "Gather relevant documents"]
	}));
	return strategies;
}
function generateResponseDraft(input) {
	const placeholders = [];
	const agencyName = input.agency ?? (() => {
		placeholders.push({
			placeholder: "AGENCY_NAME",
			reason: "No issuing agency was identified"
		});
		return "[AGENCY_NAME]";
	})();
	const refLine = input.referenceNumber ? `Re: ${input.referenceNumber}` : (() => {
		placeholders.push({
			placeholder: "REFERENCE_NUMBER",
			reason: "No reference or case number was found"
		});
		return "Re: [REFERENCE_NUMBER]";
	})();
	const noticeDateLine = input.noticeDate ? `Notice Date: ${input.noticeDate}` : "";
	const deadlineLine = input.deadline.date ? `Response Deadline: ${input.deadline.date}` : (() => {
		placeholders.push({
			placeholder: "DEADLINE",
			reason: "No response deadline was identified"
		});
		return "Response Deadline: [DEADLINE]";
	})();
	const strategyLabel = STRATEGY_TYPE_LABELS[input.selectedStrategy.type];
	let opening;
	switch (input.selectedStrategy.type) {
		case "factual_correction":
			opening = "I am writing to correct factual errors in the notice referenced above. After reviewing the notice against my records, I have identified several inaccuracies that I would like to address.";
			break;
		case "dispute_full":
			opening = "I am writing to formally dispute the notice referenced above in its entirety. The factual basis of the notice is incorrect, and I am providing documentation to support my position.";
			break;
		case "dispute_partial":
			opening = "I am writing regarding the notice referenced above. While I acknowledge certain aspects of the notice, I am disputing specific items as described below.";
			break;
		case "payment_plan":
			opening = "I am writing to acknowledge the balance referenced in the notice and to request a payment plan or installment agreement to satisfy the amount owed.";
			break;
		case "appeal_rights":
			opening = "I am writing to exercise my appeal rights as stated in the notice referenced above. I respectfully request that this matter be reviewed through the formal appeal process.";
			break;
		case "request_extension":
			opening = "I am writing to request an extension of the response deadline for the notice referenced above. I am in the process of gathering information needed to provide a complete response.";
			break;
		case "request_hearing":
			opening = "I am writing to formally request a hearing regarding the proposed action referenced above. I wish to contest this action and present my case.";
			break;
		case "foia_request":
			opening = "I am writing to appeal the determination regarding my records request referenced above. I believe additional records exist that should be disclosed.";
			break;
		case "compliance_acknowledgment":
			opening = "I am writing to acknowledge receipt of the notice referenced above and to confirm my compliance with the requirements stated therein.";
			break;
		case "supplemental_submission":
			opening = "I am writing in response to the notice referenced above and am providing supplemental documentation in support of my position.";
			break;
		default: opening = "I am writing in response to the notice referenced above.";
	}
	const factLines = input.facts.length > 0 ? input.facts.map((f) => `  • ${f.label}: ${f.value}`).join("\n") : (() => {
		placeholders.push({
			placeholder: "FACTS",
			reason: "No facts were extracted from the notice"
		});
		return "  [FACTS — no facts were automatically extracted]";
	})();
	const userFactsLine = input.userFacts ? `\nAdditional information from my records:\n${input.userFacts}` : "";
	const objectiveLine = input.userObjective ? `\nMy objective in this response: ${input.userObjective}` : "";
	const evidenceSection = "Please find enclosed the following supporting documentation:\n  [LIST ENCLOSED DOCUMENTS]";
	const closing = input.hasSignature ? "Sincerely,\n[YOUR NAME]" : (() => {
		placeholders.push({
			placeholder: "SIGNATURE",
			reason: "No signature provided"
		});
		return "Sincerely,\n[YOUR NAME]";
	})();
	const content = [
		refLine,
		noticeDateLine,
		deadlineLine,
		"",
		`Dear ${agencyName},`,
		"",
		opening,
		"",
		"The following information was identified from the notice:",
		factLines,
		userFactsLine,
		objectiveLine,
		"",
		evidenceSection,
		"",
		input.selectedStrategy.reason ? `My response strategy: ${strategyLabel}. ${input.selectedStrategy.reason}` : "",
		"",
		"I respectfully request that you consider this response in a timely manner. If you require additional information, please contact me at your earliest convenience.",
		"",
		closing
	].filter((line) => line !== "").join("\n");
	return {
		content,
		wordCount: content.split(/\s+/).filter(Boolean).length,
		unresolvedPlaceholders: placeholders
	};
}
var trustLevelSchema = enumType([
	"system",
	"application",
	"user",
	"untrusted"
]);
var contentClassificationSchema = objectType({
	isInstruction: booleanType().default(false),
	isData: booleanType().default(true),
	trustLevel: trustLevelSchema.default("untrusted"),
	detectedInjectionPatterns: arrayType(stringType()).default([]),
	sanitized: booleanType().default(false),
	originalLength: numberType().default(0),
	sanitizedLength: numberType().default(0)
});
var INJECTION_PATTERNS = [
	{
		pattern: /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/i,
		label: "ignore-previous-instructions"
	},
	{
		pattern: /disregard\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions?|prompts?|rules?)/i,
		label: "disregard-previous-instructions"
	},
	{
		pattern: /(?:reveal|show|print|output|display)\s+(?:the\s+)?(?:system\s+)?(?:prompt|instructions?|rules?)/i,
		label: "reveal-system-prompt"
	},
	{
		pattern: /(?:you\s+are|act\s+as|pretend\s+(?:to\s+be|you're))\s+(?:now|a\s+|an\s+)/i,
		label: "role-injection"
	},
	{
		pattern: /treat\s+(?:the\s+)?following\s+as\s+(?:developer|system|admin|privileged)\s+instructions?/i,
		label: "privilege-escalation"
	},
	{
		pattern: /(?:send|email|post|upload|share|forward)\s+(?:this\s+)?(?:document|file|text|content)\s+to/i,
		label: "exfiltration-request"
	},
	{
		pattern: /(?:execute|run|eval|call)\s+(?:the\s+)?(?:following|this)\s+/i,
		label: "code-execution"
	},
	{
		pattern: /(?:new\s+instructions?|updated?\s+rules?|override)\s*:/i,
		label: "instruction-override"
	},
	{
		pattern: /(?:I\s+am|this\s+is)\s+(?:the\s+)?(?:admin|developer|system|root)/i,
		label: "identity-impersonation"
	},
	{
		pattern: /(?:forget|erase|delete|remove)\s+(?:all\s+)?(?:previous|prior|your)\s+(?:instructions?|memory|context)/i,
		label: "memory-wipe"
	},
	{
		pattern: /(?:IMPORTANT|URGENT|CRITICAL)\s*:\s*(?:ignore|disregard|override)/i,
		label: "urgency-injection"
	},
	{
		pattern: /(?:system|developer|admin)\s*(?:prompt|instruction|message)\s*:/i,
		label: "fake-system-message"
	}
];
function classifyContent(text, declaredTrust = "untrusted") {
	const detected = [];
	for (const { pattern, label } of INJECTION_PATTERNS) if (pattern.test(text)) detected.push(label);
	const isInstruction = detected.length > 0;
	return contentClassificationSchema.parse({
		isInstruction,
		isData: !isInstruction,
		trustLevel: declaredTrust,
		detectedInjectionPatterns: detected,
		sanitized: false,
		originalLength: text.length,
		sanitizedLength: text.length
	});
}
objectType({
	maxFileSizeBytes: numberType().default(10485760),
	allowedMimeTypes: arrayType(stringType()).default([
		"application/pdf",
		"image/jpeg",
		"image/png",
		"image/webp",
		"text/plain"
	]),
	allowedExtensions: arrayType(stringType()).default([
		".pdf",
		".jpg",
		".jpeg",
		".png",
		".webp",
		".txt"
	]),
	maxFilenameLength: numberType().default(255),
	rejectExecutableTypes: booleanType().default(true)
});
function sanitizeTextInput(text, maxLength = 5e4) {
	if (!text || typeof text !== "string") return "";
	return text.replace(/\0/g, "").replace(/\uFFFD/g, "").substring(0, maxLength);
}
function validateTextInput(text, maxLength = 5e4) {
	const warnings = [];
	if (!text) return {
		valid: false,
		sanitized: "",
		warnings: ["Input is empty"]
	};
	if (text.length > maxLength) warnings.push(`Input truncated to ${maxLength} characters`);
	const classification = classifyContent(text, "user");
	if (classification.detectedInjectionPatterns.length > 0) warnings.push(`Potential injection patterns detected: ${classification.detectedInjectionPatterns.join(", ")}`);
	return {
		valid: true,
		sanitized: sanitizeTextInput(text, maxLength),
		warnings
	};
}
var contradictionTypeSchema = enumType([
	"date_conflict",
	"amount_conflict",
	"name_conflict",
	"address_conflict",
	"fact_conflict",
	"deadline_conflict",
	"evidence_vs_fact",
	"user_vs_extracted",
	"document_vs_document"
]);
var contradictionSchema = objectType({
	id: stringType(),
	type: contradictionTypeSchema,
	field: stringType(),
	sources: arrayType(objectType({
		sourceId: stringType(),
		sourceType: enumType([
			"extracted",
			"user",
			"evidence",
			"document"
		]),
		value: stringType(),
		label: stringType().optional()
	})),
	description: stringType(),
	severity: enumType([
		"critical",
		"high",
		"medium",
		"low"
	]),
	status: enumType([
		"unresolved",
		"resolved",
		"dismissed"
	]).default("unresolved"),
	resolvedValue: stringType().optional(),
	resolvedBy: stringType().optional(),
	resolvedAt: stringType().optional(),
	createdAt: stringType()
});
function createContradiction(params) {
	return contradictionSchema.parse({
		id: crypto.randomUUID(),
		type: params.type,
		field: params.field,
		sources: params.sources,
		description: params.description,
		severity: params.severity || "medium",
		status: "unresolved",
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function detectContradictions(input) {
	const contradictions = [];
	const dateFacts = input.facts.filter((f) => /date/i.test(f.label) && f.value);
	const uniqueDates = /* @__PURE__ */ new Map();
	for (const fact of dateFacts) {
		const key = fact.label.toLowerCase();
		if (!uniqueDates.has(key)) uniqueDates.set(key, []);
		uniqueDates.get(key).push(fact);
	}
	for (const [label, facts] of uniqueDates) {
		const values = new Set(facts.map((f) => f.value));
		if (values.size > 1) contradictions.push(createContradiction({
			type: "date_conflict",
			field: label,
			sources: facts.map((f) => ({
				sourceId: f.id,
				sourceType: "extracted",
				value: f.value,
				label: f.label
			})),
			description: `Multiple different dates found for "${label}": ${[...values].join(", ")}`,
			severity: "high"
		}));
	}
	const amountFacts = input.facts.filter((f) => /amount|owed|due|balance|penalty/i.test(f.label) && f.value);
	const amountGroups = /* @__PURE__ */ new Map();
	for (const fact of amountFacts) {
		const key = fact.label.toLowerCase();
		if (!amountGroups.has(key)) amountGroups.set(key, []);
		amountGroups.get(key).push(fact);
	}
	for (const [label, facts] of amountGroups) {
		const values = new Set(facts.map((f) => f.value));
		if (values.size > 1) contradictions.push(createContradiction({
			type: "amount_conflict",
			field: label,
			sources: facts.map((f) => ({
				sourceId: f.id,
				sourceType: "extracted",
				value: f.value,
				label: f.label
			})),
			description: `Conflicting amounts for "${label}": ${[...values].join(" vs ")}`,
			severity: "high"
		}));
	}
	const deadlinesWithDates = input.deadlines.filter((d) => d.date);
	if (deadlinesWithDates.length > 1) {
		const dates = new Set(deadlinesWithDates.map((d) => d.date));
		if (dates.size > 1) contradictions.push(createContradiction({
			type: "deadline_conflict",
			field: "response_deadline",
			sources: deadlinesWithDates.map((d, i) => ({
				sourceId: `deadline_${i}`,
				sourceType: "extracted",
				value: d.date,
				label: d.rawText || "deadline"
			})),
			description: `Multiple response deadlines found: ${[...dates].join(", ")}`,
			severity: "critical"
		}));
	}
	if (input.userFacts) for (const fact of input.facts) {
		if (input.userFacts.toLowerCase().includes(fact.value.toLowerCase())) continue;
		if (fact.confidence === "high" && /never|not|incorrect|wrong|false|disagree/i.test(input.userFacts)) {
			if (fact.value.length > 3 && input.userFacts.toLowerCase().includes(fact.label.toLowerCase().split(" ")[0])) contradictions.push(createContradiction({
				type: "user_vs_extracted",
				field: fact.label,
				sources: [{
					sourceId: fact.id,
					sourceType: "extracted",
					value: fact.value,
					label: fact.label
				}, {
					sourceId: "user_input",
					sourceType: "user",
					value: input.userFacts.substring(0, 200),
					label: "User statement"
				}],
				description: `User statement may contradict extracted fact "${fact.label}"`,
				severity: "medium"
			}));
		}
	}
	for (const fact of input.facts) for (const evidence of input.evidence) if (evidence.relationships.some((r) => r.factId === fact.id && r.relationship === "contradicts")) contradictions.push(createContradiction({
		type: "evidence_vs_fact",
		field: fact.label,
		sources: [{
			sourceId: fact.id,
			sourceType: "extracted",
			value: fact.value,
			label: fact.label
		}, {
			sourceId: evidence.id,
			sourceType: "evidence",
			value: evidence.label,
			label: "Evidence"
		}],
		description: `Evidence "${evidence.label}" contradicts fact "${fact.label}: ${fact.value}"`,
		severity: "high"
	}));
	return contradictions;
}
function resolveContradiction(c, resolvedValue, resolvedBy) {
	return contradictionSchema.parse({
		...c,
		status: "resolved",
		resolvedValue,
		resolvedBy,
		resolvedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function contradictionSummary(contradictions) {
	return {
		total: contradictions.length,
		unresolved: contradictions.filter((c) => c.status === "unresolved").length,
		critical: contradictions.filter((c) => c.severity === "critical" && c.status === "unresolved").length,
		byType: contradictions.reduce((acc, c) => {
			acc[c.type] = (acc[c.type] || 0) + 1;
			return acc;
		}, {})
	};
}
var missingInfoCategorySchema = enumType([
	"deadline",
	"identity",
	"amount",
	"date",
	"document",
	"address",
	"evidence",
	"procedural",
	"recipient",
	"other"
]);
var missingInfoItemSchema = objectType({
	id: stringType(),
	category: missingInfoCategorySchema,
	field: stringType(),
	label: stringType(),
	whyItMatters: stringType(),
	impact: enumType([
		"blocking",
		"high",
		"medium",
		"low"
	]).default("medium"),
	status: enumType([
		"missing",
		"provided",
		"not_applicable",
		"deferred"
	]).default("missing"),
	resolvedValue: stringType().optional(),
	resolvedAt: stringType().optional(),
	suggestedActions: arrayType(stringType()).default([]),
	relatedFactId: stringType().optional(),
	relatedFindingId: stringType().optional(),
	createdAt: stringType()
});
function createMissingInfo(params) {
	return missingInfoItemSchema.parse({
		id: crypto.randomUUID(),
		category: params.category,
		field: params.field,
		label: params.label,
		whyItMatters: params.whyItMatters,
		impact: params.impact || "medium",
		status: "missing",
		suggestedActions: params.suggestedActions || [],
		relatedFactId: params.relatedFactId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function detectMissingInfo(input) {
	const items = [];
	const primaryDeadline = input.deadlines[0];
	if (!primaryDeadline?.date || primaryDeadline.certainty === "missing") items.push(createMissingInfo({
		category: "deadline",
		field: "response_deadline",
		label: "Response deadline",
		whyItMatters: "Without a deadline, the system cannot assess urgency or ensure timely filing.",
		impact: "blocking",
		suggestedActions: ["Check the notice for any deadline language", "Contact the issuing agency to confirm"]
	}));
	else if (primaryDeadline.certainty === "ambiguous") items.push(createMissingInfo({
		category: "deadline",
		field: "response_deadline",
		label: "Confirm ambiguous deadline",
		whyItMatters: "The deadline language is unclear. An incorrect deadline could cause a missed filing.",
		impact: "high",
		suggestedActions: ["Review the exact deadline text", "Verify with the issuing agency"]
	}));
	if (!input.agency) items.push(createMissingInfo({
		category: "identity",
		field: "issuing_agency",
		label: "Issuing agency",
		whyItMatters: "The issuing agency determines where to send the response and what format is required.",
		impact: "blocking",
		suggestedActions: ["Check the letterhead or header of the notice", "Look for agency contact information"]
	}));
	if (!input.referenceNumber) items.push(createMissingInfo({
		category: "identity",
		field: "reference_number",
		label: "Reference / case number",
		whyItMatters: "The reference number is typically required in the response to identify your case.",
		impact: "high",
		suggestedActions: ["Check the top of the notice for a case/notice number", "Look for a reference or control number"]
	}));
	if (!input.noticeDate) items.push(createMissingInfo({
		category: "date",
		field: "notice_date",
		label: "Notice date",
		whyItMatters: "The notice date may be needed for deadline calculations and referencing in the response.",
		impact: "medium",
		suggestedActions: ["Look for a date at the top of the notice", "Check for 'dated' language"]
	}));
	if (input.recipient && (!input.recipient.name || !input.recipient.address1)) items.push(createMissingInfo({
		category: "recipient",
		field: "recipient_address",
		label: "Mailing address for response",
		whyItMatters: "The response cannot be mailed without a complete recipient address.",
		impact: "blocking",
		suggestedActions: ["Check the notice for a response mailing address", "Look for 'send your response to'"]
	}));
	const uncertainFacts = input.facts.filter((f) => f.confidence !== "high" && !f.userConfirmed);
	for (const fact of uncertainFacts) items.push(createMissingInfo({
		category: "evidence",
		field: `fact_${fact.id}`,
		label: `Verify: ${fact.label}`,
		whyItMatters: `This fact was extracted with ${fact.confidence} confidence. Verify it against the source document.`,
		impact: "medium",
		suggestedActions: ["Compare against the original document", "Confirm or correct the value"],
		relatedFactId: fact.id
	}));
	if (input.evidence.length === 0) items.push(createMissingInfo({
		category: "evidence",
		field: "supporting_evidence",
		label: "Supporting evidence",
		whyItMatters: "Evidence strengthens the response. Many disputes are won with documentation.",
		impact: "medium",
		suggestedActions: ["Gather receipts, forms, prior correspondence", "Upload documents that support your position"]
	}));
	return items;
}
function resolveMissingInfo(item, value) {
	return missingInfoItemSchema.parse({
		...item,
		status: "provided",
		resolvedValue: value,
		resolvedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function missingInfoSummary(items) {
	return {
		total: items.length,
		missing: items.filter((i) => i.status === "missing").length,
		blocking: items.filter((i) => i.status === "missing" && i.impact === "blocking").length,
		provided: items.filter((i) => i.status === "provided").length,
		byCategory: items.reduce((acc, i) => {
			acc[i.category] = (acc[i.category] || 0) + 1;
			return acc;
		}, {})
	};
}
var healthDimensionSchema = objectType({
	name: stringType(),
	label: stringType(),
	score: numberType().min(0).max(100),
	status: enumType([
		"good",
		"warning",
		"poor",
		"unknown"
	]),
	detail: stringType(),
	isHeuristic: booleanType().default(true)
});
var healthStatusSchema = enumType([
	"ready",
	"needs_review",
	"incomplete",
	"conflicting",
	"high_risk"
]);
var caseHealthSchema = objectType({
	id: stringType(),
	overallScore: numberType().min(0).max(100),
	status: healthStatusSchema,
	dimensions: arrayType(healthDimensionSchema),
	summary: stringType(),
	isHeuristic: booleanType().default(true),
	createdAt: stringType()
});
function assessCaseHealth(input) {
	const dimensions = [];
	const docScore = input.hasDraft ? Math.min(100, 50 + input.draftWordCount) : 0;
	dimensions.push({
		name: "document_quality",
		label: "Document Quality",
		score: docScore,
		status: docScore >= 70 ? "good" : docScore >= 40 ? "warning" : "poor",
		detail: input.hasDraft ? `Draft has ${input.draftWordCount} words.` : "No draft generated.",
		isHeuristic: true
	});
	const confirmedFacts = input.facts.filter((f) => f.userConfirmed || f.confidence === "high");
	const factScore = input.facts.length > 0 ? Math.round(confirmedFacts.length / input.facts.length * 100) : 0;
	dimensions.push({
		name: "fact_completeness",
		label: "Fact Completeness",
		score: factScore,
		status: factScore >= 80 ? "good" : factScore >= 50 ? "warning" : "poor",
		detail: `${confirmedFacts.length}/${input.facts.length} facts confirmed.`,
		isHeuristic: true
	});
	const evidenceScore = Math.min(100, input.evidence.length * 25);
	dimensions.push({
		name: "evidence_completeness",
		label: "Evidence Completeness",
		score: evidenceScore,
		status: evidenceScore >= 75 ? "good" : evidenceScore >= 25 ? "warning" : "poor",
		detail: `${input.evidence.length} evidence item(s) attached.`,
		isHeuristic: true
	});
	const primaryDeadline = input.deadlines[0];
	let deadlineScore = 0;
	let deadlineStatus = "unknown";
	if (primaryDeadline?.date && primaryDeadline.certainty === "explicit") {
		deadlineScore = 100;
		deadlineStatus = "good";
	} else if (primaryDeadline?.date && primaryDeadline.certainty === "calculated") {
		deadlineScore = 70;
		deadlineStatus = "warning";
	} else if (primaryDeadline?.date && primaryDeadline.certainty === "inferred") {
		deadlineScore = 50;
		deadlineStatus = "warning";
	} else if (primaryDeadline?.certainty === "ambiguous") {
		deadlineScore = 30;
		deadlineStatus = "poor";
	} else {
		deadlineScore = 0;
		deadlineStatus = "poor";
	}
	dimensions.push({
		name: "deadline_certainty",
		label: "Deadline Certainty",
		score: deadlineScore,
		status: deadlineStatus,
		detail: primaryDeadline?.date ? `Deadline: ${primaryDeadline.date} (${primaryDeadline.certainty})` : "No deadline identified.",
		isHeuristic: true
	});
	const unresolvedContradictions = input.contradictions.filter((c) => c.status === "unresolved");
	const contradictionScore = Math.max(0, 100 - unresolvedContradictions.length * 30);
	dimensions.push({
		name: "contradictions",
		label: "Contradictions",
		score: contradictionScore,
		status: unresolvedContradictions.length === 0 ? "good" : unresolvedContradictions.length <= 1 ? "warning" : "poor",
		detail: unresolvedContradictions.length === 0 ? "No contradictions detected." : `${unresolvedContradictions.length} unresolved contradiction(s).`,
		isHeuristic: true
	});
	const blockingMissing = input.missingInfo.filter((m) => m.status === "missing" && m.impact === "blocking");
	const totalMissing = input.missingInfo.filter((m) => m.status === "missing");
	const missingScore = Math.max(0, 100 - totalMissing.length * 10 - blockingMissing.length * 20);
	dimensions.push({
		name: "missing_information",
		label: "Missing Information",
		score: missingScore,
		status: blockingMissing.length === 0 && totalMissing.length <= 2 ? "good" : blockingMissing.length > 0 ? "poor" : "warning",
		detail: `${totalMissing.length} missing item(s), ${blockingMissing.length} blocking.`,
		isHeuristic: true
	});
	dimensions.push({
		name: "response_readiness",
		label: "Response Readiness",
		score: input.readinessScore,
		status: input.readinessScore >= 80 ? "good" : input.readinessScore >= 50 ? "warning" : "poor",
		detail: `Readiness: ${input.readinessState.replace(/_/g, " ")} (${input.readinessScore}/100)`,
		isHeuristic: true
	});
	const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);
	let status;
	if (blockingMissing.length > 0 || unresolvedContradictions.some((c) => c.severity === "critical")) status = "high_risk";
	else if (unresolvedContradictions.length > 0) status = "conflicting";
	else if (overallScore >= 80) status = "ready";
	else if (overallScore >= 50) status = "needs_review";
	else status = "incomplete";
	const summary = buildHealthSummary(dimensions, overallScore, status);
	return caseHealthSchema.parse({
		id: crypto.randomUUID(),
		overallScore,
		status,
		dimensions,
		summary,
		isHeuristic: true,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function buildHealthSummary(dimensions, overallScore, status) {
	const lines = [];
	lines.push(`Case health: ${status.toUpperCase()} (${overallScore}/100)`);
	lines.push("Scores are heuristic-based, not statistically validated.");
	const poor = dimensions.filter((d) => d.status === "poor");
	const warning = dimensions.filter((d) => d.status === "warning");
	if (poor.length > 0) lines.push(`Needs attention: ${poor.map((d) => d.label).join(", ")}`);
	if (warning.length > 0) lines.push(`Review recommended: ${warning.map((d) => d.label).join(", ")}`);
	return lines.join(" ");
}
var HEALTH_STATUS_META = {
	ready: {
		label: "Ready",
		color: "green",
		description: "Case is ready for response generation."
	},
	needs_review: {
		label: "Needs Review",
		color: "amber",
		description: "Some items need verification before proceeding."
	},
	incomplete: {
		label: "Incomplete",
		color: "yellow",
		description: "Critical information is missing."
	},
	conflicting: {
		label: "Conflicting",
		color: "red",
		description: "Contradictions detected that need resolution."
	},
	high_risk: {
		label: "High Risk",
		color: "red",
		description: "Blocking issues prevent proceeding."
	}
};
var actionPrioritySchema = enumType([
	"critical",
	"high",
	"medium",
	"low"
]);
var nextActionSchema = objectType({
	id: stringType(),
	priority: actionPrioritySchema,
	title: stringType(),
	what: stringType(),
	why: stringType(),
	impact: stringType(),
	category: enumType([
		"deadline",
		"evidence",
		"fact",
		"contradiction",
		"missing_info",
		"response",
		"review",
		"mailing"
	]),
	status: enumType([
		"pending",
		"in_progress",
		"completed",
		"dismissed"
	]).default("pending"),
	relatedObjectId: stringType().optional(),
	createdAt: stringType()
});
function createAction(params) {
	return nextActionSchema.parse({
		id: crypto.randomUUID(),
		priority: params.priority,
		title: params.title,
		what: params.what,
		why: params.why,
		impact: params.impact,
		category: params.category,
		status: "pending",
		relatedObjectId: params.relatedObjectId,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function generateActionQueue(input) {
	const actions = [];
	for (const item of input.missingInfo.filter((m) => m.status === "missing" && m.impact === "blocking")) actions.push(createAction({
		priority: "critical",
		title: item.label,
		what: `Provide: ${item.label}`,
		why: item.whyItMatters,
		impact: "Blocking — case cannot proceed without this information.",
		category: "missing_info",
		relatedObjectId: item.field
	}));
	for (const c of input.contradictions.filter((c) => c.status === "unresolved" && c.severity === "critical")) actions.push(createAction({
		priority: "critical",
		title: `Resolve contradiction: ${c.field}`,
		what: `Review conflicting values for "${c.field}" and select the correct one.`,
		why: c.description,
		impact: "Unresolved contradictions may produce an incorrect response.",
		category: "contradiction",
		relatedObjectId: c.field
	}));
	if (input.deadlineUrgency === "expired") actions.push(createAction({
		priority: "critical",
		title: "Contact the issuing agency immediately",
		what: "The response deadline has passed. Contact the agency to determine if a late response is still possible.",
		why: "The deadline has expired. Late responses may not be accepted.",
		impact: "Your rights may be at risk. Act immediately.",
		category: "deadline"
	}));
	if (input.deadlineUrgency === "critical" && input.deadlineDaysRemaining !== null && input.deadlineDaysRemaining > 0) actions.push(createAction({
		priority: "high",
		title: `Respond within ${input.deadlineDaysRemaining} day(s)`,
		what: "The deadline is imminent. Generate and send your response immediately.",
		why: `Only ${input.deadlineDaysRemaining} day(s) remaining.`,
		impact: "Missing this deadline could forfeit your rights.",
		category: "deadline"
	}));
	const unverifiedImportantFacts = input.facts.filter((f) => !f.userConfirmed && f.confidence !== "high" && /amount|date|deadline|agency|reference/i.test(f.label));
	for (const f of unverifiedImportantFacts) actions.push(createAction({
		priority: "high",
		title: `Verify: ${f.label}`,
		what: `Confirm the extracted value for "${f.label}" against the source document.`,
		why: `This fact was extracted with ${f.confidence} confidence and is important for the response.`,
		impact: "An incorrect value could weaken your response or cause errors.",
		category: "fact"
	}));
	for (const c of input.contradictions.filter((c) => c.status === "unresolved" && c.severity === "high")) actions.push(createAction({
		priority: "high",
		title: `Resolve: ${c.field}`,
		what: `Review the conflicting information for "${c.field}".`,
		why: c.description,
		impact: "Contradictions may undermine the credibility of your response.",
		category: "contradiction"
	}));
	for (const item of input.missingInfo.filter((m) => m.status === "missing" && m.impact !== "blocking")) actions.push(createAction({
		priority: "medium",
		title: item.label,
		what: `Provide: ${item.label}`,
		why: item.whyItMatters,
		impact: "Not blocking, but resolving this strengthens the case.",
		category: "missing_info",
		relatedObjectId: item.field
	}));
	if (input.evidenceCount === 0) actions.push(createAction({
		priority: "medium",
		title: "Attach supporting evidence",
		what: "Upload documents that support your position (receipts, forms, prior correspondence).",
		why: "Evidence strengthens your response and may be required for disputes.",
		impact: "A response with evidence is more likely to succeed.",
		category: "evidence"
	}));
	if (input.hasDraft && input.draftPlaceholders > 0) actions.push(createAction({
		priority: "high",
		title: `Resolve ${input.draftPlaceholders} placeholder(s) in draft`,
		what: "Review and fill in the placeholder items marked [brackets] in the response draft.",
		why: "Placeholders represent missing information that must be resolved before sending.",
		impact: "A draft with placeholders is not ready to send.",
		category: "response"
	}));
	if (!input.hasDraft && input.readinessScore >= 50) actions.push(createAction({
		priority: "medium",
		title: "Generate response draft",
		what: "Select a response strategy and generate a draft letter.",
		why: "The case has enough information to begin drafting.",
		impact: "Generating the draft moves the case toward completion.",
		category: "response"
	}));
	const priorityOrder = {
		critical: 0,
		high: 1,
		medium: 2,
		low: 3
	};
	actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
	return actions;
}
var PRIORITY_META = {
	critical: {
		label: "Critical",
		color: "red"
	},
	high: {
		label: "High Priority",
		color: "amber"
	},
	medium: {
		label: "Medium Priority",
		color: "blue"
	},
	low: {
		label: "Low Priority",
		color: "gray"
	}
};
var qualityDimensionSchema = objectType({
	name: stringType(),
	score: numberType().min(0).max(100),
	label: stringType(),
	description: stringType(),
	issues: arrayType(stringType()).default([]),
	isHeuristic: booleanType().default(true)
});
var qualityReportSchema = objectType({
	id: stringType(),
	overallScore: numberType().min(0).max(100),
	dimensions: arrayType(qualityDimensionSchema),
	unresolvedPlaceholders: numberType().default(0),
	missingInformationCount: numberType().default(0),
	unsupportedAssertionsCount: numberType().default(0),
	internalContradictionsCount: numberType().default(0),
	passed: booleanType().default(false),
	threshold: numberType().default(70),
	summary: stringType(),
	createdAt: stringType(),
	isHeuristic: booleanType().default(true)
});
function evaluateResponseQuality(input) {
	const dimensions = [];
	const content = input.draftContent || "";
	const lowerContent = content.toLowerCase();
	const confirmedFacts = input.facts.filter((f) => f.userConfirmed || f.confidence === "high");
	const factsReferenced = confirmedFacts.filter((f) => content.includes(f.value) || lowerContent.includes(f.value.toLowerCase()));
	const factScore = confirmedFacts.length > 0 ? Math.round(factsReferenced.length / confirmedFacts.length * 100) : 100;
	dimensions.push({
		name: "factual_consistency",
		score: factScore,
		label: "Factual Consistency",
		description: `${factsReferenced.length}/${confirmedFacts.length} confirmed facts referenced in response.`,
		issues: confirmedFacts.filter((f) => !content.includes(f.value) && !lowerContent.includes(f.value.toLowerCase())).map((f) => `Fact "${f.label}" (${f.value}) not found in response`),
		isHeuristic: true
	});
	const evidenceMentioned = input.evidence.map((e) => e.label.toLowerCase()).filter((kw) => lowerContent.includes(kw) || lowerContent.includes("exhibit") || lowerContent.includes("enclosed") || lowerContent.includes("attachment"));
	const evidenceScore = input.evidence.length > 0 ? Math.min(100, Math.round(evidenceMentioned.length / Math.max(1, input.evidence.length) * 100) + (lowerContent.includes("enclosed") ? 20 : 0)) : content.includes("SUPPORTING DOCUMENTATION") ? 80 : 50;
	dimensions.push({
		name: "evidence_coverage",
		score: Math.min(100, evidenceScore),
		label: "Evidence Coverage",
		description: input.evidence.length > 0 ? `${evidenceMentioned.length}/${input.evidence.length} evidence items referenced.` : "No evidence attached.",
		issues: evidenceScore < 70 && input.evidence.length > 0 ? ["Response should reference attached evidence"] : [],
		isHeuristic: true
	});
	let deadlineScore = 100;
	const deadlineIssues = [];
	if (input.deadline?.date && content) {
		if (!content.includes(input.deadline.date) && !lowerContent.includes("deadline")) {
			deadlineScore = 70;
			deadlineIssues.push("Response deadline not mentioned in draft");
		}
	}
	if (input.deadline?.certainty === "missing" || input.deadline?.certainty === "ambiguous") {
		deadlineScore = Math.min(deadlineScore, 60);
		deadlineIssues.push("Deadline certainty is low — verify before finalizing");
	}
	dimensions.push({
		name: "deadline_consistency",
		score: deadlineScore,
		label: "Deadline Consistency",
		description: input.deadline?.date ? `Deadline ${input.deadline.date} referenced.` : "No deadline identified.",
		issues: deadlineIssues,
		isHeuristic: true
	});
	const missingInfoCount = input.unresolvedPlaceholders.length;
	const missingScore = Math.max(0, 100 - missingInfoCount * 15);
	dimensions.push({
		name: "missing_information",
		score: missingScore,
		label: "Completeness",
		description: `${missingInfoCount} unresolved placeholder(s) in draft.`,
		issues: input.unresolvedPlaceholders.map((p) => `[${p.placeholder}]: ${p.reason}`),
		isHeuristic: true
	});
	const unsupportedCount = detectUnsupportedAssertions(content, input.facts, input.evidence);
	const unsupportedScore = Math.max(0, 100 - unsupportedCount * 20);
	dimensions.push({
		name: "unsupported_assertions",
		score: unsupportedScore,
		label: "Evidence Backing",
		description: `${unsupportedCount} potential unsupported assertion(s) detected.`,
		issues: unsupportedCount > 0 ? ["Some claims may not be backed by extracted facts or evidence"] : [],
		isHeuristic: true
	});
	const contradictions = detectInternalContradictions(content);
	const contradictionScore = Math.max(0, 100 - contradictions * 25);
	dimensions.push({
		name: "internal_contradictions",
		score: contradictionScore,
		label: "Internal Consistency",
		description: `${contradictions} potential internal contradiction(s).`,
		issues: contradictions > 0 ? ["Response may contain contradictory statements"] : [],
		isHeuristic: true
	});
	let formatScore = 100;
	const formatIssues = [];
	if (content.length < 50) {
		formatScore = 20;
		formatIssues.push("Response is too short");
	}
	if (content.length > 1e4) {
		formatScore -= 10;
		formatIssues.push("Response is very long");
	}
	if (!content.includes("\n")) {
		formatScore -= 20;
		formatIssues.push("Response lacks paragraph breaks");
	}
	if (!/Dear (Sir|Madam|Mr\.|Ms\.|Dr\.|To Whom)/i.test(content)) {
		formatScore -= 15;
		formatIssues.push("Missing formal salutation");
	}
	if (!/Sincerely|Respectfully|Regards/i.test(content)) {
		formatScore -= 10;
		formatIssues.push("Missing formal closing");
	}
	dimensions.push({
		name: "format_validity",
		score: Math.max(0, formatScore),
		label: "Format Validity",
		description: "Structural completeness of the response letter.",
		issues: formatIssues,
		isHeuristic: true
	});
	let toneScore = 100;
	const toneIssues = [];
	if (/\b(stupid|incompetent|ridiculous|absurd|moron|idiot|liar|fraud|illegal)\b/i.test(content)) {
		toneScore = 40;
		toneIssues.push("Response contains aggressive or unprofessional language");
	}
	if (/\b(yeah|nah|lol|ok\s+so|hey\s+there|what's\s+up)\b/i.test(content)) {
		toneScore -= 20;
		toneIssues.push("Response contains overly casual language");
	}
	dimensions.push({
		name: "tone",
		score: Math.max(0, toneScore),
		label: "Professional Tone",
		description: "Appropriateness of tone for official correspondence.",
		issues: toneIssues,
		isHeuristic: true
	});
	const overallScore = Math.round(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);
	const passed = overallScore >= 70 && missingInfoCount === 0;
	const summary = buildSummary(dimensions, overallScore, missingInfoCount, unsupportedCount, contradictions, passed);
	return qualityReportSchema.parse({
		id: crypto.randomUUID(),
		overallScore,
		dimensions,
		unresolvedPlaceholders: missingInfoCount,
		missingInformationCount: missingInfoCount,
		unsupportedAssertionsCount: unsupportedCount,
		internalContradictionsCount: contradictions,
		passed,
		threshold: 70,
		summary,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		isHeuristic: true
	});
}
function detectUnsupportedAssertions(content, facts, evidence) {
	let count = 0;
	for (const pattern of [/\b(?:I never|I did not|I have never|this is false|this is incorrect|these allegations are (?:false|baseless|without merit))\b/i]) {
		const matches = content.match(new RegExp(pattern.source, "gi"));
		if (matches) {
			if (matches.length > facts.length) count += matches.length - facts.length;
		}
	}
	return count;
}
function detectInternalContradictions(content) {
	let count = 0;
	const dates = content.match(/\b\d{4}-\d{2}-\d{2}\b/g) || [];
	new Set(dates);
	if (/\b(?:however|but|contradicts?|conflicts? with)\b.*\b(?:however|but|contradicts?|conflicts? with)\b/i.test(content)) count++;
	const amounts = content.match(/\$[\d,]+\.\d{2}/g) || [];
	if (new Set(amounts).size > 3 && content.match(/(?:correct|incorrect|wrong|error)/i)) count++;
	return count;
}
function buildSummary(dimensions, overallScore, missingCount, unsupportedCount, contradictions, passed) {
	const lines = [];
	lines.push(`Overall quality score: ${overallScore}/100 (heuristic-based, not statistically validated)`);
	if (passed) lines.push("Response PASSED quality gate.");
	else lines.push("Response DID NOT PASS quality gate.");
	if (missingCount > 0) lines.push(`${missingCount} unresolved placeholder(s) remain.`);
	if (unsupportedCount > 0) lines.push(`${unsupportedCount} potentially unsupported assertion(s).`);
	if (contradictions > 0) lines.push(`${contradictions} potential internal contradiction(s).`);
	const lowDimensions = dimensions.filter((d) => d.score < 70);
	if (lowDimensions.length > 0) lines.push(`Lowest dimensions: ${lowDimensions.map((d) => `${d.label} (${d.score})`).join(", ")}`);
	return lines.join(" ");
}
var explanationTypeSchema = enumType([
	"deadline",
	"strategy",
	"response",
	"fact",
	"finding",
	"readiness",
	"contradiction",
	"missing_info",
	"quality",
	"health"
]);
var explanationStepSchema = objectType({
	label: stringType(),
	detail: stringType(),
	source: stringType().optional(),
	confidence: enumType([
		"high",
		"medium",
		"low",
		"unverified"
	]).optional()
});
var explanationSchema = objectType({
	id: stringType(),
	type: explanationTypeSchema,
	title: stringType(),
	summary: stringType(),
	steps: arrayType(explanationStepSchema),
	assumptions: arrayType(stringType()).default([]),
	confidence: enumType([
		"high",
		"medium",
		"low",
		"unverified"
	]),
	isVerified: booleanType().default(false),
	createdAt: stringType()
});
function createExplanation(params) {
	return explanationSchema.parse({
		id: crypto.randomUUID(),
		type: params.type,
		title: params.title,
		summary: params.summary,
		steps: params.steps,
		assumptions: params.assumptions || [],
		confidence: params.confidence || "medium",
		isVerified: params.isVerified || false,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function explainDeadline(params) {
	const steps = [];
	steps.push({
		label: "Source",
		detail: params.source || "Deadline was identified from the notice text.",
		confidence: params.certainty === "explicit" ? "high" : params.certainty === "calculated" ? "medium" : "low"
	});
	if (params.calculationMethod) steps.push({
		label: "Calculation method",
		detail: params.calculationMethod,
		source: "computed",
		confidence: "medium"
	});
	if (params.daysWindow) steps.push({
		label: "Interval",
		detail: `${params.daysWindow} ${params.businessDays ? "business" : "calendar"} days${params.startDate ? ` from ${params.startDate}` : ""}`,
		confidence: "medium"
	});
	steps.push({
		label: "Resulting date",
		detail: params.date,
		source: params.calculationMethod ? "computed" : "extracted",
		confidence: params.certainty === "explicit" ? "high" : "medium"
	});
	const assumptions = [];
	if (params.certainty === "calculated" && params.startDate) assumptions.push(`Assumes the counting period starts on ${params.startDate}`);
	if (params.businessDays) assumptions.push("Business days exclude weekends. Federal holidays are not accounted for.");
	if (params.certainty === "ambiguous") assumptions.push("The deadline language was ambiguous. This interpretation may not be correct.");
	if (params.certainty === "missing") assumptions.push("No deadline was found in the notice. This date may not exist.");
	return createExplanation({
		type: "deadline",
		title: "Why this deadline?",
		summary: `Response deadline: ${params.date} (certainty: ${params.certainty})`,
		steps,
		assumptions,
		confidence: params.certainty === "explicit" ? "high" : params.certainty === "calculated" ? "medium" : "unverified",
		isVerified: params.certainty === "explicit"
	});
}
function explainStrategy(params) {
	const steps = [];
	steps.push({
		label: "Strategy",
		detail: params.strategyLabel
	});
	steps.push({
		label: "Reasoning",
		detail: params.reason,
		confidence: "medium"
	});
	if (params.relevantFacts.length > 0) steps.push({
		label: "Relevant facts",
		detail: params.relevantFacts.map((f) => `${f.label}: ${f.value}`).join("; "),
		source: "extracted"
	});
	if (params.evidence.length > 0) steps.push({
		label: "Supporting evidence",
		detail: params.evidence.map((e) => e.label).join(", "),
		source: "uploaded"
	});
	if (params.constraints.length > 0) steps.push({
		label: "Constraints",
		detail: params.constraints.join("; "),
		confidence: "high"
	});
	if (params.missingInfo.length > 0) steps.push({
		label: "Missing information",
		detail: params.missingInfo.join("; "),
		confidence: "low"
	});
	return createExplanation({
		type: "strategy",
		title: "Why this strategy?",
		summary: `${params.strategyLabel} was recommended based on the analysis.`,
		steps,
		assumptions: params.constraints,
		confidence: "medium"
	});
}
function explainResponse(params) {
	const steps = [];
	steps.push({
		label: "User objective",
		detail: params.userObjective || "No specific objective stated.",
		source: "user"
	});
	steps.push({
		label: "Strategy",
		detail: `Response follows the "${params.strategyUsed}" strategy.`,
		source: "selected"
	});
	if (params.noticeRequirements.length > 0) steps.push({
		label: "Notice requirements",
		detail: params.noticeRequirements.join("; ")
	});
	steps.push({
		label: "Facts included",
		detail: `${params.factsIncluded} extracted fact(s) included in the response.`,
		confidence: "medium"
	});
	if (params.supportingEvidence.length > 0) steps.push({
		label: "Supporting evidence",
		detail: params.supportingEvidence.map((e) => e.label).join(", ")
	});
	if (params.placeholdersRemaining > 0) steps.push({
		label: "Unresolved items",
		detail: `${params.placeholdersRemaining} placeholder(s) need user attention.`,
		confidence: "low"
	});
	return createExplanation({
		type: "response",
		title: "Why this response?",
		summary: `Response was generated using the "${params.strategyUsed}" strategy.`,
		steps,
		confidence: params.placeholdersRemaining > 0 ? "medium" : "high",
		isVerified: params.placeholdersRemaining === 0
	});
}
var responseVersionSchema = objectType({
	id: stringType(),
	versionNumber: numberType().default(1),
	content: stringType(),
	strategyType: stringType().optional(),
	wordCount: numberType().default(0),
	unresolvedPlaceholders: numberType().default(0),
	createdBy: stringType().default("system"),
	createdAt: stringType(),
	/** What changed from the previous version */
	changeDescription: stringType().optional(),
	/** Source facts used in this version */
	sourceFactIds: arrayType(stringType()).default([]),
	/** Strategy used */
	strategyId: stringType().optional(),
	/** Is this the final version? */
	isFinal: booleanType().default(false),
	/** Hash for integrity */
	contentHash: stringType().optional()
});
var versionedResponseSchema = objectType({
	id: stringType(),
	caseId: stringType(),
	versions: arrayType(responseVersionSchema).default([]),
	currentVersionId: stringType().optional(),
	currentVersionNumber: numberType().default(0),
	finalVersionId: stringType().optional(),
	createdAt: stringType(),
	updatedAt: stringType()
});
function createVersionedResponse(caseId) {
	const now = (/* @__PURE__ */ new Date()).toISOString();
	return versionedResponseSchema.parse({
		id: crypto.randomUUID(),
		caseId,
		versions: [],
		currentVersionNumber: 0,
		createdAt: now,
		updatedAt: now
	});
}
function addVersion(vr, params) {
	const versionNumber = vr.versions.length + 1;
	const wordCount = params.content.split(/\s+/).filter(Boolean).length;
	let hash = 0;
	for (let i = 0; i < params.content.length; i++) {
		hash = (hash << 5) - hash + params.content.charCodeAt(i);
		hash |= 0;
	}
	const version = responseVersionSchema.parse({
		id: crypto.randomUUID(),
		versionNumber,
		content: params.content,
		strategyType: params.strategyType,
		strategyId: params.strategyId,
		sourceFactIds: params.sourceFactIds || [],
		wordCount,
		unresolvedPlaceholders: params.unresolvedPlaceholders || 0,
		createdBy: params.createdBy || "system",
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		changeDescription: params.changeDescription || `Version ${versionNumber}`,
		isFinal: false,
		contentHash: `v${versionNumber}_${Math.abs(hash).toString(16)}`
	});
	return versionedResponseSchema.parse({
		...vr,
		versions: [...vr.versions, version],
		currentVersionId: version.id,
		currentVersionNumber: versionNumber,
		updatedAt: (/* @__PURE__ */ new Date()).toISOString()
	});
}
function getVersionHistory(vr) {
	return vr.versions.map((v) => ({
		version: v.versionNumber,
		createdAt: v.createdAt,
		createdBy: v.createdBy,
		changeDescription: v.changeDescription,
		wordCount: v.wordCount,
		isFinal: v.isFinal
	}));
}
var correctionTypeSchema = enumType([
	"user_correction",
	"model_error",
	"extraction_error",
	"deadline_error",
	"response_quality_issue",
	"ux_friction",
	"system_failure"
]);
objectType({
	id: stringType(),
	type: correctionTypeSchema,
	field: stringType(),
	original: stringType(),
	corrected: stringType(),
	reason: stringType().optional(),
	createdAt: stringType()
});
var auditActionSchema = enumType([
	"case_created",
	"case_deleted",
	"document_uploaded",
	"document_processed",
	"document_deleted",
	"fact_extracted",
	"fact_corrected",
	"fact_confirmed",
	"deadline_calculated",
	"deadline_confirmed",
	"evidence_added",
	"evidence_removed",
	"finding_raised",
	"finding_resolved",
	"finding_dismissed",
	"strategy_selected",
	"strategy_changed",
	"response_generated",
	"response_edited",
	"response_finalized",
	"response_version_created",
	"export_created",
	"contradiction_detected",
	"contradiction_resolved",
	"missing_info_identified",
	"missing_info_resolved",
	"settings_changed",
	"voice_narration_started",
	"voice_dictation_started",
	"mailing_initiated",
	"proof_packet_sealed",
	"security_event",
	"rate_limit_hit",
	"auth_failure",
	"authz_failure"
]);
var auditEntrySchema = objectType({
	id: stringType(),
	timestamp: stringType(),
	actor: stringType(),
	action: auditActionSchema,
	objectType: stringType(),
	objectId: stringType().optional(),
	caseId: stringType().optional(),
	result: enumType([
		"success",
		"failure",
		"warning"
	]).default("success"),
	/** Brief description — NO raw document content, NO PII */
	description: stringType(),
	/** Redacted metadata — safe to log */
	metadata: recordType(stringType(), unionType([
		stringType(),
		numberType(),
		booleanType(),
		nullType()
	])).default({}),
	/** Security event flag */
	isSecurityEvent: booleanType().default(false),
	/** Correlation ID for tracing */
	correlationId: stringType().optional()
});
function createAuditEntry(params) {
	return auditEntrySchema.parse({
		id: crypto.randomUUID(),
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		actor: params.actor,
		action: params.action,
		objectType: params.objectType,
		objectId: params.objectId,
		caseId: params.caseId,
		result: params.result || "success",
		description: params.description,
		metadata: params.metadata || {},
		isSecurityEvent: params.isSecurityEvent || false,
		correlationId: params.correlationId
	});
}
var AuditLog = class {
	entries = [];
	maxEntries;
	constructor(maxEntries = 1e4) {
		this.maxEntries = maxEntries;
	}
	log(entry) {
		this.entries.push(entry);
		if (this.entries.length > this.maxEntries) this.entries = this.entries.slice(-this.maxEntries);
	}
	record(params) {
		const entry = createAuditEntry(params);
		this.log(entry);
		return entry;
	}
	getByCase(caseId) {
		return this.entries.filter((e) => e.caseId === caseId);
	}
	getByAction(action) {
		return this.entries.filter((e) => e.action === action);
	}
	getSecurityEvents() {
		return this.entries.filter((e) => e.isSecurityEvent);
	}
	getByActor(actor) {
		return this.entries.filter((e) => e.actor === actor);
	}
	getRecent(limit = 50) {
		return this.entries.slice(-limit).reverse();
	}
	getAll() {
		return [...this.entries];
	}
	size() {
		return this.entries.length;
	}
	redact(entry) {
		const redacted = { ...entry };
		if (redacted.description.length > 500) redacted.description = redacted.description.substring(0, 500) + "... [redacted]";
		return redacted;
	}
};
var initialSaveStatus = {
	state: "idle",
	retryCount: 0
};
/**
* Execute a save operation with explicit state management.
* Returns the next SaveStatus — never throws silently.
*/
async function executeSave(operation, currentStatus) {
	currentStatus.retryCount;
	try {
		return {
			result: await operation(),
			status: {
				state: "saved",
				lastSavedAt: (/* @__PURE__ */ new Date()).toISOString(),
				retryCount: 0
			}
		};
	} catch (err) {
		return {
			result: null,
			status: {
				state: "failed",
				error: err instanceof Error ? err.message : String(err),
				retryCount: currentStatus.retryCount + 1
			}
		};
	}
}
var WALKTHROUGH_STEPS = [
	{
		stepNumber: 1,
		title: "Input the Notice",
		description: "Paste the notice text or upload a document to begin analysis.",
		isCurrent: true,
		isComplete: false
	},
	{
		stepNumber: 2,
		title: "Review Analysis",
		description: "The system extracts facts, identifies deadlines, and assesses case readiness.",
		isCurrent: false,
		isComplete: false
	},
	{
		stepNumber: 3,
		title: "Choose a Strategy",
		description: "Select from recommended response strategies based on the analysis.",
		isCurrent: false,
		isComplete: false
	},
	{
		stepNumber: 4,
		title: "Generate Response",
		description: "Review and edit the generated response letter, then proceed to mailing.",
		isCurrent: false,
		isComplete: false
	}
];
function AnalyzeNotice() {
	const [phase, setPhase] = (0, import_react.useState)("input");
	const [noticeText, setNoticeText] = (0, import_react.useState)("");
	const [userObjective, setUserObjective] = (0, import_react.useState)("");
	const [userFacts, setUserFacts] = (0, import_react.useState)("");
	const [selectedStrategyIdx, setSelectedStrategyIdx] = (0, import_react.useState)(null);
	const [showSettings, setShowSettings] = (0, import_react.useState)(false);
	const [autoNarrated, setAutoNarrating] = (0, import_react.useState)(false);
	const [contradictions, setContradictions] = (0, import_react.useState)([]);
	const [missingItems, setMissingItems] = (0, import_react.useState)([]);
	const [showWhyDeadline, setShowWhyDeadline] = (0, import_react.useState)(false);
	const [showWhyStrategy, setShowWhyStrategy] = (0, import_react.useState)(null);
	const [showWhyResponse, setShowWhyResponse] = (0, import_react.useState)(false);
	const [showWhyHealth, setShowWhyHealth] = (0, import_react.useState)(false);
	const [versionedResponse, setVersionedResponse] = (0, import_react.useState)(null);
	const [editingDraft, setEditingDraft] = (0, import_react.useState)("");
	const [saveStatus, setSaveStatus] = (0, import_react.useState)(initialSaveStatus);
	const caseRef = (0, import_react.useRef)(null);
	const auditLogRef = (0, import_react.useRef)(new AuditLog());
	const securityCheck = (0, import_react.useMemo)(() => {
		if (!noticeText.trim()) return null;
		return classifyContent(noticeText, "untrusted");
	}, [noticeText]);
	const inputValidation = (0, import_react.useMemo)(() => {
		if (!noticeText.trim()) return null;
		return validateTextInput(noticeText);
	}, [noticeText]);
	const analysis = (0, import_react.useMemo)(() => {
		if (!noticeText.trim()) return null;
		const extraction = extractFromText(noticeText);
		const classification = classifyNoticeType(noticeText);
		const deadline = extraction.deadlines[0]?.deadline || createDeadline({
			type: "response",
			certainty: "missing"
		});
		const dUntil = deadline.date ? daysUntil(deadline.date) : null;
		const urgency = deadline.date ? deadlineUrgency(deadline.date) : "unknown";
		const confirmedFacts = extraction.facts.filter((f) => f.userConfirmed || f.confidence === "high");
		const readiness = runReadinessReview({
			noticeType: classification.type,
			noticeDate: extraction.noticeDate || void 0,
			agency: extraction.agency || void 0,
			referenceNumber: extraction.referenceNumber || void 0,
			deadline,
			facts: extraction.facts,
			evidence: [],
			findings: [],
			draft: "",
			recipient: {
				name: "",
				address1: "",
				city: "",
				state: "",
				zip: ""
			},
			hasSignature: false
		});
		const strategies = recommendStrategies({
			noticeType: classification.type,
			hasDeadline: !!deadline.date,
			deadlineExpired: urgency === "expired",
			hasContradictions: false,
			hasUnsupportedAllegations: false,
			hasEvidence: false,
			hasMissingInformation: readiness.issuesRequiringAttention > 3,
			hasProceduralIssues: false,
			hasPaymentDemand: !!extraction.amountOwed,
			hasAppealRights: !!extraction.appealRights,
			factConfidence: extraction.extractionConfidence > .7 ? "high" : "medium"
		});
		const noticeCase = updateCase(createCase("analyze"), { ownerId: getOwnerId() });
		caseRef.current = updateCase(noticeCase, {
			noticeType: classification.type,
			typeConfidence: classification.confidence,
			category: NOTICE_TYPE_META[classification.type]?.category || "other",
			agency: extraction.agency || void 0,
			referenceNumber: extraction.referenceNumber || void 0,
			noticeDate: extraction.noticeDate || void 0,
			facts: extraction.facts,
			deadlines: extraction.deadlines.map((d) => d.deadline),
			strategies,
			readinessScore: readiness.score,
			readinessState: readiness.state
		});
		const detectedContradictions = detectContradictions({
			facts: extraction.facts,
			userFacts: userFacts || void 0,
			evidence: [],
			deadlines: extraction.deadlines.map((d) => ({
				date: d.deadline.date,
				rawText: d.deadline.rawText,
				certainty: d.deadline.certainty
			}))
		});
		const detectedMissing = detectMissingInfo({
			facts: extraction.facts.map((f) => ({
				id: f.id,
				label: f.label,
				value: f.value,
				confidence: f.confidence,
				userConfirmed: f.userConfirmed
			})),
			deadlines: [{
				date: deadline.date,
				certainty: deadline.certainty
			}],
			evidence: [],
			agency: extraction.agency || void 0,
			referenceNumber: extraction.referenceNumber || void 0,
			noticeDate: extraction.noticeDate || void 0
		});
		const health = assessCaseHealth({
			facts: extraction.facts.map((f) => ({
				id: f.id,
				label: f.label,
				value: f.value,
				confidence: f.confidence,
				userConfirmed: f.userConfirmed
			})),
			evidence: [],
			deadlines: [{
				date: deadline.date,
				certainty: deadline.certainty
			}],
			findings: [],
			contradictions: detectedContradictions.map((c) => ({
				status: c.status,
				severity: c.severity
			})),
			missingInfo: detectedMissing.map((m) => ({
				status: m.status,
				impact: m.impact
			})),
			readinessScore: readiness.score,
			readinessState: readiness.state,
			hasDraft: false,
			draftWordCount: 0
		});
		const actionQueue = generateActionQueue({
			readinessState: readiness.state,
			readinessScore: readiness.score,
			deadlineUrgency: urgency,
			deadlineDaysRemaining: dUntil,
			contradictions: detectedContradictions.map((c) => ({
				status: c.status,
				severity: c.severity,
				field: c.field,
				description: c.description
			})),
			missingInfo: detectedMissing.map((m) => ({
				status: m.status,
				impact: m.impact,
				label: m.label,
				whyItMatters: m.whyItMatters,
				field: m.field
			})),
			facts: extraction.facts.map((f) => ({
				confidence: f.confidence,
				userConfirmed: f.userConfirmed,
				label: f.label
			})),
			evidenceCount: 0,
			hasDraft: false,
			draftPlaceholders: 0
		});
		auditLogRef.current.record({
			actor: "user",
			action: "document_processed",
			objectType: "notice",
			description: `Notice analyzed: ${classification.type} from ${extraction.agency || "unknown agency"}`,
			caseId: noticeCase.id,
			metadata: {
				factCount: extraction.facts.length,
				strategyCount: strategies.length
			}
		});
		if (detectedContradictions.length > 0) auditLogRef.current.record({
			actor: "system",
			action: "contradiction_detected",
			objectType: "contradiction",
			description: `${detectedContradictions.length} contradiction(s) detected`,
			caseId: noticeCase.id,
			metadata: { count: detectedContradictions.length }
		});
		return {
			extraction,
			classification,
			deadline,
			dUntil,
			urgency,
			confirmedFacts,
			readiness,
			strategies,
			contradictions: detectedContradictions,
			missingItems: detectedMissing,
			health,
			actionQueue,
			deadlineValidation: validateDeadline(deadline)
		};
	}, [noticeText, userFacts]);
	(0, import_react.useEffect)(() => {
		if (analysis) {
			setContradictions(analysis.contradictions);
			setMissingItems(analysis.missingItems);
		}
	}, [analysis]);
	(0, import_react.useEffect)(() => {
		if (!caseRef.current || !analysis) return;
		const ownerId = getOwnerId();
		const repo = getRepository();
		const updated = updateCase(caseRef.current, {
			status: "analyzed",
			contradictions: analysis.contradictions,
			missingInfo: analysis.missingItems,
			healthScore: analysis.health.overallScore,
			healthStatus: analysis.health.status,
			healthSummary: analysis.health.summary,
			actionQueue: analysis.actionQueue
		});
		caseRef.current = updated;
		const doSave = async () => {
			setSaveStatus({
				state: "saving",
				retryCount: saveStatus.retryCount
			});
			const { status } = await executeSave(() => repo.save(updated), saveStatus);
			setSaveStatus(status);
			if (status.state === "saved") for (const entry of auditLogRef.current.getAll()) try {
				await repo.saveAudit(entry, ownerId);
			} catch (err) {
				console.error("Audit entry save failed:", err);
			}
		};
		doSave();
	}, [analysis]);
	const analysisNarration = (0, import_react.useMemo)(() => {
		if (!analysis) return null;
		return buildAnalysisNarration({
			noticeType: analysis.classification.type,
			noticeTypeLabel: NOTICE_TYPE_META[analysis.classification.type]?.label,
			agency: analysis.extraction.agency || void 0,
			referenceNumber: analysis.extraction.referenceNumber || void 0,
			noticeDate: analysis.extraction.noticeDate || void 0,
			deadlineDate: analysis.deadline.date,
			deadlineUrgency: analysis.urgency,
			deadlineUrgencyLabel: URGENCY_META[analysis.urgency]?.label,
			factCount: analysis.extraction.facts.length,
			confirmedFactCount: analysis.confirmedFacts.length,
			evidenceCount: 0,
			findingCount: analysis.readiness.issuesRequiringAttention,
			readinessState: analysis.readiness.state,
			readinessScore: analysis.readiness.score,
			strategyCount: analysis.strategies.length
		});
	}, [analysis]);
	const deadlineNarration = (0, import_react.useMemo)(() => {
		if (!analysis?.deadline.date) return null;
		return buildDeadlineNarration(analysis.deadline.date, analysis.dUntil, URGENCY_META[analysis.urgency]?.label || "Unknown");
	}, [analysis]);
	const handleAnalyze = (0, import_react.useCallback)(() => {
		if (!noticeText.trim()) return;
		if (inputValidation && !inputValidation.valid) return;
		auditLogRef.current.record({
			actor: "user",
			action: "document_uploaded",
			objectType: "document",
			description: "Notice text submitted for analysis"
		});
		setPhase("analysis");
	}, [noticeText, inputValidation]);
	const handleSelectStrategy = (0, import_react.useCallback)((idx) => {
		setSelectedStrategyIdx(idx);
		auditLogRef.current.record({
			actor: "user",
			action: "strategy_selected",
			objectType: "strategy",
			description: `Strategy selected: ${analysis?.strategies[idx]?.type || "unknown"}`
		});
		if (caseRef.current) {
			const updated = transitionStatus(caseRef.current, "in_progress");
			caseRef.current = updated;
			getOwnerId();
			setSaveStatus({
				state: "saving",
				retryCount: saveStatus.retryCount
			});
			executeSave(() => getRepository().save(updated), saveStatus).then(({ status }) => setSaveStatus(status));
		}
		setPhase("draft");
	}, [analysis, saveStatus]);
	const draft = (0, import_react.useMemo)(() => {
		if (!analysis || selectedStrategyIdx === null || !analysis.strategies[selectedStrategyIdx]) return null;
		return generateResponseDraft({
			agency: analysis.extraction.agency || void 0,
			referenceNumber: analysis.extraction.referenceNumber || void 0,
			noticeDate: analysis.extraction.noticeDate || void 0,
			facts: analysis.extraction.facts,
			deadline: analysis.deadline,
			selectedStrategy: analysis.strategies[selectedStrategyIdx],
			userObjective: userObjective || void 0,
			userFacts: userFacts || void 0,
			hasSignature: true
		});
	}, [
		analysis,
		selectedStrategyIdx,
		userObjective,
		userFacts
	]);
	const qualityReport = (0, import_react.useMemo)(() => {
		if (!draft || !analysis) return null;
		return evaluateResponseQuality({
			draftContent: draft.content,
			facts: analysis.extraction.facts.map((f) => ({
				id: f.id,
				label: f.label,
				value: f.value,
				confidence: f.confidence,
				userConfirmed: f.userConfirmed
			})),
			evidence: [],
			deadline: {
				date: analysis.deadline.date,
				certainty: analysis.deadline.certainty
			},
			agency: analysis.extraction.agency || void 0,
			referenceNumber: analysis.extraction.referenceNumber || void 0,
			noticeDate: analysis.extraction.noticeDate || void 0,
			selectedStrategyType: analysis.strategies[selectedStrategyIdx || 0]?.type,
			userObjective: userObjective || void 0,
			unresolvedPlaceholders: draft.unresolvedPlaceholders.map((p) => ({
				placeholder: p.placeholder,
				reason: p.reason
			}))
		});
	}, [
		draft,
		analysis,
		selectedStrategyIdx,
		userObjective
	]);
	(0, import_react.useEffect)(() => {
		if (draft && analysis) {
			if (!versionedResponse) {
				const updated = addVersion(createVersionedResponse(caseRef.current?.id || "temp"), {
					content: draft.content,
					strategyType: analysis.strategies[selectedStrategyIdx || 0]?.type,
					strategyId: analysis.strategies[selectedStrategyIdx || 0]?.id,
					sourceFactIds: analysis.extraction.facts.map((f) => f.id),
					unresolvedPlaceholders: draft.unresolvedPlaceholders.length,
					changeDescription: "Initial draft"
				});
				setVersionedResponse(updated);
				auditLogRef.current.record({
					actor: "system",
					action: "response_generated",
					objectType: "response",
					description: `Response draft generated (v1, ${draft.wordCount} words)`
				});
				if (caseRef.current) {
					const caseUpdate = updateCase(caseRef.current, {
						finalResponse: draft.content,
						responseVersioning: updated,
						userObjective,
						userFacts
					});
					caseRef.current = caseUpdate;
					getOwnerId();
					setSaveStatus({
						state: "saving",
						retryCount: saveStatus.retryCount
					});
					executeSave(() => getRepository().save(caseUpdate), saveStatus).then(({ status }) => setSaveStatus(status));
				}
			}
		}
	}, [
		draft,
		analysis,
		selectedStrategyIdx,
		saveStatus
	]);
	const walkthrough = (0, import_react.useMemo)(() => {
		return WALKTHROUGH_STEPS.map((s, i) => ({
			...s,
			isCurrent: phase === "input" && i === 0 || phase === "analysis" && i === 1 || phase === "strategy" && i === 2 || phase === "draft" && i === 3,
			isComplete: phase === "analysis" && i === 0 || phase === "strategy" && i < 2 || phase === "draft" && i < 3
		}));
	}, [phase]);
	const walkthroughNarration = (0, import_react.useMemo)(() => buildWalkthroughNarration(walkthrough), [walkthrough]);
	const handleResolveContradiction = (0, import_react.useCallback)((idx, value) => {
		setContradictions((prev) => {
			const updated = [...prev];
			updated[idx] = resolveContradiction(updated[idx], value, "user");
			return updated;
		});
		auditLogRef.current.record({
			actor: "user",
			action: "contradiction_resolved",
			objectType: "contradiction",
			description: `Contradiction resolved with value: ${value.substring(0, 50)}`
		});
	}, []);
	const handleResolveMissingInfo = (0, import_react.useCallback)((idx, value) => {
		setMissingItems((prev) => {
			const updated = [...prev];
			updated[idx] = resolveMissingInfo(updated[idx], value);
			return updated;
		});
		auditLogRef.current.record({
			actor: "user",
			action: "missing_info_resolved",
			objectType: "missing_info",
			description: `Missing info resolved: ${value.substring(0, 50)}`
		});
	}, []);
	const contrSummary = (0, import_react.useMemo)(() => contradictionSummary(contradictions), [contradictions]);
	const missingSummary = (0, import_react.useMemo)(() => missingInfoSummary(missingItems), [missingItems]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-4xl px-6 py-10",
				role: "main",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between flex-wrap gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "postmark w-fit",
									children: "Analyze"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VoiceBadge, { active: true })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-serif text-4xl",
								children: "Notice Analysis Studio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "Paste or upload a notice. Get instant analysis with voice narration."
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
							script: walkthroughNarration,
							label: "Walkthrough"
						})]
					}),
					saveStatus.state !== "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex items-center gap-3 text-sm",
						role: "status",
						"aria-live": "polite",
						children: [
							saveStatus.state === "saving" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
									className: "h-4 w-4 animate-spin",
									viewBox: "0 0 24 24",
									fill: "none",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
										cx: "12",
										cy: "12",
										r: "10",
										stroke: "currentColor",
										strokeWidth: "2",
										opacity: "0.25"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										d: "M12 2a10 10 0 0 1 10 10",
										stroke: "currentColor",
										strokeWidth: "2",
										strokeLinecap: "round"
									})]
								}), "Saving case…"]
							}),
							saveStatus.state === "saved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-emerald-700",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
									className: "h-4 w-4",
									fill: "none",
									viewBox: "0 0 24 24",
									stroke: "currentColor",
									strokeWidth: 2,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
										strokeLinecap: "round",
										strokeLinejoin: "round",
										d: "M5 13l4 4L19 7"
									})
								}), "Case saved"]
							}),
							saveStatus.state === "failed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-2 text-destructive",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
										className: "h-4 w-4",
										fill: "none",
										viewBox: "0 0 24 24",
										stroke: "currentColor",
										strokeWidth: 2,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
											strokeLinecap: "round",
											strokeLinejoin: "round",
											d: "M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
										})
									}),
									"Save failed",
									saveStatus.retryCount > 0 ? ` (attempt ${saveStatus.retryCount + 1})` : "",
									": ",
									saveStatus.error,
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										className: "ml-2 rounded border border-input px-2 py-0.5 text-xs hover:bg-muted",
										onClick: () => {
											if (caseRef.current) {
												setSaveStatus({
													state: "saving",
													retryCount: saveStatus.retryCount
												});
												executeSave(() => getRepository().save(caseRef.current), saveStatus).then(({ status }) => setSaveStatus(status));
											}
										},
										children: "Retry"
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6",
						role: "navigation",
						"aria-label": "Workflow progress",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "progress-track",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "progress-fill",
								style: { width: phase === "input" ? "10%" : phase === "analysis" ? "40%" : phase === "strategy" ? "70%" : "95%" }
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-2 flex justify-between text-xs text-muted-foreground",
							children: walkthrough.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: s.isCurrent ? "font-medium text-stamp" : s.isComplete ? "text-emerald-700" : "",
								children: [
									s.stepNumber,
									". ",
									s.title
								]
							}, s.stepNumber))
						})]
					}),
					phase === "input" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "envelope-card p-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-2xl mb-4",
									children: "Paste the notice text"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DictationInput, {
									value: noticeText,
									onChange: setNoticeText,
									field: "noticeText",
									label: "Notice content",
									placeholder: "Paste the full text of the notice here, or use the microphone to dictate it...",
									multiline: true,
									rows: 10
								}),
								securityCheck && securityCheck.detectedInjectionPatterns.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 rounded-md border border-red-300/60 bg-red-50/60 p-3",
									role: "alert",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											className: "h-4 w-4 text-red-600",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											strokeWidth: 2,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M12 9v3.75m-9.303 3.376c-.866 1.5.999 2.878 2.748 2.878h9.11c1.749 0 2.614-1.378 1.748-2.878L13.748 3.376c-.866-1.5-2.63-1.5-3.496 0L3.697 8.376zM12 15.75h.007v.008H12v-.008z"
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-sm font-medium text-red-700",
											children: [
												"Security notice: ",
												securityCheck.detectedInjectionPatterns.length,
												" potential injection pattern(s) detected"
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-xs text-red-600",
										children: ["Document content will be treated as data, not instructions. Patterns: ", securityCheck.detectedInjectionPatterns.join(", ")]
									})]
								}),
								inputValidation && inputValidation.warnings.length > 0 && securityCheck?.detectedInjectionPatterns.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 rounded-md border border-amber-300/50 bg-amber-50/50 p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-amber-700",
										children: inputValidation.warnings.join("; ")
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										onClick: handleAnalyze,
										disabled: !noticeText.trim(),
										className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed",
										"aria-label": "Analyze the notice text",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
											className: "h-4 w-4",
											fill: "none",
											viewBox: "0 0 24 24",
											stroke: "currentColor",
											strokeWidth: 1.5,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
												strokeLinecap: "round",
												strokeLinejoin: "round",
												d: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.055-.75.095m.75-.099a48.05 48.05 0 0 1 9 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5"
											})
										}), "Analyze Notice"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [
											"Or try a sample:",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												className: "text-stamp underline hover:no-underline",
												onClick: () => setNoticeText(SAMPLE_NOTICE),
												children: "Load IRS CP2000 sample"
											})
										]
									})]
								})
							]
						})
					}),
					phase === "analysis" && analysis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-2xl",
									children: "Analysis Results"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
										script: analysisNarration,
										label: "Listen to summary"
									}), deadlineNarration && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
										script: deadlineNarration,
										label: "Deadline alert",
										compact: true
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-serif text-lg",
											children: "Case Health"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setShowWhyHealth(!showWhyHealth),
											className: "text-xs text-stamp underline hover:no-underline",
											"aria-label": "Show explanation of case health",
											children: "Why?"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex items-center gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `font-mono text-3xl ${analysis.health.overallScore >= 80 ? "text-emerald-600" : analysis.health.overallScore >= 50 ? "text-amber-600" : "text-red-600"}`,
												children: analysis.health.overallScore
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground",
												children: "/100"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-3 py-1 text-xs font-medium ${analysis.health.status === "ready" ? "bg-emerald-100 text-emerald-700" : analysis.health.status === "needs_review" ? "bg-amber-100 text-amber-700" : analysis.health.status === "incomplete" ? "bg-yellow-100 text-yellow-700" : analysis.health.status === "conflicting" ? "bg-red-100 text-red-700" : "bg-red-100 text-red-700"}`,
											children: HEALTH_STATUS_META[analysis.health.status]?.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: HEALTH_STATUS_META[analysis.health.status]?.description
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-4 grid grid-cols-2 gap-3",
										children: analysis.health.dimensions.map((dim) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border border-rule/30 rounded-md p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-medium",
													children: dim.label
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-xs font-mono ${dim.status === "good" ? "text-emerald-600" : dim.status === "warning" ? "text-amber-600" : dim.status === "poor" ? "text-red-600" : "text-gray-400"}`,
													children: dim.score
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: dim.detail
											})]
										}, dim.name))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs text-muted-foreground italic",
										children: "Scores are heuristic-based, not statistically validated."
									}),
									showWhyHealth && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4 rounded-md bg-muted/50 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-sm font-medium",
											children: "Why this health score?"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: analysis.health.summary
										})]
									})
								]
							}),
							analysis.actionQueue.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-serif text-lg mb-3",
									children: "Next Best Actions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: analysis.actionQueue.slice(0, 5).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-3 border-b border-rule/30 pb-2 last:border-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `mt-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${action.priority === "critical" ? "bg-red-100 text-red-700" : action.priority === "high" ? "bg-amber-100 text-amber-700" : action.priority === "medium" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`,
											children: PRIORITY_META[action.priority]?.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-medium text-ink",
													children: action.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: action.why
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-0.5 text-xs text-stamp",
													children: action.impact
												})
											]
										})]
									}, action.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: "Notice Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1 flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-serif text-2xl",
											children: NOTICE_TYPE_META[analysis.classification.type]?.label || "Unknown"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "rounded-full bg-stamp/10 px-2 py-0.5 text-xs font-mono text-stamp",
											children: [Math.round(analysis.classification.confidence * 100), "% confidence"]
										})]
									}),
									NOTICE_TYPE_META[analysis.classification.type]?.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted-foreground",
										children: NOTICE_TYPE_META[analysis.classification.type].description
									})
								]
							}),
							analysis.deadline.date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: `envelope-card p-5 border-l-4 ${analysis.urgency === "expired" || analysis.urgency === "critical" ? "border-l-red-500" : analysis.urgency === "urgent" ? "border-l-amber-500" : "border-l-stamp"}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-xs uppercase tracking-widest text-muted-foreground",
													children: "Response Deadline"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: () => setShowWhyDeadline(!showWhyDeadline),
													className: "text-xs text-stamp underline hover:no-underline",
													"aria-label": "Show deadline explanation",
													children: "Why?"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 font-serif text-2xl",
												children: analysis.deadline.date
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													"Certainty: ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono",
														children: analysis.deadline.certainty
													}),
													analysis.deadline.calculationMethod && ` · ${analysis.deadline.calculationMethod}`
												]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: `text-sm font-medium ${URGENCY_META[analysis.urgency]?.color === "red" ? "text-red-600" : URGENCY_META[analysis.urgency]?.color === "amber" ? "text-amber-600" : "text-stamp"}`,
												children: URGENCY_META[analysis.urgency]?.label
											}), analysis.dUntil !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-xs text-muted-foreground",
												children: analysis.dUntil < 0 ? `${Math.abs(analysis.dUntil)} days ago` : `${analysis.dUntil} days remaining`
											})]
										})]
									}),
									analysis.deadlineValidation.warnings.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 space-y-1",
										children: analysis.deadlineValidation.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-amber-600",
											children: ["⚠ ", w]
										}, i))
									}),
									showWhyDeadline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-3 rounded-md bg-muted/50 p-4",
										children: (() => {
											const exp = explainDeadline({
												date: analysis.deadline.date,
												source: analysis.deadline.sourceExcerpt,
												calculationMethod: analysis.deadline.calculationMethod,
												certainty: analysis.deadline.certainty,
												startDate: analysis.deadline.startDate,
												daysWindow: analysis.deadline.daysWindow,
												businessDays: analysis.deadline.businessDays
											});
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
													className: "text-sm font-medium",
													children: exp.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: exp.summary
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-2 space-y-1",
													children: exp.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-xs",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-medium text-ink",
																children: [step.label, ":"]
															}),
															" ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-muted-foreground",
																children: step.detail
															}),
															step.confidence && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "ml-1 text-muted-foreground/60",
																children: [
																	"(",
																	step.confidence,
																	")"
																]
															})
														]
													}, i))
												}),
												exp.assumptions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-medium text-ink",
														children: "Assumptions:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "ml-4",
														children: exp.assumptions.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
															className: "text-xs text-muted-foreground list-disc",
															children: a
														}, i))
													})]
												})
											] });
										})()
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
											script: deadlineNarration,
											label: "Listen to deadline info",
											compact: true
										})
									})
								]
							}),
							contradictions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-serif text-lg",
										children: "Contradictions Detected"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `rounded-full px-2 py-0.5 text-xs font-mono ${contrSummary.unresolved > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`,
										children: [
											contrSummary.unresolved,
											" unresolved / ",
											contrSummary.total,
											" total"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: contradictions.map((c, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `rounded-md border p-3 ${c.status === "unresolved" ? "border-red-300/50 bg-red-50/30" : "border-emerald-300/50 bg-emerald-50/30"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `rounded-full px-2 py-0.5 text-xs ${c.severity === "critical" ? "bg-red-200 text-red-800" : c.severity === "high" ? "bg-amber-200 text-amber-800" : "bg-gray-200 text-gray-600"}`,
														children: c.severity
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm font-medium text-ink",
														children: c.field
													}),
													c.status === "resolved" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs text-emerald-600",
														children: "✓ Resolved"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-xs text-muted-foreground",
												children: c.description
											}),
											c.status === "unresolved" && c.sources.length >= 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-2 flex items-center gap-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
													className: "rounded border border-rule/40 px-2 py-1 text-xs",
													onChange: (e) => {
														if (e.target.value) handleResolveContradiction(idx, e.target.value);
													},
													defaultValue: "",
													"aria-label": `Resolve contradiction for ${c.field}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "",
														disabled: true,
														children: "Select correct value..."
													}), c.sources.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: s.value,
														children: s.value
													}, s.sourceId))]
												})
											})
										]
									}, c.id))
								})]
							}),
							missingItems.filter((m) => m.status === "missing").length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-serif text-lg",
										children: "Missing Information"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `rounded-full px-2 py-0.5 text-xs font-mono ${missingSummary.blocking > 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`,
										children: [
											missingSummary.blocking,
											" blocking · ",
											missingSummary.missing,
											" total"
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: missingItems.filter((m) => m.status === "missing").map((item, idx) => {
										const realIdx = missingItems.indexOf(item);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `rounded-md border p-3 ${item.impact === "blocking" ? "border-red-300/50 bg-red-50/30" : "border-amber-300/50 bg-amber-50/30"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `rounded-full px-2 py-0.5 text-xs ${item.impact === "blocking" ? "bg-red-200 text-red-800" : "bg-amber-200 text-amber-800"}`,
														children: item.impact
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-sm font-medium text-ink",
														children: item.label
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-xs text-muted-foreground",
													children: item.whyItMatters
												}),
												item.suggestedActions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-medium text-stamp",
														children: "Suggested:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "ml-4",
														children: item.suggestedActions.map((a, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
															className: "text-xs text-muted-foreground list-disc",
															children: a
														}, i))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-2 flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "text",
														placeholder: "Provide value...",
														className: "rounded border border-rule/40 px-2 py-1 text-xs flex-1",
														onKeyDown: (e) => {
															if (e.key === "Enter" && e.currentTarget.value) {
																handleResolveMissingInfo(realIdx, e.currentTarget.value);
																e.currentTarget.value = "";
															}
														},
														"aria-label": `Resolve missing info: ${item.label}`
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs text-muted-foreground",
														children: "Press Enter to resolve"
													})]
												})
											]
										}, item.id);
									})
								})]
							}),
							analysis.extraction.facts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-serif text-lg mb-3",
									children: "Extracted Facts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: analysis.extraction.facts.map((fact) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between border-b border-rule/40 pb-2 last:border-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm font-medium text-ink",
												children: fact.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-ink-soft",
												children: fact.value
											}),
											fact.sourceExcerpt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-0.5 text-xs text-muted-foreground italic",
												children: [
													"Source: ",
													fact.sourceExcerpt.substring(0, 100),
													"..."
												]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-2 py-0.5 text-xs font-mono ${fact.confidence === "high" ? "bg-emerald-100 text-emerald-700" : fact.confidence === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`,
											children: fact.confidence
										})]
									}, fact.id))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-serif text-lg",
											children: "Case Readiness"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-mono text-2xl",
											children: [analysis.readiness.score, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm text-muted-foreground",
												children: "/100"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "progress-track mb-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "progress-fill",
											style: { width: `${analysis.readiness.score}%` }
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `rounded-full px-3 py-1 text-xs font-medium ${analysis.readiness.state === "ready" ? "bg-emerald-100 text-emerald-700" : analysis.readiness.state === "blocked" ? "bg-red-100 text-red-700" : analysis.readiness.state === "incomplete" ? "bg-amber-100 text-amber-700" : "bg-stamp/10 text-stamp"}`,
											children: analysis.readiness.state.replace("_", " ")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs text-muted-foreground",
											children: [
												analysis.readiness.issuesRequiringAttention,
												" issues · ",
												analysis.readiness.blockingIssues,
												" blocking"
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setPhase("strategy"),
									className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5",
									children: [
										"View Strategies (",
										analysis.strategies.length,
										")",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
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
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setPhase("input"),
									className: "text-sm text-muted-foreground hover:text-foreground",
									children: "← Back"
								})]
							})
						]
					}),
					phase === "strategy" && analysis && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-2xl",
									children: "Response Strategies"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setPhase("analysis"),
									className: "text-sm text-muted-foreground hover:text-foreground",
									children: "← Back to analysis"
								})]
							}),
							analysis.strategies.map((strategy, idx) => {
								const stratNarration = buildStrategyNarration({
									label: STRATEGY_TYPE_LABELS[strategy.type],
									description: strategy.description,
									reason: strategy.reason,
									confidence: strategy.confidence,
									risks: strategy.risks,
									prerequisites: strategy.prerequisites
								});
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "envelope-card p-5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-serif text-lg",
															children: STRATEGY_TYPE_LABELS[strategy.type]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: `rounded-full px-2 py-0.5 text-xs font-mono ${strategy.confidence === "high" ? "bg-emerald-100 text-emerald-700" : strategy.confidence === "medium" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`,
															children: [strategy.confidence, " confidence"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => setShowWhyStrategy(showWhyStrategy === idx ? null : idx),
															className: "text-xs text-stamp underline hover:no-underline",
															"aria-label": `Show explanation for ${STRATEGY_TYPE_LABELS[strategy.type]}`,
															children: "Why?"
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-2 text-sm text-ink-soft",
													children: strategy.description
												}),
												strategy.reason && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-2 text-xs text-muted-foreground",
													children: strategy.reason
												}),
												strategy.risks.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-medium text-red-600",
														children: "Risks:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "mt-1 space-y-0.5",
														children: strategy.risks.map((risk, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
															className: "text-xs text-muted-foreground",
															children: ["• ", risk]
														}, i))
													})]
												}),
												strategy.prerequisites.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-medium text-amber-600",
														children: "Prerequisites:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
														className: "mt-1 space-y-0.5",
														children: strategy.prerequisites.map((prereq, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
															className: "text-xs text-muted-foreground",
															children: ["• ", prereq]
														}, i))
													})]
												}),
												showWhyStrategy === idx && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "mt-3 rounded-md bg-muted/50 p-4",
													children: (() => {
														const exp = explainStrategy({
															strategyType: strategy.type,
															strategyLabel: STRATEGY_TYPE_LABELS[strategy.type],
															reason: strategy.reason,
															relevantFacts: analysis.extraction.facts.map((f) => ({
																label: f.label,
																value: f.value
															})),
															evidence: [],
															constraints: strategy.prerequisites,
															missingInfo: missingItems.filter((m) => m.status === "missing").map((m) => m.label)
														});
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
																className: "text-sm font-medium",
																children: exp.title
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-1 text-xs text-muted-foreground",
																children: exp.summary
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "mt-2 space-y-1",
																children: exp.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "text-xs",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																			className: "font-medium text-ink",
																			children: [step.label, ":"]
																		}),
																		" ",
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "text-muted-foreground",
																			children: step.detail
																		})
																	]
																}, i))
															})
														] });
													})()
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-end gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
												script: stratNarration,
												label: "Listen",
												compact: true
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => handleSelectStrategy(idx),
												className: "rounded-full border border-stamp px-4 py-1.5 text-xs font-medium text-stamp transition-colors hover:bg-stamp hover:text-accent-foreground",
												children: "Select →"
											})]
										})]
									})
								}, strategy.id);
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setPhase("analysis"),
								className: "text-sm text-muted-foreground hover:text-foreground",
								children: "← Back to analysis"
							})
						]
					}),
					phase === "draft" && draft && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-serif text-2xl",
									children: "Your Response Draft"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setShowWhyResponse(!showWhyResponse),
										className: "text-xs text-stamp underline hover:no-underline",
										children: "Why?"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NarrationButton, {
										script: {
											id: "draft-narration",
											mode: "narration",
											title: "Response Draft",
											segments: [{
												id: "1",
												text: draft.content,
												role: "body",
												priority: "normal",
												pauseAfter: 400
											}],
											totalWords: draft.wordCount,
											estimatedSeconds: Math.ceil(draft.wordCount / 2.5),
											createdAt: (/* @__PURE__ */ new Date()).toISOString()
										},
										label: "Listen to draft"
									})]
								})]
							}),
							versionedResponse && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									"Version ",
									versionedResponse.currentVersionNumber,
									" · ",
									getVersionHistory(versionedResponse).length,
									" version(s) in history"
								]
							}),
							showWhyResponse && analysis && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "rounded-md bg-muted/50 p-4",
								children: (() => {
									const exp = explainResponse({
										userObjective: userObjective || void 0,
										noticeRequirements: analysis.deadline.date ? [`Respond by ${analysis.deadline.date}`] : [],
										supportingEvidence: [],
										strategyUsed: STRATEGY_TYPE_LABELS[analysis.strategies[selectedStrategyIdx || 0]?.type] || "selected",
										factsIncluded: analysis.extraction.facts.length,
										placeholdersRemaining: draft.unresolvedPlaceholders.length
									});
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-sm font-medium",
											children: exp.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: exp.summary
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-2 space-y-1",
											children: exp.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-medium text-ink",
														children: [step.label, ":"]
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: step.detail
													})
												]
											}, i))
										})
									] });
								})()
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5 space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DictationInput, {
									value: userObjective,
									onChange: setUserObjective,
									field: "objective",
									label: "Your objective (what you want the response to accomplish)",
									placeholder: "Example: Explain the income discrepancy and provide corrected documentation...",
									multiline: true,
									rows: 2
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DictationInput, {
									value: userFacts,
									onChange: setUserFacts,
									field: "facts",
									label: "Additional facts from your records",
									placeholder: "Enter any facts you want included that weren't extracted from the notice...",
									multiline: true,
									rows: 3
								})]
							}),
							qualityReport && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between mb-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "font-serif text-lg",
											children: "Response Quality Report"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: `font-mono text-2xl ${qualityReport.passed ? "text-emerald-600" : "text-amber-600"}`,
											children: [qualityReport.overallScore, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-sm text-muted-foreground",
												children: "/100"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `rounded-full px-3 py-1 text-xs font-medium inline-block mb-3 ${qualityReport.passed ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`,
										children: qualityReport.passed ? "PASSED" : "NEEDS ATTENTION"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-2",
										children: qualityReport.dimensions.map((dim) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border border-rule/30 rounded-md p-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-medium",
														children: dim.label
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: `text-xs font-mono ${dim.score >= 80 ? "text-emerald-600" : dim.score >= 50 ? "text-amber-600" : "text-red-600"}`,
														children: dim.score
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground",
													children: dim.description
												}),
												dim.issues.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
													className: "mt-1",
													children: dim.issues.slice(0, 2).map((issue, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
														className: "text-xs text-red-500 list-disc ml-3",
														children: issue
													}, i))
												})
											]
										}, dim.name))
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 text-xs text-muted-foreground italic",
										children: qualityReport.summary
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "envelope-card p-5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center justify-between mb-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs uppercase tracking-widest text-muted-foreground",
										children: [
											draft.wordCount,
											" words · ",
											draft.unresolvedPlaceholders.length,
											" placeholders"
										]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "whitespace-pre-wrap font-mono text-sm leading-6 text-ink",
									children: draft.content
								})]
							}),
							draft.unresolvedPlaceholders.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-md border border-amber-300/50 bg-amber-50/50 p-4",
								role: "alert",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "text-sm font-medium text-amber-700",
									children: [
										"Unresolved items (",
										draft.unresolvedPlaceholders.length,
										")"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-2 space-y-1",
									children: draft.unresolvedPlaceholders.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "text-xs text-amber-600",
										children: [
											"• [",
											p.placeholder,
											"] — ",
											p.reason
										]
									}, i))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/workflows/irs-notice",
									className: "inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5",
									children: "Continue to Mailing →"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: () => setPhase("strategy"),
									className: "text-sm text-muted-foreground hover:text-foreground",
									children: "← Back to strategies"
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
var SAMPLE_NOTICE = `Internal Revenue Service
CP2000 Notice of Underreported Income
Notice Number: CP2000-2024-12345-A
Date: July 15, 2026

Dear Taxpayer,

We are proposing changes to your 2024 tax return based on information received from third parties.

The income reported on your tax return does not match the income reported to us by employers and other payers.

Amount due: $3,847.00
You must respond by September 15, 2026.

If you agree with the changes, sign and return the response form with your payment.
If you disagree, provide a written explanation with supporting documentation.

You have the right to appeal this determination.

Sincerely,
IRS Automated Underreporter Operations`;
//#endregion
export { AnalyzeNotice as component };
