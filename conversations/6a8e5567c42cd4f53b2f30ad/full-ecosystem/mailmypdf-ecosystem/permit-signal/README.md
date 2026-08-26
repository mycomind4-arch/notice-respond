# Archived: PermitSignal legacy implementation

> **Canonical repository:** `mycomind4-arch/permitsignal`
>
> This repository is retained as a historical snapshot. Its relevant capabilities were reviewed against the canonical implementation on July 18, 2026. Do not add features, deployment changes, or production data here.

# PermitSignal

PermitSignal turns fragmented municipal web pages and public documents into structured permit, bid, planning, zoning, and development opportunities.

This repository is the revenue-first foundation: submit real source URLs, crawl the pages, follow relevant public-document links, extract commercial signals, and persist traceable results. It intentionally ships without mock opportunities.

## Quick start

Requirements: Docker and Docker Compose.

1. Copy .env.example to .env.
2. Run: docker compose up --build
3. Open the API documentation at http://localhost:8000/docs
4. Submit a source to POST /v1/ingest.

Example request:

    {
      "source": {
        "name": "Example City",
        "jurisdiction": "Example City, CA",
        "source_type": "permits",
        "urls": ["https://example.gov/permits"],
        "keywords": ["permit", "development", "bid", "planning"]
      },
      "max_pages": 10
    }

## What works now

- Safe crawling of public HTTP/HTTPS sources
- Crawl4AI integration when the optional engine set is installed
- Lightweight crawler fallback for development
- Docling PDF parsing when installed
- PyPDF fallback for ordinary text PDFs
- PaddleOCR availability detection for the scanned-document phase
- Rule-based, evidence-linked opportunity extraction
- SQLite persistence and deterministic deduplication
- Health, ingestion, opportunity-listing, and source-listing endpoints
- Docker-based local operation
- Tests for extraction and network-target validation

## Repository layout

- src/permit_signal/api.py: FastAPI surface
- src/permit_signal/pipeline.py: crawl, document, extraction, and persistence orchestration
- src/permit_signal/engines.py: replaceable open-source engine adapters
- src/permit_signal/extractor.py: deterministic opportunity extraction
- src/permit_signal/security.py: public-network URL guardrails
- upstream.lock.json: exact upstream Git commit pins
- THIRD_PARTY_NOTICES.md: upstream attribution and license record

## Engine installation

The default image remains small and runnable. To install the complete upstream AI/document stack:

    INSTALL_FULL_ENGINES=true docker compose build --no-cache
    docker compose up

PaddleOCR is recorded and detected but is not invoked automatically until scanned-image confidence and review gates are implemented. This avoids silently manufacturing low-confidence data.

## Commercial roadmap

1. Validate one jurisdiction and one paying contractor segment.
2. Add scheduled source monitoring and change detection.
3. Add organization accounts, territories, alerts, and billing.
4. Add human review for low-confidence documents.
5. Expand jurisdiction adapters only after the first source produces sellable leads.

## License posture

PermitSignal application code is currently private and unlicensed. Upstream engines remain separate dependencies under their own licenses. See THIRD_PARTY_NOTICES.md. Do not remove their notices when distributing images or source.