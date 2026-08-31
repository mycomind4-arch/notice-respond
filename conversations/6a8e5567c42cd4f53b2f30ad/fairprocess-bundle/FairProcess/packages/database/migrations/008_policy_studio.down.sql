-- Down migration for Policy Studio
-- Removes tables and enum types in reverse dependency order

DROP TABLE IF EXISTS rule_evaluation_results CASCADE;
DROP TABLE IF EXISTS rule_changelog_entries CASCADE;
DROP TABLE IF EXISTS policy_rules CASCADE;

DROP FUNCTION IF EXISTS prevent_changelog_edit() CASCADE;
DROP FUNCTION IF EXISTS update_rule_modified_at() CASCADE;

DROP TYPE IF EXISTS rule_status CASCADE;
DROP TYPE IF EXISTS rule_severity CASCADE;
DROP TYPE IF EXISTS threshold_unit CASCADE;
DROP TYPE IF EXISTS comparison_operator CASCADE;
DROP TYPE IF EXISTS rule_category CASCADE;

-- Note: audit_action values cannot be removed (ALTER TYPE ... DROP VALUE is not supported)
