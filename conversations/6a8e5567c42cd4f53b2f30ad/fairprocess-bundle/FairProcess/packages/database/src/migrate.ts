import { readFile, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { initializeAuditChains } from "./audit-log.js";
import { getDatabase } from "./index.js";

const MIGRATIONS_DIR = resolve(join(import.meta.dirname, "..", "migrations"));

async function runMigrations(down = false): Promise<void> {
  const db = getDatabase();
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((file) =>
      down
        ? file.endsWith(".down.sql")
        : file.endsWith(".sql") && !file.endsWith(".down.sql"),
    )
    .sort((a, b) => (down ? b.localeCompare(a) : a.localeCompare(b)));

  for (const file of files) {
    const version = file.replace(/\.down\.sql$|\.sql$/, "");
    const applied = await db.query(
      "SELECT version FROM schema_migrations WHERE version = $1",
      [version],
    );

    if (!down && applied.rows.length > 0) {
      console.log(`  ✓ ${version} (already applied)`);
      continue;
    }

    if (down && applied.rows.length === 0) {
      console.log(`  ✓ ${version} (not applied)`);
      continue;
    }

    const sql = await readFile(join(MIGRATIONS_DIR, file), "utf8");
    console.log(`  ${down ? "↩ Reverting" : "→ Applying"} ${file}`);

    await db.transaction(async (client) => {
      await client.query(sql);
      if (down) {
        await client.query("DELETE FROM schema_migrations WHERE version = $1", [version]);
      } else {
        await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
      }
    });

    console.log(`  ✓ ${version}`);
  }

  if (!down) {
    const initialized = await initializeAuditChains(db);
    if (initialized > 0) {
      console.log(`  ✓ initialized ${initialized} tenant audit chain(s)`);
    }
  }

  await db.end();
}

const args = process.argv.slice(2);
const statusOnly = args.includes("--status");
const downFlag = args.includes("--down");

if (statusOnly) {
  const db = getDatabase();
  try {
    const result = await db.query(
      "SELECT version, applied_at FROM schema_migrations ORDER BY version",
    );
    console.log("\nApplied migrations:");
    for (const row of result.rows) {
      console.log(`  ✓ ${row.version} (${row.applied_at})`);
    }
    if (result.rows.length === 0) {
      console.log("  (none)");
    }
  } catch {
    console.log("No migrations table yet.");
  }
  await db.end();
} else {
  runMigrations(downFlag).catch((error: unknown) => {
    console.error("Migration failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
