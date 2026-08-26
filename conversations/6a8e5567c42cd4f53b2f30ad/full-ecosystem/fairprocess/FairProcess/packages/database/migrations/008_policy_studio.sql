-- Policy Studio: versioned, data-driven procedural rules
--
-- Turns hardcoded per-case expectations into authored, versioned, reusable
-- rules that any case in the same jurisdiction can be evaluated against.

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE rule_category AS ENUM (
  'deadline',
  'notice_requirement',
  'documentation_requirement',
  'inspection_requirement',
  'other'
);

CREATE TYPE comparison_operator AS ENUM (
  'at_most',
  'at_least',
  'exactly',
  'before',
  'after'
);

CREATE TYPE threshold_unit AS ENUM (
  'calendar_days',
  'business_days'
);

CREATE TYPE rule_severity AS ENUM (
  'material_inconsistency',
  'procedural_risk',
  'documentation_gap'
);

CREATE TYPE rule_status AS ENUM (
  'draft',
  'in_review',
  'active',
  'superseded',
  'archived'
);

-- New audit actions for the tamper-evident chain
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'rule_created';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'rule_published';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'rule_superseded';
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'case_evaluated';

-- ============================================================
-- POLICY_RULES
-- ============================================================

CREATE TABLE policy_rules (
  id                    TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id             TEXT NOT NULL REFERENCES tenants(id),

  -- Identity and scope
  jurisdiction          TEXT NOT NULL,
  statute_reference     TEXT NOT NULL,
  enabling_authority    TEXT,  -- required before leaving draft; NULL = not yet cited

  -- Classification
  category              rule_category NOT NULL,
  plain_language_description TEXT NOT NULL,

  -- Comparison logic
  trigger_event         TEXT NOT NULL,
  comparison_event      TEXT NOT NULL,
  comparison_operator   comparison_operator NOT NULL,
  threshold_value       INTEGER NOT NULL,
  threshold_unit        threshold_unit NOT NULL,

  -- Severity
  severity_if_violated  rule_severity NOT NULL,

  -- Lifecycle
  status                rule_status NOT NULL DEFAULT 'draft',
  effective_start_date  DATE,
  effective_end_date    DATE,
  superseded_by         TEXT REFERENCES policy_rules(id),

  -- Authorship
  author                TEXT NOT NULL,
  reviewer              TEXT,

  -- Timestamps
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_modified_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- A rule cannot reach active without an enabling authority citation
  CONSTRAINT policy_rules_active_requires_authority
    CHECK (status <> 'active' OR (enabling_authority IS NOT NULL AND enabling_authority <> '')),

  -- Threshold is a positive integer
  CONSTRAINT policy_rules_positive_threshold
    CHECK (threshold_value > 0)
);

CREATE INDEX idx_policy_rules_jurisdiction ON policy_rules (jurisdiction);
CREATE INDEX idx_policy_rules_status ON policy_rules (status);
CREATE INDEX idx_policy_rules_category ON policy_rules (category);
CREATE INDEX idx_policy_rules_statute ON policy_rules (statute_reference);

-- ============================================================
-- RULE_CHANGELOG_ENTRIES (append-only)
-- ============================================================

CREATE TABLE rule_changelog_entries (
  id                      TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rule_id                 TEXT NOT NULL REFERENCES policy_rules(id) ON DELETE CASCADE,
  version_number          INTEGER NOT NULL,
  change_summary          TEXT NOT NULL,
  enabling_authority_citation TEXT NOT NULL,
  changed_by              TEXT NOT NULL,
  reviewed_by             TEXT,
  published_at            TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT rule_changelog_version_positive
    CHECK (version_number > 0)
);

CREATE INDEX idx_changelog_rule ON rule_changelog_entries (rule_id);
CREATE INDEX idx_changelog_published ON rule_changelog_entries (published_at DESC);

-- One changelog entry per rule per version
CREATE UNIQUE INDEX idx_changelog_rule_version
  ON rule_changelog_entries (rule_id, version_number);

-- ============================================================
-- RULE_EVALUATION_RESULTS
-- ============================================================

CREATE TABLE rule_evaluation_results (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_id          TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  rule_id          TEXT NOT NULL REFERENCES policy_rules(id),
  tenant_id        TEXT NOT NULL REFERENCES tenants(id),

  trigger_event_date   DATE,
  comparison_event_date DATE,
  days_between         INTEGER,
  threshold_value      INTEGER,
  threshold_unit       threshold_unit NOT NULL,
  comparison_operator  comparison_operator NOT NULL,

  compliant         BOOLEAN NOT NULL,
  violation_detail  TEXT,
  severity          rule_severity NOT NULL,

  evaluated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  evaluated_by      TEXT NOT NULL,

  CONSTRAINT rule_eval_unique_case_rule
    UNIQUE (case_id, rule_id)
);

CREATE INDEX idx_eval_results_case ON rule_evaluation_results (case_id);
CREATE INDEX idx_eval_results_rule ON rule_evaluation_results (rule_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update last_modified_at
CREATE OR REPLACE FUNCTION update_rule_modified_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_modified_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER policy_rules_update_modified
BEFORE UPDATE ON policy_rules
FOR EACH ROW
EXECUTE FUNCTION update_rule_modified_at();

-- Prevent changelog edits (append-only)
CREATE OR REPLACE FUNCTION prevent_changelog_edit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'rule_changelog_entries is append-only: no updates or deletes permitted'
    USING ERRCODE = '23001';
END;
$$;

CREATE TRIGGER rule_changelog_no_update
BEFORE UPDATE ON rule_changelog_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_changelog_edit();

CREATE TRIGGER rule_changelog_no_delete
BEFORE DELETE ON rule_changelog_entries
FOR EACH ROW
EXECUTE FUNCTION prevent_changelog_edit();
