import { createHash } from "node:crypto";
import {
  mkdir,
  writeFile,
  readFile,
  stat,
  unlink,
} from "node:fs/promises";
import { join, dirname } from "node:path";

/**
 * Pluggable storage backend for evidence files. The vault stores original
 * files immutably — once written, a storage key is never overwritten or
 * deleted (except by the retention/deletion-under-policy workflow).
 *
 * Implementations:
 *  - FilesystemStorage: local filesystem (dev / single-node deployment)
 *  - S3Storage (future): S3-compatible object store with server-side encryption
 */
export interface StoredFile {
  storageKey: string;
  byteSize: number;
  sha256: string;
}

export interface StorageBackend {
  /**
   * Store a file. Must be idempotent on the content hash — storing the
   * same bytes twice should return the same storage key.
   */
  store(data: Buffer, tenantId: string): Promise<StoredFile>;

  /**
   * Retrieve a file's bytes by storage key.
   */
  retrieve(storageKey: string): Promise<Buffer>;

  /**
   * Check whether a storage key exists.
   */
  exists(storageKey: string): Promise<boolean>;

  /**
   * Delete a file. Only called during the deleted-under-policy workflow.
   * Must record an audit event before calling.
   */
  delete(storageKey: string): Promise<void>;
}

/**
 * Filesystem-based storage backend.
 *
 * Layout: <root>/<tenant>/<sha256[:2]>/<sha256[2:4]>/<sha256>
 *
 * The content-hash-based path makes the store naturally idempotent:
 * storing the same bytes always lands at the same key, which gives
 * us free deduplication at the storage layer.
 */
export class FilesystemStorage implements StorageBackend {
  constructor(private readonly rootDir: string) {}

  async store(data: Buffer, tenantId: string): Promise<StoredFile> {
    const sha256 = createHash("sha256").update(data).digest("hex");
    const storageKey = this.keyFor(tenantId, sha256);
    const fullPath = join(this.rootDir, storageKey);

    const exists = await this.safeStat(fullPath);
    if (!exists) {
      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, data, { mode: 0o644 });
    }

    return { storageKey, byteSize: data.byteLength, sha256 };
  }

  async retrieve(storageKey: string): Promise<Buffer> {
    const fullPath = join(this.rootDir, storageKey);
    return readFile(fullPath);
  }

  async exists(storageKey: string): Promise<boolean> {
    const fullPath = join(this.rootDir, storageKey);
    return this.safeStat(fullPath);
  }

  async delete(storageKey: string): Promise<void> {
    const fullPath = join(this.rootDir, storageKey);
    await unlink(fullPath);
  }

  private keyFor(tenantId: string, sha256: string): string {
    return join(tenantId, sha256.slice(0, 2), sha256.slice(2, 4), sha256);
  }

  private async safeStat(path: string): Promise<boolean> {
    try {
      await stat(path);
      return true;
    } catch {
      return false;
    }
  }
}
