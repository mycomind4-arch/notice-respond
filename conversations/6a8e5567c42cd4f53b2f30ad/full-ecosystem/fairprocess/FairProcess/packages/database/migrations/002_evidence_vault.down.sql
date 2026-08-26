-- Rollback: Evidence Vault extension

DROP VIEW IF EXISTS case_dashboard;

DROP TABLE IF EXISTS evidence_custody_events;
DROP TABLE IF EXISTS document_pages;
DROP TABLE IF EXISTS document_versions;

DROP INDEX IF EXISTS idx_evidence_tenant_sha256;
DROP INDEX IF EXISTS idx_evidence_state;
DROP INDEX IF EXISTS idx_evidence_case_state;
DROP INDEX IF EXISTS idx_evidence_parent_version;
DROP INDEX IF EXISTS idx_evidence_retention;

ALTER TABLE evidence_documents
  DROP COLUMN IF EXISTS display_title,
  DROP COLUMN IF EXISTS file_type,
  DROP COLUMN IF EXISTS source_type,
  DROP COLUMN IF EXISTS source_uri,
  DROP COLUMN IF EXISTS source_agency,
  DROP COLUMN IF EXISTS document_date,
  DROP COLUMN IF EXISTS received_date,
  DROP COLUMN IF EXISTS classification,
  DROP COLUMN IF EXISTS classification_confidence,
  DROP COLUMN IF EXISTS privilege_designation,
  DROP COLUMN IF EXISTS redaction_status,
  DROP COLUMN IF EXISTS processing_status,
  DROP COLUMN IF EXISTS retention_status,
  DROP COLUMN IF EXISTS evidence_state,
  DROP COLUMN IF EXISTS duplicate_of,
  DROP COLUMN IF EXISTS version_type,
  DROP COLUMN IF EXISTS parent_version_id;

DROP TYPE IF EXISTS custody_action;
DROP TYPE IF EXISTS version_type;
DROP TYPE IF EXISTS retention_status;
DROP TYPE IF EXISTS processing_status;
DROP TYPE IF EXISTS redaction_status;
DROP TYPE IF EXISTS privilege_status;
DROP TYPE IF EXISTS confidentiality_level;
DROP TYPE IF EXISTS acquisition_method;
DROP TYPE IF EXISTS evidence_state;

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
