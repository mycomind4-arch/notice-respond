# Live Analyst Client Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add one dependency-free browser client that operates the existing authenticated FairProcess API without mock records or a parallel backend.

**Architecture:** Serve a standalone HTML/CSS/JavaScript page from the existing web artifact. Hold the Bearer token only in JavaScript memory, discover the authenticated principal and active policy bundles from the API, and render all remote values through DOM `textContent`. Use existing server permissions and human authorization endpoints as the enforcement boundary.

**Tech Stack:** Browser Fetch API, Web Crypto/file APIs, vanilla JavaScript, existing Fastify API, existing static build pipeline.

## Constraints

- No password collection or local credential storage.
- No `localStorage`, `sessionStorage`, cookies, or query-string tokens.
- No synthetic case, report, audit, or policy data.
- No caller-supplied tenant or actor headers.
- No HTML insertion from API responses.
- No new backend routes or framework dependencies.

### Task 1: Connection and case workflow

- Add `apps/web/public/live.html`, `live.css`, and `live.js`.
- Connect with API base URL and Bearer token.
- Verify identity through `/api/me`.
- List and create cases using real API responses.
- Clear token and rendered data on disconnect.

### Task 2: Evidence workflow

- Discover policy bundles and their rules from the API.
- Add case expectations with verified trigger dates.
- Import recorder CSV with explicit search provenance.
- Run the deterministic audit and load the generated report.

### Task 3: Human review and audit evidence

- Render report findings and warnings.
- Fetch and download report Markdown.
- Authorize and publish only when the authenticated principal has the required permission.
- Render case audit trail and tenant audit-chain verification.

### Task 4: Security and build verification

- Add source-level tests for token handling, endpoint usage, DOM rendering, and prohibited identity headers.
- Link the live client from the sanitized demonstration banner.
- Update web documentation.
- Require full CI success before merge.
