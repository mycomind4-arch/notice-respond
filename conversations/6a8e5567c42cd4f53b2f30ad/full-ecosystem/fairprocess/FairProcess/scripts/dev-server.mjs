/**
 * FairProcess dev server — runs the full API stack using embedded
 * PostgreSQL (PGlite) and a dev-mode OIDC verifier.
 *
 * No external services required. Starts at http://localhost:3001.
 */
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createSign, randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const migrationsDir = resolve(repoRoot, "packages/database/migrations");

// ── SQL splitter (handles dollar-quoting, strings, comments) ───────────────

function splitSql(sql) {
  const statements = [];
  let current = "";
  let i = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag = null; // e.g. $$ or $foo$

  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1] ?? "";

    // Handle dollar-quoting (highest priority — can span lines/strings)
    if (dollarTag !== null) {
      current += ch;
      if (ch === "$") {
        // Check if the dollar tag closes here
        const tagEnd = sql.indexOf("$", i + 1);
        if (tagEnd !== -1) {
          const closingTag = sql.slice(i, tagEnd + 1);
          if (closingTag === dollarTag) {
            current += sql.slice(i + 1, tagEnd + 1);
            i = tagEnd + 1;
            dollarTag = null;
            continue;
          }
        }
      }
      i++;
      continue;
    }

    // Check for dollar-quote start
    if (!inSingle && !inDouble && !inLineComment && !inBlockComment && ch === "$") {
      const tagEnd = sql.indexOf("$", i + 1);
      if (tagEnd !== -1 && tagEnd - i < 50) {
        const tag = sql.slice(i, tagEnd + 1);
        // Only treat as dollar-quote if the tag looks valid
        if (/^\$[A-Za-z_0-9]*\$$/.test(tag)) {
          dollarTag = tag;
          current += tag;
          i = tagEnd + 1;
          continue;
        }
      }
    }

    // Handle line comments
    if (inLineComment) {
      current += ch;
      if (ch === "\n") inLineComment = false;
      i++;
      continue;
    }

    // Handle block comments
    if (inBlockComment) {
      current += ch;
      if (ch === "*" && next === "/") {
        current += next;
        i += 2;
        inBlockComment = false;
        continue;
      }
      i++;
      continue;
    }

    // Detect comment starts
    if (!inSingle && !inDouble) {
      if (ch === "-" && next === "-") {
        inLineComment = true;
        current += ch;
        i++;
        continue;
      }
      if (ch === "/" && next === "*") {
        inBlockComment = true;
        current += ch;
        i++;
        continue;
      }
    }

    // Handle string literals
    if (inSingle) {
      current += ch;
      if (ch === "'" && sql[i + 1] !== "'") inSingle = false;
      else if (ch === "'" && sql[i + 1] === "'") {
        current += "'";
        i++; // skip escaped quote
      }
      i++;
      continue;
    }

    if (inDouble) {
      current += ch;
      if (ch === '"') inDouble = false;
      i++;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      current += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inDouble = true;
      current += ch;
      i++;
      continue;
    }

    // Statement separator
    if (ch === ";") {
      current += ch;
      const trimmed = current.trim();
      const stripped = trimmed.replace(/^(--[^\n]*\n\s*)+/, "").trim();
      if (stripped) {
        statements.push(trimmed);
      }
      current = "";
      i++;
      continue;
    }

    current += ch;
    i++;
  }

  // Last statement (if no trailing semicolon)
  const trimmed = current.trim();
  const stripped = trimmed.replace(/^(--[^\n]*\n\s*)+/, "").trim();
  if (stripped) {
    statements.push(trimmed);
  }

  return statements;
}

// ── PGlite → pg.Pool adapter ───────────────────────────────────────────────

function createPgAdapter(pglite) {
  function adaptResult(result) {
    return {
      rows: result.rows ?? [],
      rowCount: result.affectedRows ?? result.rows?.length ?? 0,
      command: result.command?.toUpperCase() ?? "",
      oid: 0,
      fields: result.fields ?? [],
    };
  }

  const poolClient = {
    async query(text, params) {
      const result = await pglite.query(text, params ?? []);
      return adaptResult(result);
    },
    release() {
      // no-op — single shared instance
    },
  };

  return {
    async query(text, params) {
      const result = await pglite.query(text, params ?? []);
      return adaptResult(result);
    },
    async connect() {
      return poolClient;
    },
    async end() {
      await pglite.close();
    },
  };
}

// ── Dev OIDC verifier ──────────────────────────────────────────────────────

const DEV_ISSUER = "https://dev.fairprocess.local";
const DEV_AUDIENCE = "fairprocess-api";

const { privateKey } = await import("node:crypto").then((c) =>
  c.generateKeyPairSync("rsa", { modulusLength: 2048 }),
);

function base64url(input) {
  return Buffer.from(input).toString("base64url");
}

function makeDevToken(subject, email, name) {
  const header = { alg: "RS256", kid: "dev-key", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: DEV_ISSUER,
    sub: subject,
    aud: DEV_AUDIENCE,
    exp: now + 86400,
    iat: now,
    email: email ?? "admin@dev.fairprocess.local",
    name: name ?? "Dev Admin",
  };

  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const sign = createSign("RSA-SHA256");
  sign.update(signingInput);
  const signature = sign.sign(privateKey);
  return `${signingInput}.${base64url(signature)}`;
}

function createDevTokenVerifier() {
  return {
    async verify(token) {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("malformed_token");
      const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
      if (payload.iss !== DEV_ISSUER) throw new Error("invalid_issuer");
      if (!payload.aud?.includes?.(DEV_AUDIENCE) && payload.aud !== DEV_AUDIENCE) {
        throw new Error("invalid_audience");
      }
      return {
        issuer: payload.iss,
        subject: payload.sub,
        audiences: Array.isArray(payload.aud) ? payload.aud : [payload.aud],
        expiresAt: payload.exp,
        email: payload.email,
        name: payload.name,
      };
    },
  };
}

// ── Run migrations ─────────────────────────────────────────────────────────

async function runMigrations(db) {
  await db.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  );

  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql") && !f.endsWith(".down.sql"))
    .sort();

  for (const file of files) {
    const version = file.replace(/\.sql$/, "");
    const applied = await db.query(
      "SELECT version FROM schema_migrations WHERE version = $1",
      [version],
    );
    if (applied.rows.length > 0) {
      console.log(`  ✓ ${version} (already applied)`);
      continue;
    }
    const sql = await readFile(join(migrationsDir, file), "utf8");
    const statements = splitSql(sql);
    console.log(`  → Applying ${file} (${statements.length} statements)`);
    for (const stmt of statements) {
      await db.query(stmt);
    }
    await db.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
    console.log(`  ✓ ${version}`);
  }
}

// ── Seed demo data ──────────────────────────────────────────────────────────

async function seedDemoData(db) {
  const existing = await db.query("SELECT id FROM tenants WHERE id = $1", ["tenant-1"]);
  if (existing.rows.length > 0) {
    console.log("  ✓ demo data already seeded");
    return null;
  }

  await db.query(
    `INSERT INTO tenants (id, name, kind) VALUES ($1, $2, $3)`,
    ["tenant-1", "Demo Tenant", "advocate"],
  );
  console.log("  ✓ created tenant-1");

  const devSubject = randomUUID();
  await db.query(
    `INSERT INTO users (id, tenant_id, oidc_issuer, oidc_subject, email, display_name)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [randomUUID(), "tenant-1", DEV_ISSUER, devSubject, "admin@dev.fairprocess.local", "Dev Admin"],
  );
  console.log("  ✓ created admin user");

  await db.query(
    `INSERT INTO user_roles (tenant_id, user_id, role_id)
     SELECT 'tenant-1', u.id, r.id
     FROM users u, roles r
     WHERE u.oidc_subject = $1 AND r.tenant_id = 'tenant-1' AND r.name = 'tenant_administrator'`,
    [devSubject],
  );
  console.log("  ✓ assigned tenant_administrator role");

  try {
    const policyPath = resolve(repoRoot, "policies/humboldt/hcc-352.recordation.json");
    const policyJson = await readFile(policyPath, "utf8");
    const policy = JSON.parse(policyJson);
    await db.query(
      `INSERT INTO policy_bundles (id, jurisdiction, policy_version, activation_status, rules, activated_at, activated_by)
       VALUES ($1, $2, $3, 'active', $4::jsonb, now(), 'system')
       ON CONFLICT (jurisdiction, policy_version) DO NOTHING`,
      [
        randomUUID(),
        policy.jurisdiction ?? "Humboldt County, California",
        policy.policyVersion ?? "1.0.0",
        JSON.stringify(policy.rules ?? policy),
      ],
    );
    console.log("  ✓ seeded Humboldt HCC-352 policy bundle");
  } catch (err) {
    console.log(`  ⚠ could not seed policy: ${err.message}`);
  }

  return devSubject;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n🔍 FairProcess dev server starting...\n");

  console.log("📦 Initializing embedded PostgreSQL (PGlite)...");
  const pglite = new PGlite();
  const pgAdapter = createPgAdapter(pglite);

  const dbModule = await import(resolve(repoRoot, "packages/database/dist/index.js"));
  const auditModule = await import(resolve(repoRoot, "packages/database/dist/audit-log.js"));

  const db = new dbModule.Database();
  db.pool = pgAdapter;

  console.log("\n📋 Running migrations...");
  await runMigrations(pgAdapter);

  console.log("\n🌱 Seeding demo data...");
  const devSubject = await seedDemoData(pgAdapter);

  dbModule.setDatabase(db);
  await auditModule.initializeAuditChains(db);
  console.log("  ✓ audit chains initialized");

  const devToken = makeDevToken(devSubject ?? "dev-admin", "admin@dev.fairprocess.local", "Dev Admin");
  console.log("\n🔑 Dev access token:");
  console.log(`   ${devToken}\n`);

  console.log("🚀 Starting API server...");
  const { buildApp } = await import(resolve(repoRoot, "packages/api-server/dist/app.js"));

  const tokenVerifier = createDevTokenVerifier();
  const app = await buildApp({
    database: db,
    tokenVerifier,
    corsOrigins: ["*"],
    policyGovernanceTenantId: "tenant-1",
    logger: false,
  });

  // Serve the web frontend
  const webDistDir = resolve(repoRoot, "apps/web/dist");
  app.get("/", async (_req, reply) => {
    const html = await readFile(join(webDistDir, "index.html"), "utf8");
    reply.type("text/html").send(html);
  });
  app.get("/live.html", async (_req, reply) => {
    const html = await readFile(join(webDistDir, "live.html"), "utf8");
    reply.type("text/html").send(html);
  });
  app.get("/live.js", async (_req, reply) => {
    const js = await readFile(join(webDistDir, "live.js"), "utf8");
    reply.type("application/javascript").send(js);
  });
  app.get("/live.css", async (_req, reply) => {
    const css = await readFile(join(webDistDir, "live.css"), "utf8");
    reply.type("text/css").send(css);
  });

  await app.listen({ port: 3001, host: "0.0.0.0" });
  console.log("\n✅ FairProcess is running!");
  console.log("   Web UI:          http://localhost:3001/");
  console.log("   Live workspace:  http://localhost:3001/live.html");
  console.log("   API health:      http://localhost:3001/health");
  console.log("   API docs:        http://localhost:3001/api");
  console.log("\n   Dev token (paste in live workspace):");
  console.log(`   ${devToken}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
