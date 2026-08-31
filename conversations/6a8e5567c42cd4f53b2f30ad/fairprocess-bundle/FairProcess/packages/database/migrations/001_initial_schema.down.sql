-- Rollback FairProcess Database Schema v1
-- Drops all tables and types in reverse dependency order

DROP VIEW IF EXISTS case_dashboard;
DROP TRIGGER IF EXISTS cases_updated_at ON cases;
DROP TRIGGER IF EXISTS public_records_requests_updated_at ON public_records_requests;
DROP FUNCTION IF EXISTS update_updated_at();

DROP TABLE IF EXISTS audit_events;
DROP TABLE IF EXISTS correspondence;
DROP TABLE IF EXISTS public_records_requests;
DROP TABLE IF EXISTS integrity_reports;
DROP TABLE IF EXISTS instrument_expectations;
DROP TABLE IF EXISTS policy_bundles;
DROP TABLE IF EXISTS recorder_searches;
DROP TABLE IF EXISTS recorder_instruments;
DROP TABLE IF EXISTS verified_facts;
DROP TABLE IF EXISTS evidence_documents;
DROP TABLE IF EXISTS case_apns;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS tenants;

DROP TYPE IF EXISTS audit_action;
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS public_records_status;
DROP TYPE IF EXISTS extraction_method;
DROP TYPE IF EXISTS recorder_search_scope;
DROP TYPE IF EXISTS recordation_status;
DROP TYPE IF EXISTS trigger_field;
DROP TYPE IF EXISTS instrument_kind;
