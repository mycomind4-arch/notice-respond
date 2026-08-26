# MailMyPDF Ecosystem Deployment Hostname Contract

These public Pages hostnames are canonical and must not drift:

| Product | Canonical host |
|---|---|
| MailMyPDF | `https://mailmypdf.pages.dev` |
| Appeal Mail | `https://appeal-mail.pages.dev` |

## Rules

- Production links, sitemap canonicals, OG URLs, API base URLs, and success/cancel redirects must use the canonical hostname where appropriate.
- Alternate Cloudflare Pages project URLs may exist for previews, but they are not production canonicals.
- A deployment migration is not complete until the canonical hostname returns the intended build and the previous/alternate hostname is either redirected or excluded from SEO indexing.
- Vertical products may use their own canonical hosts, but they must not silently substitute a preview deployment hostname for production URLs.
