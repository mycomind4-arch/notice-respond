# n8n Workflows for FairProcess

These workflow templates call the authenticated FairProcess REST API. Import the
JSON files into n8n, configure credentials and environment variables, and keep
the workflows inactive until their ingress controls have been reviewed.

## Authentication

All API calls use:

```http
Authorization: Bearer <FAIRPROCESS_API_TOKEN>
```

`FAIRPROCESS_API_TOKEN` must be an OIDC access token for a provisioned
FairProcess service identity. Tenant and actor identity come from that token and
the matching FairProcess user record; workflow payloads cannot select a tenant
or impersonate a reviewer.

Use separate service identities where practical:

- audit and recorder workflows: `analyst`-equivalent permissions
- evidence intake: `case:read` and `evidence:write`
- report distribution: `report:read` and `report:publish`

Do not grant the distribution service `report:authorize`. Human authorization
must occur through an authenticated reviewer action before workflow 04 runs.

The n8n webhook endpoints are separate public surfaces. Protect them with n8n
webhook authentication, a private network, or an authenticated reverse proxy.
The API bearer token authenticates n8n to FairProcess; it does not authenticate
outside callers to the n8n webhook.

## Environment variables

| Variable | Used by | Description |
|---|---|---|
| `FAIRPROCESS_API_URL` | All workflows | FairProcess API base URL, such as `http://localhost:3001` |
| `FAIRPROCESS_API_TOKEN` | All workflows | OIDC access token for the provisioned n8n service identity |
| `NOTIFICATION_CHANNEL_ID` | Audit pipeline | Slack channel for human-review alerts |
| `DAILY_DIGEST_CHANNEL_ID` | Recorder polling | Slack channel for daily digest |
| `EVIDENCE_CHANNEL_ID` | Evidence intake | Slack channel for evidence notifications |
| `REPORT_CHANNEL_ID` | Report distribution | Slack channel for published reports |
| `SMTP_FROM_EMAIL` | Report distribution | Sender email for report distribution |

## n8n credentials

- Configure Slack credentials for the Slack nodes.
- Configure SMTP credentials if workflow 04 sends email.
- Prefer n8n credentials or a secret store over plain environment variables for
  long-lived service credentials.

## Workflows

### 01. Case Audit Pipeline

File: `01-case-audit-pipeline.json`

**Trigger:** `POST /webhook/case-ready`

1. Receives `{ caseId, policyBundleId? }`.
2. Uses the service token to run an audit on a case in its tenant.
3. Analyzes `not_located`, `recorded_too_early`, and awaiting-trigger results.
4. Fetches report markdown.
5. Posts review-required results to Slack.
6. Returns an audit summary.

A case from another tenant is rejected by the API even if its identifier is
submitted to the webhook.

### 02. Scheduled Recorder Polling

File: `02-scheduled-recorder-polling.json`

**Trigger:** every 24 hours.

1. Fetches cases visible to the authenticated service identity.
2. Filters closed, already-published, and expectation-free cases.
3. Runs audits for qualifying cases.
4. Posts a daily digest to Slack.

The former `DEFAULT_TENANT_ID` setting has been removed. The service identity's
tenant determines which cases are visible.

### 03. Evidence Intake and Hash Verification

File: `03-evidence-intake.json`

**Trigger:** `POST /webhook/evidence-upload`

1. Receives `{ caseId, filename, contentType, sizeBytes?, sha256, storagePath }`.
2. Verifies that the service identity can access the case.
3. Checks existing evidence metadata for the same SHA-256 value.
4. Registers new evidence and notifies the evidence team, or returns the
   existing document ID for a duplicate.

This workflow registers metadata only. Secure object storage, MIME verification,
malware scanning, and immutable upload enforcement remain separate Evidence
Vault requirements.

### 04. Authorized Report Distribution

File: `04-report-distribution.json`

**Trigger:** `POST /webhook/report-authorized`

1. Receives `{ reportId, distributionList? }`.
2. Calls the publish endpoint, which succeeds only when the report was already
   human-authorized.
3. Fetches the published report markdown.
4. Sends email when recipients were supplied.
5. Posts the report to Slack.
6. Returns the distribution status.

The workflow no longer accepts `tenantId`, `authorizedBy`, or `publish`. It
cannot fabricate human authorization. The API preserves the authenticated
reviewer previously recorded on the report.

## Integration architecture

```text
                     authenticated OIDC service identity
                                  │
                                  ▼
┌──────────┐       ┌──────────┐  HTTPS  ┌───────────────┐    ┌──────────┐
│ Storage  │──────▶│   n8n    │────────▶│ FairProcess   │───▶│PostgreSQL│
│          │       │ Workflows│         │ API Server    │    │          │
└──────────┘       └──────────┘         └───────────────┘    └──────────┘
```

Every API operation is authorized against the service user's tenant and
permissions. Consequential actions still require the human-review boundaries
defined by FairProcess.
