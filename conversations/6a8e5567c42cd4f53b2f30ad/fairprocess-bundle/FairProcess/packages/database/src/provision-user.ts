import { Database } from "./index.js";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main(): Promise<void> {
  const tenantId = required("TENANT_ID");
  const issuer = required("OIDC_ISSUER");
  const subject = required("OIDC_SUBJECT");
  const roleNames = required("ROLE_NAMES")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const email = process.env.USER_EMAIL?.trim() || null;
  const displayName = process.env.USER_DISPLAY_NAME?.trim() || null;

  const database = new Database();
  try {
    const userId = await database.transaction(async (client) => {
      const tenant = await client.query("SELECT 1 FROM tenants WHERE id = $1", [tenantId]);
      if (tenant.rows.length === 0) throw new Error(`Tenant not found: ${tenantId}`);

      const user = await client.query<{ id: string }>(
        `INSERT INTO users (
           tenant_id, oidc_issuer, oidc_subject, email, display_name, status
         )
         VALUES ($1, $2, $3, $4, $5, 'active')
         ON CONFLICT (oidc_issuer, oidc_subject)
         DO UPDATE SET
           email = EXCLUDED.email,
           display_name = EXCLUDED.display_name,
           status = 'active'
         WHERE users.tenant_id = EXCLUDED.tenant_id
         RETURNING id`,
        [tenantId, issuer, subject, email, displayName],
      );
      if (user.rows.length === 0) {
        throw new Error("The OIDC identity is already assigned to a different tenant");
      }

      const roles = await client.query<{ id: string; name: string }>(
        "SELECT id, name FROM roles WHERE tenant_id = $1 AND name = ANY($2::TEXT[])",
        [tenantId, roleNames],
      );
      const located = new Set(roles.rows.map((role) => role.name));
      const missing = roleNames.filter((name) => !located.has(name));
      if (missing.length > 0) {
        throw new Error(`Unknown tenant roles: ${missing.join(", ")}`);
      }

      const id = user.rows[0]!.id;
      await client.query("DELETE FROM user_roles WHERE tenant_id = $1 AND user_id = $2", [tenantId, id]);
      for (const role of roles.rows) {
        await client.query(
          "INSERT INTO user_roles (tenant_id, user_id, role_id) VALUES ($1, $2, $3)",
          [tenantId, id, role.id],
        );
      }
      return id;
    });

    console.log(
      JSON.stringify(
        {
          userId,
          tenantId,
          issuer,
          subject,
          roles: roleNames,
        },
        null,
        2,
      ),
    );
  } finally {
    await database.end();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
