-- PostgreSQL enum values cannot be removed safely in place.
-- Rolling back this migration only removes its schema_migrations entry; the
-- policy_created value remains available and the subsequent up migration is
-- idempotent through ADD VALUE IF NOT EXISTS.
SELECT 1;
