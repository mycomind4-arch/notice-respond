-- ═══════════════════════════════════════════════════════════
-- NOTICE RESPOND — Database Schema
--
-- Creates the cases and audit_entries tables for the Supabase
-- case repository. Each case is stored as a single JSONB document
-- with extracted summary columns for fast querying.
-- ═══════════════════════════════════════════════════════════

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY,
  owner_id TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'intake',
  notice_type TEXT DEFAULT 'other',
  agency TEXT,
  reference_number TEXT,
  notice_date TEXT,
  readiness_score INTEGER DEFAULT 0,
  health_status TEXT DEFAULT 'incomplete',
  deadline_date TEXT,
  has_draft BOOLEAN DEFAULT false,
  has_mailing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  data JSONB NOT NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS cases_owner_id_idx ON cases(owner_id);
CREATE INDEX IF NOT EXISTS cases_status_idx ON cases(status);
CREATE INDEX IF NOT EXISTS cases_updated_at_idx ON cases(updated_at DESC);

-- Audit entries table
CREATE TABLE IF NOT EXISTS audit_entries (
  id UUID PRIMARY KEY,
  case_id TEXT,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  object_type TEXT,
  description TEXT,
  result TEXT DEFAULT 'success',
  is_security_event BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT now(),
  data JSONB
);

CREATE INDEX IF NOT EXISTS audit_entries_case_id_idx ON audit_entries(case_id);
CREATE INDEX IF NOT EXISTS audit_entries_action_idx ON audit_entries(action);

-- Updated_at trigger for cases
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cases_updated_at ON cases;
CREATE TRIGGER cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
