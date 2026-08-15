/* ═══════════════════════════════════════════════════════════
   IN-MEMORY CASE REPOSITORY
   
   Default implementation for development, testing, and SSR.
   Cases are stored in a Map; audit entries in an array.
   No persistence across server restarts.
   
   For production, swap with the Supabase implementation.
   
   Provides both async (CaseRepository interface) and sync methods
   (for testing and synchronous call sites).
   ═══════════════════════════════════════════════════════════ */

import type { NoticeCase, CaseSummary } from "../domain/notice";
import { deserializeCase, serializeCase, toCaseSummary } from "../domain/notice";
import type { AuditEntry } from "../domain/audit";
import type { CaseRepository } from "../domain/case-repository";
import { RepositoryError, RepositoryErrorCode } from "../domain/case-repository";

export class InMemoryCaseRepository implements CaseRepository {
  private store = new Map<string, Record<string, unknown>>();
  private auditStore: AuditEntry[] = [];

  /* ── Sync methods (for tests and SSR) ── */

  saveSync(caseObj: NoticeCase): NoticeCase {
    const serialized = serializeCase(caseObj);
    this.store.set(caseObj.id, serialized);
    return caseObj;
  }

  loadSync(id: string): NoticeCase | null {
    const data = this.store.get(id);
    if (!data) return null;
    return deserializeCase(data);
  }

  deleteSync(id: string): boolean {
    return this.store.delete(id);
  }

  existsSync(id: string): boolean {
    return this.store.has(id);
  }

  listSummariesSync(ownerId?: string): CaseSummary[] {
    const summaries: CaseSummary[] = [];
    for (const data of this.store.values()) {
      if (ownerId && data.ownerId && data.ownerId !== ownerId) continue;
      try {
        const caseObj = deserializeCase(data);
        summaries.push(toCaseSummary(caseObj));
      } catch {
        // Skip corrupted entries
      }
    }
    summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return summaries;
  }

  listByStatusSync(status: string, ownerId?: string): CaseSummary[] {
    return this.listSummariesSync(ownerId).filter((s) => s.status === status);
  }

  saveAuditSync(entry: AuditEntry): void {
    this.auditStore.push(entry);
  }

  loadAuditSync(caseId: string): AuditEntry[] {
    return this.auditStore.filter((e) => e.caseId === caseId);
  }

  /* ── Async methods (CaseRepository interface) ── */

  async save(caseObj: NoticeCase): Promise<NoticeCase> {
    try {
      return this.saveSync(caseObj);
    } catch (err) {
      throw new RepositoryError(
        `Failed to save case ${caseObj.id}`,
        RepositoryErrorCode.SAVE_FAILED,
        err,
      );
    }
  }

  async load(id: string): Promise<NoticeCase | null> {
    try {
      return this.loadSync(id);
    } catch (err) {
      throw new RepositoryError(
        `Failed to load case ${id}`,
        RepositoryErrorCode.LOAD_FAILED,
        err,
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    return this.deleteSync(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.existsSync(id);
  }

  async listSummaries(ownerId?: string): Promise<CaseSummary[]> {
    return this.listSummariesSync(ownerId);
  }

  async listByStatus(status: string, ownerId?: string): Promise<CaseSummary[]> {
    return this.listByStatusSync(status, ownerId);
  }

  async saveAudit(entry: AuditEntry): Promise<void> {
    this.saveAuditSync(entry);
  }

  async loadAudit(caseId: string): Promise<AuditEntry[]> {
    return this.loadAuditSync(caseId);
  }

  /* ── Test helpers ── */

  clear(): void {
    this.store.clear();
    this.auditStore = [];
  }

  size(): number {
    return this.store.size;
  }
}

/* ── Singleton (used during dev/SSR before Supabase is wired) ── */

let singleton: InMemoryCaseRepository | null = null;

export function getInMemoryRepository(): InMemoryCaseRepository {
  if (!singleton) {
    singleton = new InMemoryCaseRepository();
  }
  return singleton;
}

export function resetInMemoryRepository(): void {
  if (singleton) {
    singleton.clear();
    singleton = null;
  }
}
