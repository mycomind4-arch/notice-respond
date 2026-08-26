# MailMyPDF Ecosystem Defragmentation Execution Order

This is the implementation order; do not redesign navigation per repository.

1. Freeze canonical domain and public URL map at `mailmypdf.ai`.
2. Build the gateway/global shell from the platform contracts.
3. Establish one MailMyPDF Account identity flow.
4. Protect `/dashboard/*`, `/account/*`, and `/admin/*` centrally.
5. Move authenticated mailing history behind the account boundary.
6. Add route-aware placeholder pages for every future product/workflow.
7. Migrate Core MailMyPDF routes first.
8. Connect Appeal Mail to `/appeal/*`.
9. Connect Notice Respond to `/notice/*`.
10. Connect Immigration Mail to `/immigration/*`.
11. Connect Dispute Mail to `/dispute/*`.
12. Connect Small Business to `/business/*`.
13. Connect remaining future verticals behind the same placeholders.
14. Centralize sitemap generation and canonical metadata.
15. Disable indexing before launch; enable only when owner declares the ecosystem launch-ready.
16. Redirect or de-index legacy `pages.dev` / `workers.dev` public URLs after each migration is verified.

Acceptance rule: adding a new vertical must require registry + route mapping + implementation, never a new public navigation design.
