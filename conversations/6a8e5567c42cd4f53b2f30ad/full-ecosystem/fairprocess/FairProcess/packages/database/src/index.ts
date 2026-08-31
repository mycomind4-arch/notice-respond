import { AsyncLocalStorage } from "node:async_hooks";
import pg from "pg";

const { Pool } = pg;

export type DatabaseConfig = {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
};

export class Database {
  private pool: pg.Pool;
  private readonly transactionContext = new AsyncLocalStorage<pg.PoolClient>();

  constructor(config?: DatabaseConfig) {
    const connectionString =
      config?.connectionString ?? process.env.DATABASE_URL;
    this.pool = new Pool(
      connectionString
        ? { connectionString, ssl: config?.ssl ?? false }
        : {
            host: config?.host ?? process.env.DB_HOST ?? "localhost",
            port: config?.port ?? Number(process.env.DB_PORT) ?? 5432,
            database: config?.database ?? process.env.DB_NAME ?? "fairprocess",
            user: config?.user ?? process.env.DB_USER ?? "postgres",
            password: config?.password ?? process.env.DB_PASSWORD ?? "",
            ssl: config?.ssl ?? false,
          },
    );
  }

  async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<pg.QueryResult<T>> {
    const client = this.transactionContext.getStore();
    const executor = client ?? this.pool;
    return executor.query<T>(text, params as pg.QueryConfig["values"]);
  }

  async transaction<T>(
    fn: (client: pg.PoolClient) => Promise<T>,
  ): Promise<T> {
    const activeClient = this.transactionContext.getStore();
    if (activeClient) {
      // Nested transactions share the outer transaction. Errors propagate to the
      // outer boundary, which performs the single rollback or commit.
      return fn(activeClient);
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await this.transactionContext.run(client, () => fn(client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async end(): Promise<void> {
    await this.pool.end();
  }
}

let db: Database | null = null;

export function getDatabase(config?: DatabaseConfig): Database {
  if (!db) {
    db = new Database(config);
  }
  return db;
}

export function setDatabase(database: Database): void {
  db = database;
}

export {
  AUDIT_CANONICALIZATION_VERSION,
  AUDIT_CHAIN_VERSION,
  canonicalizeAuditPayload,
  hashAuditPayload,
} from "./audit-canonical.js";
export type { CanonicalAuditPayload } from "./audit-canonical.js";
export {
  initializeAuditChains,
  recordAuditEvent,
  verifyAuditChain,
} from "./audit-log.js";
export type {
  AuditChainStatus,
  AuditChainVerification,
  AuditEventInput,
} from "./audit-log.js";
