# MailMyPDF Master Navigation & SEO Architecture

Status: system contract

## Canonical public architecture

All public MailMyPDF products are presented as one ecosystem under `mailmypdf.ai`.

The implementation repositories may remain separate. Public routing is unified by the gateway.

```text
mailmypdf.ai
├── /
├── /send
├── /write
├── /pricing
├── /ecosystem
├── /resources/*
├── /account/*
├── /dashboard/*
├── /orders/*
├── /appeal/*
├── /notice/*
├── /immigration/*
├── /dispute/*
├── /business/*
├── /records/*
├── /tenant/*
├── /permit/*
├── /benefits/*
├── /claim/*
└── /future/*
```

## Global navigation

Desktop and mobile use the same conceptual navigation everywhere:

**MailMyPDF** · **Products** · **How It Works** · **Resources** · **Pricing** · **Account** · **Start Mailing**

`Products` exposes the complete product family. Product-specific navigation is a secondary layer and must never replace the global shell.

### Anonymous account state

Show `Sign In`.

### Authenticated customer state

Show `Dashboard` and `Account`.

### Authenticated admin state

Show `Admin` in addition to the customer account controls.

### Mailing history

Mailing history is authenticated-only. Guest order lookup is a deliberately limited recovery/status experience, not the account history navigation.

## Product families

| Family | Canonical public prefix | Repository/status |
|---|---|---|
| Core mailing | `/send`, `/write`, `/orders` | `mailmypdf` |
| Appeal Mail | `/appeal/*` | `appeal-mail` |
| Notice Respond | `/notice/*` | `notice-respond` |
| Immigration Mail | `/immigration/*` | `immigration-mail` |
| Dispute Mail | `/dispute/*` | `dispute-mail` |
| Small Business | `/business/*` | `mailmypdf-smallbusiness` |
| Records Request | `/records/*` | current/next-generation product route |
| Tenant Reply | `/tenant/*` | future/placeholder until routed |
| Permit Reply | `/permit/*` | future/placeholder until routed |
| Benefits Appeal | `/benefits/*` | future/placeholder until routed |
| Claim Proof | `/claim/*` | future/placeholder until routed |

## Placeholder rule

Every planned public family and its high-value SEO/workflow routes must have a stable URL before the underlying implementation exists.

A placeholder route must:

- use the canonical MailMyPDF domain
- have a deterministic title/H1/meta description
- clearly identify the product family
- link back to the ecosystem and core mailing flow
- avoid `noindex` solely because implementation is missing; launch indexing is controlled separately until the ecosystem is production-ready
- never claim the workflow is operational when it is not

## SEO architecture

One ecosystem-wide sitemap is canonical:

`https://mailmypdf.ai/sitemap.xml`

It may be generated from a sitemap index, but all public canonical URLs must resolve under `mailmypdf.ai`.

Product repos may generate route inventories, but they must not publish unrelated `pages.dev` hostnames as canonical URLs.

### Sitemap groups

- core
- products
- appeal
- notice
- immigration
- dispute
- business
- records
- tenant
- permit
- benefits
- claim
- resources
- legal

## Canonical/robots rule before launch

The ecosystem owner may keep the complete route architecture live while blocking search discovery until the product is ready. The production launch switch should control:

- `robots.txt`
- sitemap availability/reference
- canonical host promotion
- search indexing policy

Do not delete placeholder routes merely because indexing is disabled during development.

## Migration rule

Legacy `*.pages.dev` / `*.workers.dev` URLs may remain during migration, but they are deployment endpoints, not permanent marketing URLs. Once the canonical host is ready, each legacy URL should either redirect to the corresponding `mailmypdf.ai` route or be excluded from indexing.

## Navigation requirements for vertical repos

Vertical repositories may own their product-specific menu, but the global MailMyPDF shell must remain consistent:

- brand/logo back to MailMyPDF
- Products/Ecosystem access
- How It Works
- Resources
- Pricing
- authenticated Account/Dashboard
- admin visibility based on server-authorized role
- Start Mailing/product CTA

No vertical may expose a separate competing account model.

## Account contract

The platform identity is `MailMyPDF Account`.

Required conceptual areas:

- `/account/profile`
- `/account/security`
- `/account/preferences`
- `/dashboard`
- `/dashboard/orders`
- `/dashboard/products`
- `/dashboard/settings`
- `/admin`

Product-specific workspaces are children of the user's authenticated account context.

## Future implementation rule

Do not redesign the public navigation when a new vertical launches. Add the vertical to the canonical registry, route manifest, sitemap inventory, and gateway map. The global shell remains unchanged.
