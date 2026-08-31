# MailMyPDF Gateway Placeholder Policy

The gateway owns the canonical public URL space. A route may be backed by a vertical repository, a platform service, or a placeholder implementation.

## Required placeholder families

`/appeal/*`, `/notice/*`, `/immigration/*`, `/dispute/*`, `/business/*`, `/records/*`, `/tenant/*`, `/permit/*`, `/benefits/*`, `/claim/*`, `/govreply/*`, and `/future/*` must remain routable even before their implementation repository is connected.

## Placeholder page requirements

Every unimplemented route must render a stable product-aware page with:

- route-derived title and H1
- canonical URL on `mailmypdf.ai`
- global MailMyPDF navigation
- product family navigation where applicable
- Sign In / Dashboard state based on the shared identity layer
- link to `/send`
- no assertion that the workflow is executable
- a clear transition path to the product family

## SEO launch control

Placeholders are part of the route architecture and should remain accessible for internal navigation and development. Search indexing is a separate launch control. Before public launch, the gateway can use a global prelaunch robots policy while the sitemap inventory continues to exist for validation.

## Gateway precedence

1. Exact implemented route
2. Connected vertical route
3. Placeholder route

This ensures that a missing vertical implementation never produces a broken link or removes a planned public URL.
