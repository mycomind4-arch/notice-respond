# MailMyPDF Ecosystem Migration Status — Gold Standard

_Last updated: 2026-08-22_

## Reference architecture

**Appeal Mail** remains the product/UX reference. **MailMyPDF Platform** remains the shared infrastructure reference. Vertical repositories own their domain intelligence and workflow-specific UX.

Canonical fulfillment flow:

`MailMyPDF Account → Auth → Durable Intent → Human Approval → Stripe Checkout → Server Payment Verification → MailMyPDF Document/Communication → Tracking → Proof`

## Verticals

| Repository | Domain | Current migration state | Key completed work | Remaining release gate |
|---|---|---|---|---|
| `appeal-mail` | Appeals | **Reference / production-ready** | 33 workflows, 135 APIs, Gold SEO/UX, Account auth, Stripe, MailMyPDF integration | Ongoing SEO/revenue optimization |
| `notice-respond` | Government notices | **Gold migration in progress** | Account auth, owner context, server APIs, MailMyPDF adapter fix, Stripe intent/payment boundary, payment-first mailing funnel, launch CI | CI/deployment verification + real test-mode E2E + remaining workflow UX |
| `immigration-mail` | Immigration correspondence | **Gold migration in progress** | Account auth, server auth guard, canonical MailMyPDF v1 adapter, multipart fix, Stripe intent/payment boundary, legacy checkout bridge, expanded workflow SEO/sitemap, launch CI | CI/deployment verification + test-mode E2E + tracking/proof |
| `dispute-mail` | Disputes | **Gold migration in progress** | Account auth, server-function auth, RLS ownership policies, canonical MailMyPDF v1 adapter, Stripe/payment boundary, approval-gated mail UI, launch CI | CI/deployment verification + test-mode E2E + remaining case persistence |
| `mailmypdf-smallbusiness` | SMB correspondence | **Gold infrastructure migration in progress** | Business/member RLS, durable mailing intents, Pages auth helper, server Stripe checkout, payment return verifier, Trigger.dev remains durable executor, hardened launch CI | Wire composer to server intent + paid-trigger execution + persistent workspace |
| `gov-reply` | Government response umbrella | **Platform-boundary migration in progress** | Account-authenticated AI boundary, durable mailing intent, Stripe checkout, payment verification, Cloudflare Worker remains vertical runtime | Actual MailMyPDF fulfillment after paid state + account UX |

## Non-negotiable boundaries

- No physical mailing from unauthenticated browser code.
- No client-trusted claim that payment completed.
- No direct carrier integration from vertical UI.
- No bypass of domain-specific review/validation/approval gates.
- No fake mailing success or simulated tracking in production.
- No secrets in client bundles.
- No cross-tenant access; every business/case/mailing intent must have owner/member enforcement.

## Verification rule

Repository test/build claims must come from connected CI/deployment verification. Do not mark a migration “release verified” based only on static source inspection.

## Deployment hostname contract

- MailMyPDF production: `https://mailmypdf.pages.dev`
- Appeal Mail production: `https://appeal-mail.pages.dev`

Preview/alternate hosts must not replace canonical production URLs in sitemaps, canonicals, OG metadata, API base configuration, or checkout redirects.

## Recommended next implementation order

1. Finish Notice Respond CI/deployment verification and remaining workflow landing/SEO work.
2. Finish Immigration Mail CI/deployment verification, end-to-end test-mode fulfillment, and proof.
3. Finish Dispute Mail CI/deployment verification, end-to-end test-mode fulfillment, and remaining case persistence.
4. Finish Business composer/server persistence and Trigger.dev paid-execution bridge.
5. Finish GovReply actual MailMyPDF fulfillment and account UX.
6. Extract the stable auth/payment/fulfillment pieces into reusable Platform packages once at least three verticals have passed release verification.
