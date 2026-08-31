-- Distinguish policy draft creation from governed activation.
ALTER TYPE audit_action ADD VALUE IF NOT EXISTS 'policy_created';
