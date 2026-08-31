-- Roll back tamper-evident audit chain v2.
--
-- The audit_chain_initialized enum value remains because PostgreSQL enum values
-- cannot be removed safely in place. All v2 rows are removed because the v1
-- schema cannot represent their sequence, timestamp, or canonicalization data.
-- Preserved legacy v1 rows remain untouched.

DROP TRIGGER IF EXISTS audit_events_append_only ON audit_events;
DROP FUNCTION IF EXISTS reject_audit_event_mutation();

DELETE FROM audit_events WHERE chain_version = 2;

DROP INDEX IF EXISTS audit_events_tenant_v2_order_idx;
DROP INDEX IF EXISTS audit_events_tenant_v2_hash_uq;
DROP INDEX IF EXISTS audit_events_tenant_v2_sequence_uq;

ALTER TABLE audit_events
  DROP CONSTRAINT IF EXISTS audit_events_v2_required_fields,
  DROP CONSTRAINT IF EXISTS audit_events_supported_chain_version,
  DROP COLUMN IF EXISTS canonicalization_version,
  DROP COLUMN IF EXISTS occurred_at,
  DROP COLUMN IF EXISTS sequence_number,
  DROP COLUMN IF EXISTS chain_version;
