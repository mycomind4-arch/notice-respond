# MailMyPDF Auth & Account Contract

## Identity

All MailMyPDF products use the platform `MailMyPDF Account` identity.

## Anonymous

Public product and SEO pages are browseable without authentication.

## Customer

Authenticated users can access:

- Dashboard
- Mailing history
- Product workspaces
- Account profile
- Security/preferences

## Admin

Admin access is role-based and enforced server-side. UI visibility is not an authorization control.

## History rule

Complete mailing history is authenticated-only and scoped to the authenticated account owner.

Guest order recovery/status may use a high-entropy lookup mechanism, but it is not equivalent to account history and must expose only customer-safe fields.

## Cross-product behavior

Moving between product families must preserve the MailMyPDF account identity. A product must not ask the user to create a second MailMyPDF account.

## Redirect rule

Sign-in links may accept a safe relative return path. External redirect URLs are rejected unless explicitly allowlisted by the gateway.
