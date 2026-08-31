-- Tamper-evident audit chain v2
--
-- Legacy rows remain unchanged and are labeled chain_version = 1.
-- New application events use chain_version = 2 and include every persisted
-- evidentiary field in a canonical, independently recomputable SHA-256 hash.

ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'audit_chain_initialized';

ALTER TABLE audit_events
  ADD COLUMN chain_version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN sequence_number BIGINT,
  ADD COLUMN occurred_at TIMESTAMPTZ,
  ADD COLUMN canonicalization_version TEXT;

ALTER TABLE audit_events
  ADD CONSTRAINT audit_events_supported_chain_version
    CHECK (chain_version IN (1, 2)),
  ADD CONSTRAINT audit_events_v2_required_fields
    CHECK (
      chain_version <> 2 OR (
        sequence_number IS NOT NULL AND
        sequence_number > 0 AND
        occurred_at IS NOT NULL AND
        canonicalization_version IS NOT NULL AND
        event_hash ~ '^[0-9a-f]{64}$' AND
        (prior_event_hash IS NULL OR prior_event_hash ~ '^[0-9a-f]{64}$')
      )
    );

CREATE UNIQUE INDEX audit_events_tenant_v2_sequence_uq
  ON audit_events (tenant_id, sequence_number)
  WHERE chain_version = 2;

CREATE UNIQUE INDEX audit_events_tenant_v2_hash_uq
  ON audit_events (tenant_id, event_hash)
  WHERE chain_version = 2;

CREATE INDEX audit_events_tenant_v2_order_idx
  ON audit_events (tenant_id, sequence_number)
  WHERE chain_version = 2;

CREATE OR REPLACE FUNCTION reject_audit_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only; updates and deletes are prohibited'
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER audit_events_append_only
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW
EXECUTE FUNCTION reject_audit_event_mutation();
