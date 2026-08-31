DROP TRIGGER IF EXISTS integrity_reports_require_active_policy ON integrity_reports;
DROP FUNCTION IF EXISTS require_active_report_policy();
DROP INDEX IF EXISTS policy_bundles_one_active_per_jurisdiction;
