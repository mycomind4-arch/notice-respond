# FairProcess AI Worker

Cloudflare Worker that provides AI-assisted capabilities for FairProcess using
[Workers AI](https://developers.cloudflare.com/workers-ai/).

## Safety boundary

This worker **extracts facts and drafts text**. It never:
- Authorizes findings or reports
- Makes legal determinations
- Sends correspondence
- Records audit events

Every output must be reviewed by a human before it enters the FairProcess audit trail.

## Capabilities

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/extract-facts` | POST | Extract structured facts from evidence document text |
| `/ai/draft-correspondence` | POST | Draft records requests, follow-ups, and appeal notices |
| `/ai/summarize-report` | POST | Summarize integrity reports for different audiences |
| `/ai/match-evidence` | POST | Semantic similarity matching for evidence deduplication |
| `/ai/models` | GET | List configured AI models and prompt version |
| `/health` | GET | Health check |

## Setup

### Prerequisites

- Cloudflare account with Workers AI enabled (free tier includes 10K Neurons/day)
- Wrangler CLI: `npm install -g wrangler`

### Deploy

```bash
cd packages/ai-worker

# Install dependencies
pnpm install

# Set the shared API key (for authenticating requests from the FairProcess API)
wrangler secret put API_KEY

# Set the FairProcess API URL (for callbacks, if needed)
wrangler secret put FAIRPROCESS_API_URL

# Deploy
wrangler deploy
```

### Models

Configured via `wrangler.toml` `[vars]`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `DEFAULT_MODEL` | `@cf/meta/llama-3.1-8b-instruct` | Fact extraction, correspondence drafting |
| `ADVANCED_MODEL` | `@cf/meta/llama-3.1-70b-instruct` | Complex extraction on long documents |
| `EMBEDDING_MODEL` | `@cf/baai/bge-base-en-v1.5` | Evidence similarity matching |

See all available models at [developers.cloudflare.com/workers-ai/models](https://developers.cloudflare.com/workers-ai/models/).

## Usage

### Extract facts from a document

```bash
curl -X POST https://fairprocess-ai.YOUR-SUBDOMAIN.workers.dev/ai/extract-facts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "documentText": "Notice of Violation CE-2026-001 was served on January 15, 2026. The property at APN 123-456-789...",
    "documentType": "notice_of_violation",
    "caseContext": {
      "jurisdiction": "Humboldt County, California",
      "agencyCaseNumber": "CE-2026-001",
      "knownApns": ["123-456-789"]
    }
  }'
```

Response:
```json
{
  "facts": [
    {
      "factType": "service_date",
      "dataType": "date",
      "proposedValue": "January 15, 2026",
      "normalizedValue": "2026-01-15",
      "excerpt": "served on January 15, 2026",
      "confidence": 0.95
    },
    {
      "factType": "apn",
      "dataType": "apn",
      "proposedValue": "123-456-789",
      "normalizedValue": "123456789",
      "excerpt": "APN 123-456-789",
      "confidence": 0.92
    }
  ],
  "model": "@cf/meta/llama-3.1-8b-instruct",
  "promptVersion": "fairprocess-ai-v1",
  "warnings": []
}
```

### Draft correspondence

```bash
curl -X POST https://fairprocess-ai.YOUR-SUBDOMAIN.workers.dev/ai/draft-correspondence \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "caseContext": {
      "jurisdiction": "Humboldt County, California",
      "agency": "Humboldt County Code Enforcement",
      "agencyCaseNumber": "CE-2026-001",
      "apns": ["123-456-789"]
    },
    "correspondenceType": "records_request",
    "tone": "formal",
    "recipient": { "agency": "Humboldt County Recorder" },
    "keyPoints": [
      "Request all recorded instruments for APN 123-456-789",
      "Search date range: January 1, 2026 to present"
    ]
  }'
```

### Summarize a report

```bash
curl -X POST https://fairprocess-ai.YOUR-SUBDOMAIN.workers.dev/ai/summarize-report \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "reportJson": { ... },
    "audience": "supervisor"
  }'
```

## Integration with FairProcess API

The FairProcess API server can call this worker when:

1. **Evidence upload** → trigger fact extraction, store results as candidate facts
   in the fact workbench with `extractionMethod: "model_extraction"`,
   `modelVersion`, and `promptVersion` from the response.

2. **Correspondence drafting** → the `/api/cases/:id/correspondence` endpoint
   can optionally call this worker to generate a draft, storing `draftedByAi: true`
   and `aiVersion: "fairprocess-ai-v1"` in the correspondence record.

3. **Report generation** → after an audit run, the API can request a summary
   for the analyst workspace or for public-facing display.

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│  FairProcess UI │────▶│  FairProcess API│────▶│  FairProcess AI  │
│  (Cloudflare    │     │  (Cloudflare    │     │  (Cloudflare     │
│   Pages)        │     │   Worker)      │     │   Worker + AI)  │
└─────────────────┘     └────────┬───────┘     └────────┬─────────┘
                                 │                       │
                          ┌──────▼───────┐        ┌──────▼───────┐
                          │  Neon        │        │ Workers AI   │
                          │  Postgres    │        │ (Llama, BGE) │
                          └──────────────┘        └──────────────┘
```

The AI worker is a separate Cloudflare Worker with its own deployment.
It communicates with the main API via HTTP, authenticated with a shared
API key set as a secret in both workers.
