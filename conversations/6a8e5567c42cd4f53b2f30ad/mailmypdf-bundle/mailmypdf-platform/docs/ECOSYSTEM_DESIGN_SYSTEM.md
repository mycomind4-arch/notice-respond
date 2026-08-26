# MailMyPDF Ecosystem Design System

**Status:** Canonical visual contract

The MailMyPDF family should feel like one product ecosystem, not a collection of unrelated SaaS applications.

## Shared 80%

Every ecosystem app should share:

- typography hierarchy
- spacing scale
- border/radius language
- neutral surfaces and borders
- button/input behavior
- cards and panels
- status semantics
- focus treatment
- responsive layout principles
- navigation behavior
- workflow/approval states
- document/evidence/timeline presentation
- accessibility expectations

The framework is intentionally neutral. Platform packages provide tokens and contracts; each vertical owns its React/Vue/etc. component implementation.

## Vertical 20%

A vertical may customize:

- accent color
- accent-soft surface
- domain terminology
- domain-specific illustrations/icons
- specialized dashboard widgets
- domain-specific information architecture

Do not create a second spacing scale, typography system, status vocabulary, or button language.

## Family themes

| Product | Accent | Character |
| --- | --- | --- |
| MailMyPDF | Blue | core / trustworthy |
| Immigration Mail | Violet | professional / guided |
| Small Business | Teal | professional / energetic |
| Government | Blue | civic / authoritative |

Themes are intentionally restrained. They should still look unmistakably related.

## Interaction rules

### Primary action
Use one visually dominant primary action per meaningful surface. Avoid competing filled buttons.

### Consequential actions
Mail, submit, publish, delete, and sensitive sharing must use the shared approval/review pattern. The visual treatment must make the consequence obvious.

### Status
Use the shared semantic vocabulary:

- success
- warning
- danger
- info
- neutral
- pending
- approval required
- blocked

Do not invent vertical-specific meanings for the same colors.

### Evidence
Evidence should visually distinguish:

1. verified source-backed fact
2. extracted/unverified information
3. inference
4. warning/contradiction
5. missing information

### AI
AI-generated content should never visually masquerade as an authoritative source. Use the shared provenance/explanation treatment wherever factual claims matter.

## Accessibility baseline

- WCAG 2.2 AA target.
- Visible keyboard focus.
- Never rely on color alone for status.
- Minimum touch target of approximately 44px for primary interactive controls.
- Respect reduced-motion preferences.
- Maintain readable line lengths and adequate contrast.
- Error states must explain how to recover.

## Responsive baseline

Desktop applications may use a 256px navigation rail/sidebar and a 64px top bar, but content must collapse gracefully to a single-column mobile layout. The content container target is 1200px.

## Anti-regression rule

Before adding a new vertical component, ask:

> Is this a new domain component, or am I accidentally reinventing a shared primitive?

If the latter, improve the Platform design-system contract instead.

## Implementation

Canonical tokens live in `packages/design-system/src/index.ts` and `packages/design-system/src/tokens.css`.

The design-system package contains no application framework and no product-specific business logic.
