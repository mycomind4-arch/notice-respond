-- Production identity, tenant membership, and role-based access control

CREATE TABLE users (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id       TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  oidc_issuer     TEXT NOT NULL,
  oidc_subject    TEXT NOT NULL,
  email           TEXT,
  display_name    TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ,
  UNIQUE (oidc_issuer, oidc_subject),
  UNIQUE (id, tenant_id)
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

CREATE TABLE roles (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, name),
  UNIQUE (id, tenant_id)
);

CREATE INDEX idx_roles_tenant ON roles(tenant_id);

CREATE TABLE user_roles (
  tenant_id   TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL,
  role_id     TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id, tenant_id) REFERENCES users(id, tenant_id) ON DELETE CASCADE,
  FOREIGN KEY (role_id, tenant_id) REFERENCES roles(id, tenant_id) ON DELETE CASCADE
);

CREATE INDEX idx_user_roles_tenant ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);

CREATE FUNCTION seed_fairprocess_default_roles(target_tenant_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO roles (tenant_id, name, permissions)
  VALUES
    (target_tenant_id, 'resident', ARRAY[
      'case:read', 'case:write', 'evidence:read', 'evidence:write',
      'fact:read', 'fact:review', 'audit:read', 'audit:run',
      'report:read', 'records:read', 'records:write'
    ]),
    (target_tenant_id, 'case_contributor', ARRAY[
      'case:read', 'case:write', 'evidence:read', 'evidence:write',
      'fact:read', 'fact:review', 'audit:read', 'report:read',
      'records:read', 'records:write', 'correspondence:write'
    ]),
    (target_tenant_id, 'analyst', ARRAY[
      'case:read', 'case:write', 'evidence:read', 'evidence:write',
      'fact:read', 'fact:review', 'audit:read', 'audit:run',
      'report:read', 'records:read', 'records:write',
      'correspondence:write', 'policy:read'
    ]),
    (target_tenant_id, 'advocate', ARRAY[
      'case:read', 'case:write', 'evidence:read', 'evidence:write',
      'fact:read', 'fact:review', 'audit:read', 'audit:run',
      'report:read', 'records:read', 'records:write',
      'correspondence:write'
    ]),
    (target_tenant_id, 'attorney_reviewer', ARRAY[
      'case:read', 'evidence:read', 'fact:read', 'fact:review',
      'audit:read', 'audit:run', 'report:read', 'report:authorize',
      'report:publish', 'records:read', 'records:write',
      'correspondence:write', 'correspondence:authorize', 'policy:read'
    ]),
    (target_tenant_id, 'auditor', ARRAY[
      'case:read', 'evidence:read', 'fact:read', 'audit:read',
      'audit:run', 'report:read', 'records:read', 'policy:read'
    ]),
    (target_tenant_id, 'agency_reviewer', ARRAY[
      'case:read', 'case:write', 'evidence:read', 'evidence:write',
      'fact:read', 'fact:review', 'audit:read', 'audit:run',
      'report:read', 'report:authorize', 'records:read', 'records:write',
      'correspondence:write', 'correspondence:authorize', 'policy:read'
    ]),
    (target_tenant_id, 'policy_editor', ARRAY['policy:read', 'policy:write']),
    (target_tenant_id, 'policy_approver', ARRAY['policy:read', 'policy:activate']),
    (target_tenant_id, 'tenant_administrator', ARRAY['*']),
    (target_tenant_id, 'system_administrator', ARRAY['*']),
    (target_tenant_id, 'read_only_observer', ARRAY[
      'case:read', 'evidence:read', 'fact:read', 'audit:read',
      'report:read', 'records:read', 'policy:read'
    ])
  ON CONFLICT (tenant_id, name) DO NOTHING;
END;
$$;

CREATE FUNCTION seed_fairprocess_roles_after_tenant_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM seed_fairprocess_default_roles(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tenants_seed_default_roles
AFTER INSERT ON tenants
FOR EACH ROW
EXECUTE FUNCTION seed_fairprocess_roles_after_tenant_insert();

SELECT seed_fairprocess_default_roles(id) FROM tenants;
