# Global Navigation Contract

This is the navigation contract for every MailMyPDF public product.

## Primary shell

```text
MailMyPDF
Products ▾
How It Works
Resources ▾
Pricing
[Sign In | Dashboard]
[Start Mailing]
```

## Products menu

- Mail a Document
- Write a Letter
- Appeal Mail
- Notice Respond
- Immigration Mail
- Dispute Mail
- Small Business Mail
- Records Request
- Tenant Reply
- Permit Reply
- Benefits Appeal
- Claim Proof
- GovReply

## Authenticated shell

For a signed-in customer, replace `Sign In` with:

- Dashboard
- Mailing History
- Account

For an authorized admin, also expose:

- Admin

## Rules

1. Every public page, regardless of owning repository, has access to the global shell.
2. Vertical-specific navigation appears below or inside the global shell; it does not replace it.
3. The global product list comes from the platform registry, not local hardcoded arrays in vertical repositories.
4. Mailing history is not a public navigation destination for anonymous users.
5. Admin links are hidden from unauthorized users and protected by server-side authorization.
6. Product CTAs route to the product family, not directly to an arbitrary implementation hostname.
7. `pages.dev` and `workers.dev` deployment URLs never appear in public navigation.
8. The global shell must remain stable when a new product is added.
