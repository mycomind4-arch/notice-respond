# MailMyPDF Ecosystem — Gold Standard Deep Code Audit

Date: 2026-08-20

## Objective

Spend the day moving the MailMyPDF ecosystem from workflow metadata and isolated contracts toward genuinely executable Gold Standard workflows.

Gold means the workflow can prove, through code and tests, that it performs:

`ingest → classify → extract → provenance → deadlines → contradictions → findings → discrepancies → evidence → research → risk → strategy → draft → draft provenance → validation → blocking gate → human review → approval → mailing → tracking → proof/audit`

A workflow must not be called Gold because its UI, route, catalog entry, manifest, or lifecycle runner exists.

## Audit criteria

A workflow is evaluated against four distinct states:

- **catalog** — surfaced product/workflow intent, but no executable domain capability.
- **domain-ready** — domain contract and/or analysis exists, but runtime path is not complete.
- **executable** — domain/runtime lifecycle exists and blocks correctly; external production verification may still remain.
- **gold** — executable plus zero blockers, representative regression coverage, real fulfillment/tracking/proof integration, and deployed end-to-end verification.

## Cross-ecosystem findings

### P0 — state-machine bypass risk

Several mature verticals had transition functions that could return success without executing validation/evidence/approval gates. The most serious instance was Notice Respond, where forward `goToStep()` navigation could skip every consequential phase.

Status: **fixed in Notice Respond**.

### P0 — review silently becoming authorization

Notice Respond's `setReviewChecks()` previously set `approved = true` automatically when all review checkboxes were selected. That collapsed human review and authorization into one UI state.

Status: **fixed**. Review checks now establish review completion; explicit `approveWorkflow()` is required before mailing/checkout.

### P0 — provenance-free Gold stages

GovReply, Code Enforcement, and Small Business Gold runners accepted bare boolean success values. A dependency could return `true` with no source, document, provider, actor, tracking, or proof evidence.

Status: **fixed in all three runners**. Regression tests now reject successful-looking stages without evidence IDs.

### P0 — non-idempotent physical-mail submission

Records Requests previously transitioned to `queued`, called fulfillment, then attempted additional state transitions. Provider success followed by a local transition error could permit a retry to submit duplicate physical mail.

Status: **hardened** with deterministic idempotency key derived from request ID + document hash and state reconciliation.

Remaining: the external MailMyPDF service must honor the idempotency key in deployed execution.

### P0 — caller-supplied approval/submission actor

Records Requests approval and submission paths previously accepted caller-supplied audit identity text.

Status: **fixed code-side**. Approval and submission now require an injected authenticated principal with an approved role and record the verified subject. Resolver failures fail closed. Deployment still needs the real auth/session resolver.

### P0 — UI falsely claiming physical submission

Dispute Mail's Credit Report workflow previously advanced from `Pay and send` directly to a `submitted` screen without Stripe payment or a fulfillment API call.

Status: **fixed**. Checkout now fails closed and explicitly reports that live payment/fulfillment is not installed; the current route remains preparation-only and reports `Not submitted`.

### P0 — UI-created mailing order falsely treated as submission

Immigration Mail's response workflow created a Supabase `mailing_orders` row with status `draft`, then immediately displayed `Your letter has been submitted`. No Stripe charge or carrier/MailMyPDF submission occurred in that path.

Status: **fixed code-side**. The current mailing helper now fails closed with `fulfillment_not_configured` rather than allowing the UI to reach its success screen through a draft-only record. A real payment/provider boundary is still required.

### P0 — ambiguous provider state mapped to success

Appeal Mail's MailMyPDF adapter previously mapped unknown provider communication statuses to `submitted`, allowing an unrecognized upstream state to masquerade as a valid mailing state.

Status: **fixed**. Unknown statuses now throw; missing provider communication IDs and empty status lookup IDs also fail closed. Direct regression coverage was added for status mapping.

### P0 — unproven payment before mailing readiness

Appeal Mail's Stripe checkout function previously accepted an appeal ID and recipient information without loading the owner-scoped appeal or enforcing the canonical readiness gate.

Status: **fixed**. Checkout now loads the owner-scoped appeal, verifies the workflow ID, and requires `isReadyToMail()` before Stripe session creation.

### P0 — provider acceptance conflated with proof-complete mailing

Small Business's durable executor previously emitted `mailing.sent` immediately after provider acceptance even when tracking/proof data was absent.

Status: **fixed**. The executor now emits `mailing.accepted`, emits `mailing.proof_pending` when tracking or proof is incomplete, and emits `mailing.sent` only when both are present.

### P1 — capability metadata versus implementation

Appeal Mail previously granted capabilities from workflow steps. That loophole has been removed. Capabilities now come from concrete packs, and specialized capabilities require explicit pack declaration.

Status: **fixed**.

### P1 — catalog `IMPLEMENTED` versus actual runtime registration

Appeal Mail's customer-facing catalog uses static `IMPLEMENTED` / `executable` fields. Production code did not contain a verified `registerDomainPack` / `constructWorkflow` execution path, so the static flag could outrun runtime reality.

Status: **fixed in UI**. Customer-facing “Executable workflow” now additionally requires a registered domain pack and a non-blueprint constructed workflow.

### P1 — certification runner not referenced by production runtime

Usage searches show the new Small Business, GovReply, and Code Enforcement Gold runners are currently not referenced by production code. They are certification assets, not execution enforcement yet.

Status: **open**. Ledger correctly classifies those verticals as `domain-ready` until production runtime calls the Gold runner.

### P1 — test command skipped TypeScript domain suites

Dispute Mail and Immigration Mail had TypeScript Gold/domain tests outside their normal test command.

Status: **fixed** by moving their primary test command to include the domain suites.

### P1 — provider response trust boundary

Small Business's MailMyPDF client previously accepted arbitrary JSON as a successful execution result.

Status: **fixed**. Provider execution responses are schema-validated, must contain a non-empty lifecycle status, and must reference the same mail job that was submitted. Regression tests cover malformed and cross-job responses.

### P1 — benefits evidence status without provenance

Benefits Appeal previously allowed a `supported`/`draft_ready` issue to pass the drafting gate without any evidence ID.

Status: **fixed**. Drafting now requires non-empty evidence provenance for every non-excluded supported issue, with regression coverage.

### P1 — permit evidence/authority status without provenance

Permit Response previously treated `evidence_found`/`response_ready` as sufficient without requiring actual evidence IDs, and validation did not require authoritative source IDs.

Status: **fixed**. Drafting requires evidence provenance; validation requires authoritative provenance for non-excluded requirements, with regression coverage.

### P1 — product lifecycle versus execution certification conflation

The core `mailmypdf` vertical registry previously had only a product `status` field, while the ecosystem audit uses a separate Gold execution lifecycle. Several registry entries were `status: "live"` even though their dedicated vertical repositories were only catalog/domain-ready.

Status: **fixed code-side**. `VerticalDefinition` now has an independent `executionState` with regression coverage for all ten canonical entries. Product lifecycle/navigation status and Gold execution certification can no longer be conflated.

## Repository audit matrix

| Repo | Strongest state | Key evidence | Main blockers |
|---|---|---|---|
| `mailmypdf-platform` | executable foundation | canonical pipeline, domain-pack contract, certification ledger, CI config | sibling-runtime integration and networked verification |
| `mailmypdf` | shared production platform | payment/fulfillment/security hardening, retention, rate limiting, private PDFs; executionState now separates product lifecycle from Gold readiness | operational secrets, cron, alerting, bot protection, E2E provider verification; current registry verification needs a fresh full suite run |
| `notice-respond` | domain-ready | mature CP14/CP2000 stack, strict sequential runtime gate, explicit approval, extraction gate, regression suite | explicit CP2000 approval UI, missing `/api/mail/response` route, deployed provider/path certification |
| `appeal-mail` | domain-ready | pack-backed factory, quality gates, owner-scoped checkout readiness, provider fail-closed status mapping, regression tests | factory/runtime pack registration, deployed submission/tracking/proof |
| `dispute-mail` credit-report | domain-ready | deterministic analysis, evidence/finding gates, false-submit UI removed | actual runtime wiring, Stripe/fulfillment, tracking/proof |
| `dispute-mail` other workflows | catalog | explicit partial state | domain packs/analysis |
| `immigration-mail` | domain-ready | document understanding, preflight, validation/review/approval, false-success guard | actual payment/provider path, deployed fulfillment/tracking/proof |
| `mailmypdf-smallbusiness` | domain-ready | Trigger.dev durable task, approval ordering, evidence-bearing Gold runner, provider response validation, acceptance/proof separation, accountable approval actors, signed webhook contract | runner not wired into executor certification, persistence, scheduling auth, fulfillment, tracking, proof, team permissions |
| `gov-reply` | domain-ready | source-grounded AI worker, evidence-bearing Gold runner | runner not wired into executor, persistence, fulfillment, tracking/proof |
| `code-enforcement` | domain-ready | evidence-bearing lifecycle runner/tests | runner not wired into executor, property/jurisdiction runtime, fulfillment |
| `records-requests` | executable | D1 repo, DB constraints, server-side attested PDF, idempotent provider boundary, fail-closed approval/submission identity, HMAC callback | D1 provisioning, real auth resolver, live provider, deployed E2E |
| `permit-response` | domain-ready | permit-specific contract/tests, evidence provenance gate, authority-source gate | Code Enforcement/shared runtime boundary |
| `benefits-appeal` | domain-ready | benefits-specific contract/tests, evidence provenance gate | Appeal Mail/FairProcess runtime boundary |
| `debt-defense` | catalog | explicit execution decision | reuse must first be proven inside Dispute Mail |
| `tenant-reply` | catalog | explicit execution decision | shared runtime not connected |
| `insurance-claims` | catalog | explicit execution decision | shared intelligence/runtime not connected |

## Gold Standard priority order for the day

### Wave 1 — close runtime bypasses and false-success UI

1. Notice Respond — wire explicit approval UX and create/verify the actual server-side mailing route.
2. Records Requests — provision/authenticate deployment, run real D1 + provider E2E, verify callback/proof.
3. Immigration Mail — replace draft-order persistence with actual authenticated payment + MailMyPDF submission before showing success.
4. Dispute Mail — wire `canApproveDispute` and `canSubmitDispute` into the real runtime.

### Wave 2 — connect certification runners to production execution

5. Appeal Mail — register concrete domain packs and make the factory the actual execution boundary.
6. Small Business — connect Gold runner to the actual executor/Trigger task and make persistence/approval/tracking durable.
7. GovReply — add persisted case lifecycle and route execution through the Gold runner.
8. Code Enforcement — connect jurisdiction/property/evidence services to the Gold runner.

### Wave 3 — activate dependent verticals

9. Benefits Appeal — specialize the Appeal Mail engine.
10. Permit Response — specialize Code Enforcement/shared property infrastructure.
11. Debt Defense — implement inside Dispute Mail where reuse is proven.
12. Tenant Reply — build from shared document/timeline/evidence primitives.
13. Insurance Claims — build only after shared evidence/timeline primitives are proven reusable.

### Wave 4 — ecosystem certification

14. Run package-level and repo-level tests.
15. Run deployed smoke tests.
16. Verify real fulfillment/tracking/proof.
17. Promote workflows to Gold only when blocker count reaches zero.

## Required test invariants

Every Gold runner should have regression coverage proving:

1. a successful-looking stage with no provenance blocks;
2. missing evidence blocks consequential action;
3. failed validation blocks review/approval/mailing;
4. review completion does not automatically grant approval;
5. missing approval blocks mailing;
6. incomplete recipient blocks submission;
7. provider failure creates a deterministic recoverable state;
8. provider success cannot be duplicated by retry;
9. tracking must exist before completion;
10. proof must exist before Gold completion;
11. users cannot jump directly to consequential steps through alternate navigation paths;
12. the production executor actually invokes the certified Gold runner;
13. a database draft/order record cannot be presented as physical mailing submission;
14. provider responses are schema-validated and correlated to the requested job/case;
15. customer-facing “executable” labels are backed by real runtime capability registration;
16. unknown provider states fail closed rather than being mapped to success;
17. approval/payment creation cannot occur before readiness validation;
18. accountable actor identity is present for consequential approvals/rejections;
19. product lifecycle status cannot imply Gold execution readiness.

## External-agent handoff

The following remain account/deployment operations rather than pure repository work:

- Cloudflare D1 provisioning and migrations.
- Live MailMyPDF fulfillment credentials.
- Provider webhook registration/secrets.
- Deployed runtime smoke tests.
- Stripe/Lob sandbox transactions.
- Cloudflare cron and alerting configuration.
- Production secret rotation/verification.

Those operations should be performed only after the repository-level gates are green.

## Rule for today

Do not add more catalog pages merely to make progress look larger.

Spend the day converting existing workflow definitions into **provable execution paths** and closing the gaps between:

`catalog → domain-ready → executable → Gold`.
