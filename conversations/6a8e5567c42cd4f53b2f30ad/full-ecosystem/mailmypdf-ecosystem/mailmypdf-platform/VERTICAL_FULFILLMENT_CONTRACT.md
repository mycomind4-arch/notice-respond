# MailMyPDF Vertical Fulfillment Contract

## Purpose

Every MailMyPDF vertical must use the same authenticated, payment-first fulfillment boundary.

## Canonical order flow

```text
Authenticated MailMyPDF Account
        ↓
Create durable mailing intent
        ↓
Create Stripe Checkout Session
        ↓
User completes payment
        ↓
Server verifies Stripe session + owner
        ↓
Resolve draft + recipient + mailing method from durable intent
        ↓
Upload document to MailMyPDF
        ↓
Create idempotent MailMyPDF communication
        ↓
Persist provider order + tracking state
        ↓
Expose honest submitted / failed / delivered state
```

## Security rules

- No vertical may submit a physical mailing directly from an unauthenticated browser request.
- Recipient, price, mailing method, and payment state are never trusted from the post-payment client request.
- Stripe Checkout metadata must bind the session to the authenticated MailMyPDF user and durable mailing intent.
- MailMyPDF communication creation must use deterministic idempotency.
- Tenant ownership must be enforced in both application authorization and the persistence layer.
- Missing configuration must fail closed; no simulated mailing success is permitted.

## Vertical responsibilities

A vertical supplies:

- workflow ID/title
- final reviewed draft
- recipient selected from the domain workflow
- mailing method allowed by the vertical
- matter/reference identifiers
- domain-specific evidence, rules, deadlines, and review gates

The platform supplies:

- account identity
- authorization
- durable mailing intents
- Stripe payment boundary
- MailMyPDF document upload
- communication creation
- idempotency
- tracking/proof state
- audit events

## Integration requirement

A new vertical should consume the shared fulfillment contract instead of implementing its own Stripe checkout, payment verification, or MailMyPDF HTTP adapter.

The Notice Respond implementation is the current reference migration and should be treated as the proving ground before the pattern is generalized into reusable platform code.
