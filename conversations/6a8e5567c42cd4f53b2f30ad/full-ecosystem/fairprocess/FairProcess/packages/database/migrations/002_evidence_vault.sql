-- FairProcess Evidence Vault Extension v2
--
-- This migration deliberately retains the original evidence_documents column
-- names introduced by 001_initial_schema.sql. The API server still reads and
-- writes those columns, so renaming them here would break a clean deployment.
-- Spec-oriented metadata is added alongside the stable API contract.

CREATE TYPE evidence_state AS ENUM (
  'uploaded',
  'quarantined',
  'validated',
  'duplicate',
  'processing',
  'parsed',
  'review_required',
  'accepted',
  'superseded',
  'restricted',
  'archived',
  'deleted_under_policy'
);

CREATE TYPE acquisition_method AS ENUM (
  'drag_and_drop',
  'folder_upload',
  'email_intake',
  'api_intake',
  'scanner_intake',
  'cloud_storage_import',
  'url_capture',
  'public_portal_capture',
  'zip_archive_ingestion',
  'csv_spreadsheet_import'
);

CREATE TYPE confidentiality_level AS ENUM (
  'public',
  'internal',
  'confidential',
  'privileged',
  'restricted'
);

CREATE TYPE privilege_status AS ENUM (
  'none',
  'attorney_client',
  'work_product',
  'deliberative',
  'other_privileged',
  'redacted'
);

CREATE TYPE redaction_status AS ENUM (
  'not_redacted',
  'redacted',
  'redaction_in_progress'
);

CREATE TYPE processing_status AS ENUM (
  'pending',
  'in_progress',
  'parsed',
  'parse_failed',
  'review_required',
  'complete'
);

CREATE TYPE retention_status AS ENUM (
  'active',
  'legal_hold',
  'scheduled_deletion',
  'deleted'
);

CREATE TYPE version_type AS ENUM (
  'original',
  'redaction_derivative',
  'corrected',
  'supplemental'
);

CREATE TYPE custody_action AS ENUM (
  'intake',
  'quarantine',
  'validate',
  'duplicate_detected',
  'process_start',
  'process_complete',
  'parse_complete',
  'review_required',
  'accept',
  'supersede',
  'restrict',
  'archive',
  'delete_under_policy',
  'release_restriction',
  'access',
  'create_version',
  'update_metadata'
);

ALTER TABLE evidence_documents
  ADD COLUMN display_title TEXT,
  ADD COLUMN file_type TEXT,
  ADD COLUMN source_type acquisition_method NOT NULL DEFAULT 'drag_and_drop',
  ADD COLUMN source_uri TEXT,
  ADD COLUMN source_agency TEXT,
  ADD COLUMN document_date DATE,
  ADD COLUMN received_date DATE,
  ADD COLUMN classification confidentiality_level NOT NULL DEFAULT 'confidential',
  ADD COLUMN classification_confidence REAL,
  ADD COLUMN privilege_designation privilege_status NOT NULL DEFAULT 'none',
  ADD COLUMN redaction_status redaction_status NOT NULL DEFAULT 'not_redacted',
  ADD COLUMN processing_status processing_status NOT NULL DEFAULT 'pending',
  ADD COLUMN retention_status retention_status NOT NULL DEFAULT 'active',
  ADD COLUMN evidence_state evidence_state NOT NULL DEFAULT 'uploaded',
  ADD COLUMN duplicate_of TEXT REFERENCES evidence_documents(id),
  ADD COLUMN version_type version_type NOT NULL DEFAULT 'original',
  ADD COLUMN parent_version_id TEXT REFERENCES evidence_documents(id),
  ADD CONSTRAINT evidence_classification_confidence_range
    CHECK (
      classification_confidence IS NULL OR
      (classification_confidence >= 0 AND classification_confidence <= 1)
    );

UPDATE evidence_documents
SET display_title = filename
WHERE display_title IS NULL;

UPDATE evidence_documents
SET file_type = LOWER(SUBSTRING(filename FROM '\.([^.]+)$'))
WHERE file_type IS NULL AND filename LIKE '%.%';

CREATE INDEX idx_evidence_tenant_sha256
  ON evidence_documents(tenant_id, sha256);

CREATE INDEX idx_evidence_state
  ON evidence_documents(evidence_state);

CREATE INDEX idx_evidence_case_state
  ON evidence_documents(case_id, evidence_state);

CREATE INDEX idx_evidence_parent_version
  ON evidence_documents(parent_version_id);

CREATE INDEX idx_evidence_retention
  ON evidence_documents(retention_status);

CREATE TABLE document_versions (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id       TEXT NOT NULL REFERENCES evidence_documents(id) ON DELETE CASCADE,
  parent_version_id TEXT REFERENCES document_versions(id),
  version_type      version_type NOT NULL DEFAULT 'original',
  sha256            TEXT NOT NULL,
  storage_key       TEXT NOT NULL,
  byte_size         INTEGER NOT NULL CHECK (byte_size > 0),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by        TEXT NOT NULL
);

CREATE INDEX idx_document_versions_doc
  ON document_versions(document_id);

CREATE INDEX idx_document_versions_parent
  ON document_versions(parent_version_id);

CREATE TABLE document_pages (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  document_id       TEXT NOT NULL REFERENCES evidence_documents(id) ON DELETE CASCADE,
  page_number       INTEGER NOT NULL CHECK (page_number > 0),
  image_storage_key TEXT,
  native_text       TEXT,
  ocr_text          TEXT,
  text_confidence   REAL,
  layout_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (document_id, page_number),
  CHECK (
    text_confidence IS NULL OR
    (text_confidence >= 0 AND text_confidence <= 1)
  )
);

CREATE INDEX idx_document_pages_doc
  ON document_pages(document_id);

CREATE INDEX idx_document_pages_doc_page
  ON document_pages(document_id, page_number);

CREATE TABLE evidence_custody_events (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  evidence_id TEXT NOT NULL REFERENCES evidence_documents(id) ON DELETE CASCADE,
  action      custody_action NOT NULL,
  actor       TEXT NOT NULL,
  from_state  evidence_state,
  to_state    evidence_state,
  note        TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_custody_evidence
  ON evidence_custody_events(evidence_id);

CREATE INDEX idx_custody_created
  ON evidence_custody_events(created_at);

-- PostgreSQL cannot use CREATE OR REPLACE VIEW to insert or rename columns in
-- an existing view. Drop it explicitly before publishing the extended shape.
DROP VIEW IF EXISTS case_dashboard;

-- The fact-related aliases intentionally match the column layout created by
-- migration 003. This allows 003 to replace the view without changing its
-- public column signature.
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
  COUNT(DISTINCT vf.id) FILTER (
    WHERE NOT vf.human_verified
  ) AS pending_fact_count,
  COUNT(DISTINCT vf.id) FILTER (
    WHERE vf.human_verified
  ) AS controlling_fact_count,
  0::bigint AS contradicted_fact_count,
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
