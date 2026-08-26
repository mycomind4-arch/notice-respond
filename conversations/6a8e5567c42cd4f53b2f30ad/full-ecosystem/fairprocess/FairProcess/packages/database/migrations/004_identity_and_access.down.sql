-- Rollback production identity and role-based access control

DROP TRIGGER IF EXISTS tenants_seed_default_roles ON tenants;
DROP FUNCTION IF EXISTS seed_fairprocess_roles_after_tenant_insert();
DROP FUNCTION IF EXISTS seed_fairprocess_default_roles(TEXT);

DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS users;
