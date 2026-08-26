export const INSURANCE_DENIAL_LETTER_PRICING={preparationFee:19.99,includedResponsePages:3,responsePagePrice:0.45,supportingPagePrice:0.25,standardMail:5.49,certifiedMail:12.49,registeredMail:29.99,largePacketFee:2.5,largePacketThresholdSheets:7} as const;
export const INSURANCE_DENIAL_LETTER_AUTHORITY_RULES=[
"Use the actual denial letter, policy/plan materials supplied by the customer, issuer instructions, applicable regulator guidance, and current official sources as the controlling record.",
"Never invent coverage terms, exclusions, claim facts, deadlines, appeal rights, filing methods, or outcomes.",
"Do not assume every insurer uses the same appeal process; identify issuer, plan type, jurisdiction, and notice-specific instructions.",
"Separate internal appeal, external review, regulator complaint, and later escalation when the source record supports them.",
"Unsupported procedural conclusions remain unresolved and block confident ready-to-send status.",
"Never promise that the denial will be reversed."
] as const;
export const INSURANCE_DENIAL_LETTER_GOLD={workflowId:"insurance-denial-letter",title:"Respond to an Insurance Denial Letter",lifecycle:"authority",capabilities:["document-classification","fact-extraction","authority-resolution","deadline-verification","appeal-path-verification","evidence-analysis","contradiction-detection","timeline-analysis","adversarial-stress-test","response-strategy","drafting","independent-validation","readiness","human-approval","pricing","deterministic-pdf","submission","mailing","proof"],authorityRules:INSURANCE_DENIAL_LETTER_AUTHORITY_RULES,pricing:INSURANCE_DENIAL_LETTER_PRICING} as const;
