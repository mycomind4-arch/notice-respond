# MailMyPDF Ecosystem — Account, Access, and Monetization Contract

**Status:** Canonical platform policy
**Date:** 2026-08-16

This document locks the shared account and monetization model for every MailMyPDF vertical. A vertical may specialize its domain workflows and UI, but it must not invent a competing identity, entitlement, or billing model.

## 1. One ecosystem account

**MailMyPDF is the canonical identity provider and account system for the ecosystem.**

A user creates one MailMyPDF account and can access every enabled vertical with that same identity. Vertical repositories must consume the identity contract; they must not create separate user accounts, passwords, or competing identity stores.

The platform defines the provider-neutral identity and entitlement contracts in `@mailmypdf/ecosystem`. MailMyPDF owns the actual authentication/session implementation.

```text
                    MAILMYPDF ACCOUNT
                 identity + organization
                           |
            +--------------+--------------+
            |              |              |
       MailMyPDF      Notice Respond   Appeal Mail
            |              |              |
            +--------------+--------------+
                           |
                    Shared Platform
```

## 2. Basic MailMyPDF remains frictionless

The simple MailMyPDF mailing utility may be used without an account.

Example: **Mail a PDF without a printer** → upload → address → mailing options → pay → send.

This anonymous path must remain deliberately narrow. It must not silently become a gateway to the richer ecosystem capabilities.

## 3. Rich technology requires an account

AI-rich, research-heavy, document-intelligence, voice, evidence, agentic, and specialized vertical workflows require a MailMyPDF account.

The intended funnel is:

```text
Anonymous basic mailing
        |
        +--> no account required

Rich workflow
        |
        +--> MailMyPDF account required
        |
        +--> shared ecosystem identity
        |
        +--> access to enabled verticals
```

The exact free allowance is configurable, but the initial platform policy is:

- Anonymous: 1 basic workflow per day where an anonymous workflow is supported.
- Free account: limited daily workflow allowance (initial default: 5 completed workflows/day).
- Paid platform plan: substantially increased usage allowance; the exact plan limits are owned by MailMyPDF billing configuration.
- Enterprise: organization-specific entitlements.

A **workflow**, not an individual LLM call, OCR operation, tool call, retry, or token, is the default user-facing usage unit. Internal implementation details must not cause users to burn multiple workflow credits for one coherent task.

## 4. Platform usage and mailing are separate charges

The ecosystem has two distinct monetization axes:

### Platform usage

Paid plans or usage purchases provide increased access to AI, research, document intelligence, voice, storage, and other platform capabilities.

### Physical mailing

Mailing is a separate transactional charge. A user can have a free platform account and still pay for physical mailing. A paid platform plan does not imply free postage or fulfillment.

```text
                    MAILMYPDF
                       |
             +---------+---------+
             |                   |
       PLATFORM USAGE        PHYSICAL MAIL
             |                   |
       free allowance       pay per transaction
             |                   |
       paid upgrade         certified/etc.
```

This separation is mandatory because the cost drivers and user intent are different.

## 5. Vertical rules

Every generated or manually maintained vertical must:

1. Use the MailMyPDF ecosystem identity.
2. Require an authenticated MailMyPDF account for rich workflows.
3. Consume the shared entitlement/usage contract.
4. Consume shared platform AI, document, evidence, voice, proof, and workflow capabilities where applicable.
5. Route physical mailing through the canonical MailMyPDF fulfillment boundary.
6. Never implement its own Stripe customer/billing identity for ordinary ecosystem users.
7. Never implement its own user/password system for ordinary ecosystem users.
8. Never create a separate free/paid tier that conflicts with the ecosystem policy.
9. Keep domain-specific authorization and permissions local to the vertical or organization where needed.
10. Preserve tenant isolation even though identity is centralized.

## 6. What is centralized vs. isolated

### Centralized in MailMyPDF

- Authentication and sessions
- Account and organization identity
- Billing customer/subscription state
- Platform usage ledger and entitlements
- Mailing checkout and physical fulfillment
- Ecosystem directory/discovery

### Shared as platform contracts

- Identity contract
- Workflow entitlement contract
- Usage event contract
- Vertical registration contract
- Platform-usage charge contract
- Mailing charge contract
- Capability and approval boundaries

### Isolated in each vertical

- Domain data
- Domain workflows
- Domain prompts/skills
- Domain-specific permissions
- Domain-specific UI
- Domain-specific evidence and case records

Central identity does **not** mean shared application databases.

## 7. Vertical factory requirement

The vertical factory must treat the account and monetization contract as part of every generated vertical's baseline architecture.

Given a request such as:

> Build Code Enforcement Correspondence

The generated application should automatically inherit:

- MailMyPDF account authentication
- ecosystem entitlement checks
- free/paid platform usage accounting
- voice/AI access through shared capabilities
- shared document/evidence primitives
- MailMyPDF physical-mail checkout
- shared tracking/proof boundary

The generator should not ask the vertical author to reinvent these systems.

## 8. Safety and approval

Account entitlement is not authorization for consequential actions. A valid account may use a workflow, but consequential actions such as sending mail, submitting an external request, making a payment, or taking a legally significant action still require the vertical's explicit authorization/approval policy.

## 9. Non-negotiable invariants

These are encoded in `@mailmypdf/ecosystem` and should be treated as architecture-gate checks:

- `MAILMYPDF_IS_CANONICAL_IDENTITY`
- `ONE_ACCOUNT_ACROSS_ECOSYSTEM`
- `BASIC_MAILING_MAY_BE_ANONYMOUS`
- `RICH_WORKFLOWS_REQUIRE_ACCOUNT`
- `VERTICALS_DO_NOT_IMPLEMENT_AUTH`
- `VERTICALS_DO_NOT_IMPLEMENT_BILLING`
- `PLATFORM_USAGE_IS_SEPARATE_FROM_MAILING`
- `MAILING_IS_TRANSACTIONAL`
- `WORKFLOW_IS_THE_USAGE_UNIT`
- `ALL_VERTICALS_USE_THE_SAME_ENTITLEMENT_CONTRACT`
