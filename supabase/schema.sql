-- ═══════════════════════════════════════════════════════════
-- NOTICE RESPOND — Database Schema with Row Level Security
--
-- Creates the cases and audit_entries tables for the Supabase
-- case repository. Each case is stored as a single JSONB document
-- with extracted summary columns for fast querying.
--
-- ROW LEVEL SECURITY:
-- Both tables enforce RLS based on owner_id (cases) and the
-- case's owner_id (audit_entries). Users can only access their
-- own data — cross-user access is denied at the database level.
-- ═══════════════════════════════════════════════════════════

-- ── Cases table ──

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY,
  owner_id TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS cases_owner_status_idx ON cases(owner_id, status);
CREATE INDEX IF NOT EXISTS cases_updated_at_idx ON cases(updated_at DESC);

-- ── Audit entries table (immutable append-only log) ──

CREATE TABLE IF NOT EXISTS audit_entries (
  id UUID PRIMARY KEY,
  case_id TEXT,
  owner_id TEXT NOT NULL DEFAULT '',
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
CREATE INDEX IF NOT EXISTS audit_entries_owner_id_idx ON audit_entries(owner_id);
CREATE INDEX IF NOT EXISTS audit_entries_action_idx ON audit_entries(action);

-- ── Row Level Security ──

-- Enable RLS on both tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_entries ENABLE ROW LEVEL SECURITY;

-- Cases: users can only see/modify their own cases
CREATE POLICY cases_select_own ON cases
  FOR SELECT USING (auth.uid()::text = owner_id);

CREATE POLICY cases_insert_own ON cases
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY cases_update_own ON cases
  FOR UPDATE USING (auth.uid()::text = owner_id)
  WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY cases_delete_own ON cases
  FOR DELETE USING (auth.uid()::text = owner_id);

-- Audit entries: users can only see/insert their own audit entries
CREATE POLICY audit_select_own ON audit_entries
  FOR SELECT USING (auth.uid()::text = owner_id);

CREATE POLICY audit_insert_own ON audit_entries
  FOR INSERT WITH CHECK (auth.uid()::text = owner_id);

-- Audit entries are immutable — NO UPDATE or DELETE policies.
-- This enforces audit immutability at the database level.

-- ── Updated_at trigger for cases ──

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

-- ── Prevent owner_id from being changed on update ──

CREATE OR REPLACE FUNCTION prevent_owner_change()
RETURNS TRIGGER AS $$
BEGIN
  -- owner_id must never change after insert — prevents privilege escalation
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Cannot change owner_id after case creation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cases_prevent_owner_change ON cases;
CREATE TRIGGER cases_prevent_owner_change
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION prevent_owner_change();
