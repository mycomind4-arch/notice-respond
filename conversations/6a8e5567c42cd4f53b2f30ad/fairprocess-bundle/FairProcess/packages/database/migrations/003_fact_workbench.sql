-- FairProcess Fact Verification Workbench v3
-- Product spec §8.5 — Fact Verification Workbench
--
-- Extends the verified_facts table with the full candidate fact structure
-- required by the product specification, adds fact_sources (many sources
-- per fact), and fact_reviews (immutable review history).
--
-- Design principles:
--   1. AI proposes; humans verify; only controlling facts feed policy
--   2. Every review action is recorded as an immutable FactReview
--   3. Contradictory facts are tracked and must be resolved
--   4. Superseded facts are preserved for audit
--   5. The original proposed value is never overwritten

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE fact_verification_state AS ENUM (
  'proposed',
  'accepted',
  'accepted_with_qualification',
  'corrected',
  'rejected',
  'contradicted',
  'superseded',
  'requires_additional_evidence'
);

CREATE TYPE fact_type AS ENUM (
  'service_date',
  'finality_date',
  'appeal_deadline',
  'hearing_date',
  'instrument_number',
  'apn',
  'owner_identity',
  'monetary_amount',
  'case_number',
  'party_name',
  'address',
  'document_date',
  'recorded_date',
  'property_description',
  'violation_description',
  'penalty_amount',
  'other'
);

CREATE TYPE fact_data_type AS ENUM (
  'string',
  'date',
  'apn',
  'number',
  'boolean'
);

CREATE TYPE fact_extraction_method AS ENUM (
  'manual',
  'ocr',
  'native_text',
  'api_import',
  'model_extraction'
);

CREATE TYPE review_action AS ENUM (
  'accept',
  'reject',
  'edit',
  'add_source',
  'mark_ambiguous',
  'request_document',
  'create_discrepancy',
  'escalate_legal',
  'designate_controlling',
  'remove_controlling'
);

-- ============================================================
-- EXTEND verified_facts WITH FULL CANDIDATE FACT STRUCTURE (§8.5)
-- ============================================================

ALTER TABLE verified_facts
  ADD COLUMN IF NOT EXISTS tenant_id        TEXT REFERENCES tenants(id),
  ADD COLUMN IF NOT EXISTS fact_type        fact_type NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS proposed_value    TEXT,
  ADD COLUMN IF NOT EXISTS normalized_value  TEXT,
  ADD COLUMN IF NOT EXISTS current_value     TEXT,
  ADD COLUMN IF NOT EXISTS verification_state fact_verification_state NOT NULL DEFAULT 'proposed',
  ADD COLUMN IF NOT EXISTS is_controlling   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS superseded_by    TEXT REFERENCES verified_facts(id),
  ADD COLUMN IF NOT EXISTS model_version    TEXT,
  ADD COLUMN IF NOT EXISTS prompt_version   TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_note    TEXT;

-- Backfill tenant_id from cases
UPDATE verified_facts vf
  SET tenant_id = c.tenant_id
  FROM cases c
  WHERE vf.case_id = c.id AND vf.tenant_id IS NULL;

-- Backfill proposed/current value from fact_value (old column)
UPDATE verified_facts
  SET proposed_value = fact_value
  WHERE proposed_value IS NULL AND fact_value IS NOT NULL;
UPDATE verified_facts
  SET current_value = fact_value
  WHERE current_value IS NULL AND fact_value IS NOT NULL;
UPDATE verified_facts
  SET normalized_value = fact_value
  WHERE normalized_value IS NULL AND fact_value IS NOT NULL;

-- Backfill verification_state from existing human_verified flag
UPDATE verified_facts
  SET verification_state = 'accepted'
  WHERE human_verified = true AND verification_state = 'proposed';

-- Set is_controlling for verified facts (backward compat)
UPDATE verified_facts
  SET is_controlling = true
  WHERE human_verified = true AND reviewer_note IS NULL;

-- Make tenant_id NOT NULL after backfill
ALTER TABLE verified_facts
  ALTER COLUMN tenant_id SET NOT NULL;

-- Rename fact_key → fact_type_key (avoid collision with new fact_type enum column)
-- We keep fact_key for backward compat but add a separate fact_type_key
ALTER TABLE verified_facts
  ADD COLUMN IF NOT EXISTS fact_type_key TEXT;

UPDATE verified_facts
  SET fact_type_key = fact_key
  WHERE fact_type_key IS NULL AND fact_key IS NOT NULL;

-- Index for verification state queries
CREATE INDEX IF NOT EXISTS idx_facts_state
  ON verified_facts(verification_state);

CREATE INDEX IF NOT EXISTS idx_facts_controlling
  ON verified_facts(case_id) WHERE is_controlling = true;

CREATE INDEX IF NOT EXISTS idx_facts_superseded
  ON verified_facts(superseded_by);

CREATE INDEX IF NOT EXISTS idx_facts_tenant
  ON verified_facts(tenant_id);

-- ============================================================
-- FACT SOURCES (§8.5 — source document, page, bounding box, excerpt)
-- ============================================================
-- A fact may have multiple sources. Each source records the
-- document, page, bounding box/text location, supporting excerpt,
-- extraction method, model version, prompt version, and confidence.

CREATE TABLE fact_sources (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fact_id           TEXT NOT NULL REFERENCES verified_facts(id) ON DELETE CASCADE,
  document_id       TEXT REFERENCES evidence_documents(id) ON DELETE SET NULL,
  page_number       INTEGER,
  bounding_box      JSONB,  -- {x, y, width, height}
  text_location     JSONB,  -- {startOffset, endOffset}
  excerpt           TEXT NOT NULL,
  extraction_method fact_extraction_method NOT NULL DEFAULT 'manual',
  model_version     TEXT,
  prompt_version    TEXT,
  confidence        REAL NOT NULL DEFAULT 0.0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fact_sources_fact
  ON fact_sources(fact_id);

CREATE INDEX idx_fact_sources_doc
  ON fact_sources(document_id);

-- ============================================================
-- FACT REVIEWS (§8.5 — immutable review history)
-- ============================================================
-- Every reviewer action produces an immutable review record.
-- This is the audit trail for the verification workbench.

CREATE TABLE fact_reviews (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fact_id           TEXT NOT NULL REFERENCES verified_facts(id) ON DELETE CASCADE,
  action            review_action NOT NULL,
  reviewer          TEXT NOT NULL,
  previous_value    TEXT,
  new_value         TEXT,
  previous_state    fact_verification_state NOT NULL,
  new_state         fact_verification_state NOT NULL,
  note              TEXT,
  added_source_id   TEXT REFERENCES fact_sources(id) ON DELETE SET NULL,
  linked_discrepancy_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_fact_reviews_fact
  ON fact_reviews(fact_id);

CREATE INDEX idx_fact_reviews_reviewer
  ON fact_reviews(reviewer);

CREATE INDEX idx_fact_reviews_created
  ON fact_reviews(created_at);

-- ============================================================
-- FACT CONTRADICTIONS (§8.5 — contradictory candidates)
-- ============================================================
-- Links two facts that contradict each other. Both must be
-- resolved before either can be designated as controlling.

CREATE TABLE fact_contradictions (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  fact_id_a       TEXT NOT NULL REFERENCES verified_facts(id) ON DELETE CASCADE,
  fact_id_b       TEXT NOT NULL REFERENCES verified_facts(id) ON DELETE CASCADE,
  case_id         TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  reviewer        TEXT NOT NULL,
  note            TEXT,
  resolved        BOOLEAN NOT NULL DEFAULT false,
  resolved_by     TEXT,
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (fact_id_a != fact_id_b)
);

CREATE INDEX idx_fact_contradictions_a
  ON fact_contradictions(fact_id_a);

CREATE INDEX idx_fact_contradictions_b
  ON fact_contradictions(fact_id_b);

CREATE INDEX idx_fact_contradictions_case
  ON fact_contradictions(case_id);

-- ============================================================
-- UPDATE case_dashboard VIEW
-- ============================================================

CREATE OR REPLACE VIEW case_dashboard AS
SELECT
  c.id AS case_id,
  c.tenant_id,
  c.jurisdiction,
  c.agency,
  c.agency_case_number,
  c.status AS case_status,
  c.as_of,
  COUNT(DISTINCT ed.id) AS evidence_count,
  COUNT(DISTINCT ed.id) FILTER (
    WHERE ed.evidence_state = 'accepted'
  ) AS accepted_evidence_count,
  COUNT(DISTINCT ed.id) FILTER (
    WHERE ed.evidence_state = 'duplicate'
  ) AS duplicate_evidence_count,
  COUNT(DISTINCT ed.id) FILTER (
    WHERE ed.evidence_state = 'restricted'
  ) AS restricted_evidence_count,
  COUNT(DISTINCT vf.id) AS fact_count,
  COUNT(DISTINCT vf.id) FILTER (WHERE vf.verification_state = 'proposed') AS pending_fact_count,
  COUNT(DISTINCT vf.id) FILTER (WHERE vf.is_controlling) AS controlling_fact_count,
  COUNT(DISTINCT vf.id) FILTER (WHERE vf.verification_state = 'contradicted') AS contradicted_fact_count,
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
