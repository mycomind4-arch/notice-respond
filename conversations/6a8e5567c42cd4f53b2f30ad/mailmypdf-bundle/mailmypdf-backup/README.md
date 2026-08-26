# MailMyPDF

Mail a letter or PDF without a printer. Upload a PDF or write a letter in your browser — we print, stamp, and mail it via USPS.

Built with TanStack Start, Supabase, Lob (mailing API), and Stripe (payments).

## Features

- Upload PDF or write a letter in-browser
- Color printing and certified/registered mail options
- 20+ letter templates
- Future-self scheduled letters
- Bulk mailing
- Pro plan: free letters per month + discounted rates
- Pricing from $4.99 (short letter) to $9.99 (long letter)

## Architecture

- **Frontend:** TanStack Start (file-based routing), Radix UI, Tailwind CSS
- **Backend:** Supabase (auth, database, storage)
- **Mailing:** Lob API for print-and-mail fulfillment
- **Payments:** Stripe Checkout
- **Deployment:** Cloudflare Workers compatible

## Routes

```
src/routes/
  index.tsx                  Landing page
  auth.tsx                   Authentication
  bulk.tsx                   Bulk mailing
  certified-mail-guide.tsx   Certified mail info
  mail-a-contract-online.tsx  Contract mailing
  future-self.tsx            Scheduled future letters
  _authenticated/            Protected routes (orders, dashboard)
  api/                       Server functions
```

## Documentation

- [Architecture Roadmap (100K Users)](docs/ARCHITECTURE_ROADMAP.md)
- [Launch Verification](docs/LAUNCH_VERIFICATION.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Retention & Cleanup](docs/RETENTION_AND_CLEANUP.md)

## Getting started

```bash
bun install
cp .env.example .env  # Fill in Supabase, Lob, and Stripe keys
bun run dev
```

## Status

Actively developed. Has a defined four-phase scaling roadmap. See `docs/ARCHITECTURE_ROADMAP.md` for known launch blockers.

> **Note:** This project is connected to Lovable. Avoid rewriting published git history.
