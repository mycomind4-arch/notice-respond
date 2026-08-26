# MailMyPDF Prelaunch Indexing Control

The complete public route architecture may be deployed before the product is finished.

The owner has explicitly chosen to keep the site out of Google until the ecosystem is complete.

## Required prelaunch behavior

- `robots.txt` disallows public crawling while prelaunch is enabled.
- Public pages may still be manually opened and tested.
- Auth/private/API paths remain protected and noindexed where appropriate.
- The sitemap route may be generated for internal validation, but it must not be advertised through robots while prelaunch is enabled.
- Canonical metadata still uses `https://mailmypdf.ai` so the production URL architecture is fixed early.

## Launch switch

When the owner declares launch-ready:

1. enable crawl access
2. publish the sitemap reference in robots.txt
3. verify canonical URLs
4. verify every sitemap URL returns a real page or intentional public placeholder
5. verify redirects from legacy hosts
6. verify authenticated/private routes remain out of the sitemap
