# MailMyPDF Ecosystem SEO Contract

## Canonical host

`https://mailmypdf.ai`

## Public page rules

Every indexable public page must have:

- one canonical URL on `mailmypdf.ai`
- unique title
- unique meta description
- one descriptive H1
- Open Graph title/description/url
- product-family breadcrumb where appropriate
- a link to the relevant product family
- a conversion path to `/send` or the relevant executable workflow

## Auth/private pages

The following must not be in the public sitemap:

- `/auth/*`
- `/account/*`
- `/dashboard/*`
- `/orders/*` when the route contains private order data
- `/admin/*`
- API endpoints
- internal health/control-plane endpoints

They should use `noindex` where appropriate.

## Placeholder pages

Public placeholders may exist in the route graph before implementation. The global prelaunch indexing policy controls discovery; do not remove pages from the route map simply because the workflow is not finished.

## Sitemap

The gateway produces the ecosystem sitemap. Vertical repos provide route manifests rather than publishing independent canonical sitemap hosts.

A sitemap entry must point to the final public hostname, never to a preview deployment hostname.

## Legacy hosts

Old `pages.dev`/`workers.dev` URLs are migration infrastructure. They are not canonical SEO URLs. Once migration is complete, they must redirect or be excluded from indexing.
