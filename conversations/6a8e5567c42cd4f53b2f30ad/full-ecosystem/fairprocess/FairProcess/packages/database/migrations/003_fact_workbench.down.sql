-- Rollback: Fact Verification Workbench

DROP VIEW IF EXISTS case_dashboard;

DROP TABLE IF EXISTS fact_contradictions;
DROP TABLE IF EXISTS fact_reviews;
DROP TABLE IF EXISTS fact_sources;

DROP INDEX IF EXISTS idx_facts_state;
DROP INDEX IF EXISTS idx_facts_controlling;
DROP INDEX IF EXISTS idx_facts_superseded;
DROP INDEX IF EXISTS idx_facts_tenant;

ALTER TABLE verified_facts
  DROP COLUMN IF EXISTS tenant_id,
  DROP COLUMN IF EXISTS fact_type,
  DROP COLUMN IF EXISTS proposed_value,
  DROP COLUMN IF EXISTS normalized_value,
  DROP COLUMN IF EXISTS current_value,
  DROP COLUMN IF EXISTS verification_state,
  DROP COLUMN IF EXISTS is_controlling,
  DROP COLUMN IF EXISTS superseded_by,
  DROP COLUMN IF EXISTS model_version,
  DROP COLUMN IF EXISTS prompt_version,
  DROP COLUMN IF EXISTS reviewer_note,
  DROP COLUMN IF EXISTS fact_type_key;

DROP TYPE IF EXISTS review_action;
DROP TYPE IF EXISTS fact_extraction_method;
DROP TYPE IF EXISTS fact_data_type;
DROP TYPE IF EXISTS fact_type;
DROP TYPE IF EXISTS fact_verification_state;

-- Recreate the v2 view with the same public column signature used by v3 so
-- migration 003 can be applied again after a rollback.
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
