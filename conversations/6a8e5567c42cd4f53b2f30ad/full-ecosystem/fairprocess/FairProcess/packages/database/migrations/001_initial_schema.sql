-- FairProcess Database Schema v1
-- PostgreSQL / Supabase compatible
--
-- Design principles:
--   1. Append-only audit trail with SHA-256 event linking
--   2. Multi-tenant isolation via tenant_id
--   3. Versioned policy bundles with activation status
--   4. Human authorization required for consequential findings
--   5. Evidence preservation with content hashes

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE instrument_kind AS ENUM (
  'notice_of_violation_and_proposed_penalty',
  'final_finding_and_order',
  'resolution_documentation',
  'administrative_civil_penalty_lien'
);

CREATE TYPE trigger_field AS ENUM (
  'servedOn',
  'becameFinalOn',
  'resolvedOn'
);

CREATE TYPE recordation_status AS ENUM (
  'awaiting_trigger',
  'not_yet_eligible',
  'not_located',
  'recorded',
  'recorded_too_early'
);

CREATE TYPE recorder_search_scope AS ENUM (
  'self_service_index',
  'certified_search',
  'agency_export',
  'unknown'
);

CREATE TYPE extraction_method AS ENUM (
  'manual',
  'ocr',
  'native_text',
  'api_import'
);

CREATE TYPE public_records_status AS ENUM (
  'draft',
  'submitted',
  'acknowledged',
  'clarification_requested',
  'partially_produced',
  'completed',
  'no_response_recorded',
  'closed'
);

CREATE TYPE report_status AS ENUM (
  'generated',
  'human_review',
  'authorized',
  'published',
  'superseded'
);

CREATE TYPE audit_action AS ENUM (
  'case_created',
  'evidence_uploaded',
  'fact_extracted',
  'fact_verified',
  'fact_rejected',
  'recorder_imported',
  'policy_activated',
  'policy_deactivated',
  'audit_run',
  'report_generated',
  'report_authorized',
  'report_published',
  'report_superseded',
  'records_request_created',
  'records_request_updated',
  'correspondence_drafted',
  'correspondence_authorized',
  'correspondence_sent'
);

-- ============================================================
-- TENANTS
-- ============================================================

CREATE TABLE tenants (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kind        TEXT NOT NULL CHECK (kind IN ('resident', 'advocate', 'agency')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ============================================================
-- CASES
-- ============================================================

CREATE TABLE cases (
  id                TEXT PRIMARY KEY,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  jurisdiction      TEXT NOT NULL,
  agency            TEXT,
  agency_case_number TEXT,
  as_of             DATE NOT NULL,
  status            TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'closed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cases_tenant ON cases(tenant_id);
CREATE INDEX idx_cases_agency_number ON cases(agency_case_number);

-- ============================================================
-- APNS (many per case)
-- ============================================================

CREATE TABLE case_apns (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  apn         TEXT NOT NULL,
  normalized  TEXT NOT NULL,
  verified    BOOLEAN NOT NULL DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  UNIQUE (case_id, normalized)
);

CREATE INDEX idx_case_apns_case ON case_apns(case_id);
CREATE INDEX idx_case_apns_normalized ON case_apns(normalized);

-- ============================================================
-- EVIDENCE DOCUMENTS
-- ============================================================

CREATE TABLE evidence_documents (
  id                TEXT PRIMARY KEY,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  filename          TEXT NOT NULL,
  content_type      TEXT NOT NULL,
  size_bytes        INTEGER NOT NULL,
  sha256            TEXT NOT NULL,
  storage_path      TEXT NOT NULL,
  page_count        INTEGER,
  uploaded_by       TEXT NOT NULL,
  uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_evidence_case ON evidence_documents(case_id);
CREATE INDEX idx_evidence_sha256 ON evidence_documents(sha256);

-- ============================================================
-- VERIFIED FACTS (extracted from evidence)
-- ============================================================

CREATE TABLE verified_facts (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id       TEXT REFERENCES evidence_documents(id) ON DELETE SET NULL,
  fact_key          TEXT NOT NULL,
  fact_value        TEXT NOT NULL,
  data_type         TEXT NOT NULL CHECK (data_type IN ('string', 'date', 'apn', 'number')),
  page_number       INTEGER,
  quote             TEXT,
  extraction_method extraction_method NOT NULL DEFAULT 'manual',
  confidence        REAL,
  human_verified    BOOLEAN NOT NULL DEFAULT false,
  verified_by       TEXT,
  verified_at      TIMESTAMPTZ,
  rejected_by       TEXT,
  rejected_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_facts_case ON verified_facts(case_id);
CREATE INDEX idx_facts_key ON verified_facts(fact_key);

-- ============================================================
-- RECORDER INSTRUMENTS (imported from CSV/API)
-- ============================================================

CREATE TABLE recorder_instruments (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  instrument_number TEXT NOT NULL,
  recorded_on       DATE NOT NULL,
  apn               TEXT,
  instrument_kind   instrument_kind NOT NULL,
  party             TEXT,
  import_source     TEXT NOT NULL,
  imported_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recorder_case ON recorder_instruments(case_id);
CREATE INDEX idx_recorder_instrument_number ON recorder_instruments(instrument_number);

-- ============================================================
-- RECORDER SEARCHES
-- ============================================================

CREATE TABLE recorder_searches (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  searched_on       DATE NOT NULL,
  source            TEXT NOT NULL,
  scope             recorder_search_scope NOT NULL,
  notes             TEXT,
  instrument_count  INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recorder_searches_case ON recorder_searches(case_id);

-- ============================================================
-- POLICY BUNDLES (versioned)
-- ============================================================

CREATE TABLE policy_bundles (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  jurisdiction      TEXT NOT NULL,
  policy_version    TEXT NOT NULL,
  activation_status TEXT NOT NULL DEFAULT 'draft' CHECK (activation_status IN ('draft', 'legal_review_required', 'active', 'deprecated', 'superseded')),
  rules             JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at      TIMESTAMPTZ,
  activated_by      TEXT,
  UNIQUE (jurisdiction, policy_version)
);

CREATE INDEX idx_policy_jurisdiction ON policy_bundles(jurisdiction);
CREATE INDEX idx_policy_active ON policy_bundles(activation_status);

-- ============================================================
-- INSTRUMENT EXPECTATIONS (what we expect to find recorded)
-- ============================================================

CREATE TABLE instrument_expectations (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  rule_id           TEXT NOT NULL,
  instrument_kind   instrument_kind NOT NULL,
  served_on         DATE,
  became_final_on   DATE,
  resolved_on       DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expectations_case ON instrument_expectations(case_id);
CREATE INDEX idx_expectations_rule ON instrument_expectations(rule_id);

-- ============================================================
-- INTEGRITY REPORTS
-- ============================================================

CREATE TABLE integrity_reports (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  policy_bundle_id  TEXT REFERENCES policy_bundles(id),
  report_json       JSONB NOT NULL,
  report_markdown   TEXT NOT NULL,
  status            report_status NOT NULL DEFAULT 'generated',
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  authorized_by     TEXT,
  authorized_at     TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,
  superseded_by     TEXT REFERENCES integrity_reports(id),
  summary           JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX idx_reports_case ON integrity_reports(case_id);
CREATE INDEX idx_reports_status ON integrity_reports(status);

-- ============================================================
-- PUBLIC RECORDS REQUESTS
-- ============================================================

CREATE TABLE public_records_requests (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id             TEXT REFERENCES cases(id) ON DELETE SET NULL,
  tenant_id           TEXT NOT NULL REFERENCES tenants(id),
  agency              TEXT NOT NULL,
  submitted_on        DATE,
  status              public_records_status NOT NULL DEFAULT 'draft',
  delivery_evidence_id TEXT REFERENCES evidence_documents(id) ON DELETE SET NULL,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prr_case ON public_records_requests(case_id);
CREATE INDEX idx_prr_status ON public_records_requests(status);

-- ============================================================
-- CORRESPONDENCE (drafted by AI, authorized by human)
-- ============================================================

CREATE TABLE correspondence (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id           TEXT REFERENCES cases(id) ON DELETE SET NULL,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  direction         TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  channel           TEXT NOT NULL CHECK (channel IN ('email', 'mail', 'portal', 'phone_log')),
  subject           TEXT,
  body              TEXT,
  drafted_by_ai     BOOLEAN NOT NULL DEFAULT false,
  ai_version        TEXT,
  authorized_by     TEXT,
  authorized_at     TIMESTAMPTZ,
  sent_at           TIMESTAMPTZ,
  evidence_doc_id   TEXT REFERENCES evidence_documents(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_correspondence_case ON correspondence(case_id);

-- ============================================================
-- AUDIT EVENT LOG (append-only, SHA-256 linked)
-- ============================================================

CREATE TABLE audit_events (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id         TEXT NOT NULL REFERENCES tenants(id),
  case_id           TEXT REFERENCES cases(id) ON DELETE SET NULL,
  actor             TEXT NOT NULL,
  action            audit_action NOT NULL,
  source_hashes     JSONB NOT NULL DEFAULT '[]'::jsonb,
  policy_version    TEXT,
  extraction_version TEXT,
  result            JSONB NOT NULL DEFAULT '{}'::jsonb,
  human_authorized_by TEXT,
  prior_event_hash   TEXT,
  event_hash        TEXT NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_events_tenant ON audit_events(tenant_id);
CREATE INDEX idx_audit_events_case ON audit_events(case_id);
CREATE INDEX idx_audit_events_action ON audit_events(action);

-- ============================================================
-- TRIGGERS — auto-update updated_at and link audit events
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cases_updated_at BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER public_records_requests_updated_at BEFORE UPDATE ON public_records_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- VIEW — case dashboard summary
-- ============================================================

CREATE VIEW case_dashboard AS
SELECT
  c.id AS case_id,
  c.tenant_id,
  c.jurisdiction,
  c.agency,
  c.agency_case_number,
  c.status AS case_status,
  c.as_of,
  COUNT(DISTINCT ed.id) AS evidence_count,
  COUNT(DISTINCT vf.id) AS fact_count,
  COUNT(DISTINCT vf.id) FILTER (WHERE vf.human_verified) AS verified_fact_count,
  COUNT(DISTINCT ri.id) AS recorder_instrument_count,
  COUNT(DISTINCT ie.id) AS expectation_count,
  (SELECT ir.status FROM integrity_reports ir
    WHERE ir.case_id = c.id
    ORDER BY ir.generated_at DESC LIMIT 1
  ) AS latest_report_status,
  (SELECT ir.generated_at FROM integrity_reports ir
    WHERE ir.case_id = c.id
    ORDER BY ir.generated_at DESC LIMIT 1
  ) AS latest_report_at,
  c.created_at,
  c.updated_at
FROM cases c
LEFT JOIN evidence_documents ed ON ed.case_id = c.id
LEFT JOIN verified_facts vf ON vf.case_id = c.id
LEFT JOIN recorder_instruments ri ON ri.case_id = c.id
LEFT JOIN instrument_expectations ie ON ie.case_id = c.id
GROUP BY c.id;
