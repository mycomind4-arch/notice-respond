# FairProcess Authentication Setup

FairProcess uses **Auth0** as its identity provider (free tier works fine).
The Fastify API server validates RS256 JWTs issued by Auth0 via OIDC discovery.

## Step 1 — Create a free Auth0 account

1. Go to https://auth0.com and sign up (free tier covers up to 7,500 active users)
2. Create a new **Tenant** — name it `fairprocess` or similar
3. Note your **Auth0 Domain**: `YOUR_TENANT.auth0.com`

## Step 2 — Create an Application (for the web UI)

1. In Auth0 → Applications → Create Application
2. Name: `FairProcess Web`
3. Type: **Single Page Application**
4. Settings tab:
   - **Allowed Callback URLs**: `https://mycomind4-arch.github.io/FairProcess/`
   - **Allowed Logout URLs**: `https://mycomind4-arch.github.io/FairProcess/`
   - **Allowed Web Origins**: `https://mycomind4-arch.github.io`
5. Save. Note the **Client ID**.

## Step 3 — Create an API (for the Fastify backend)

1. In Auth0 → APIs → Create API
2. Name: `FairProcess API`
3. Identifier (audience): `https://api.fairprocess.app`
4. Signing algorithm: **RS256**
5. Save.

## Step 4 — Create your first user

1. In Auth0 → User Management → Users → Create User
2. Enter your email + password
3. Connection: `Username-Password-Authentication`
4. Save. **This is your FairProcess login.**

## Step 5 — Configure the web UI

Edit `apps/web/public/index.html`, find this block near the top of the `<script>` section:

```js
const AUTH0_DOMAIN    = window.FP_AUTH0_DOMAIN    || 'YOUR_AUTH0_DOMAIN.auth0.com';
const AUTH0_CLIENT_ID = window.FP_AUTH0_CLIENT_ID || 'YOUR_AUTH0_CLIENT_ID';
const AUTH0_AUDIENCE  = window.FP_AUTH0_AUDIENCE  || 'https://api.fairprocess.app';
```

Replace with your actual values:

```js
const AUTH0_DOMAIN    = window.FP_AUTH0_DOMAIN    || 'yourname.auth0.com';
const AUTH0_CLIENT_ID = window.FP_AUTH0_CLIENT_ID || 'abc123yourClientId';
const AUTH0_AUDIENCE  = window.FP_AUTH0_AUDIENCE  || 'https://api.fairprocess.app';
```

Push the updated file — GitHub Pages will redeploy in ~1 minute.

## Step 6 — Configure the Fastify API server

Set these environment variables before starting the API:

```bash
OIDC_ISSUER=https://YOUR_TENANT.auth0.com/
OIDC_AUDIENCE=https://api.fairprocess.app
DATABASE_URL=postgresql://user:pass@host/fairprocess
POLICY_GOVERNANCE_TENANT_ID=your-tenant-uuid   # optional
```

## Step 7 — Provision the user in the database

After your first Auth0 login, the API will reject with `user_not_provisioned`.
Run this SQL to create the user record (replace values with your Auth0 user info):

```sql
-- Create tenant
INSERT INTO tenants (id, name, type, status)
VALUES (gen_random_uuid(), 'FairProcess Primary', 'analyst', 'active')
RETURNING id;  -- note this UUID

-- Create analyst role
INSERT INTO roles (id, tenant_id, name, permissions)
VALUES (
  gen_random_uuid(),
  '<tenant_id>',
  'analyst',
  ARRAY['case:read','case:write','evidence:write','audit:run','audit:read',
        'report:read','report:authorize','records:read','records:write','policy:read']
);

-- Create user (oidc_issuer = your Auth0 domain URL, oidc_subject = Auth0 user ID)
INSERT INTO users (id, tenant_id, oidc_issuer, oidc_subject, email, display_name, status)
VALUES (
  gen_random_uuid(),
  '<tenant_id>',
  'https://YOUR_TENANT.auth0.com/',
  'auth0|YOUR_AUTH0_USER_ID',   -- find in Auth0 → Users → user_id field
  'your@email.com',
  'Your Name',
  'active'
);

-- Assign role
INSERT INTO user_roles (user_id, role_id, tenant_id)
VALUES ('<user_id>', '<role_id>', '<tenant_id>');
```

## Current State (until API is deployed)

The web UI runs in **demo mode** when Auth0 is not yet configured —
the login button lets you in without credentials so you can explore all screens.
Once you set your Auth0 domain + client ID in the HTML, it switches to real authentication.

## Roles

| Role | Permissions |
|------|-------------|
| `analyst` | Read/write cases, upload evidence, run audits, read reports |
| `attorney_reviewer` | All analyst permissions + authorize and publish reports |
| `policy_editor` | Read/write policies (governance tenant only) |
| `auditor` | Read-only access to all cases + audit trail |
| `admin` | All permissions (`*`) |

