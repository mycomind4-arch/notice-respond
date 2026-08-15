/* ═══════════════════════════════════════════════════════════
   CASE REPOSITORY — persistence abstraction layer.
   
   Separates analysis computation from persistence.
   The domain layer defines the interface; concrete implementations
   (in-memory, Supabase, etc.) live in the platform layer.
   
   The repository owns:
   - Save / load / delete cases
   - List case summaries
   - Audit log persistence
   
   It does NOT own:
   - Analysis computation (domain services do that)
   - UI state (the component layer manages that)
   - Business rules (the domain model enforces those)
   ═══════════════════════════════════════════════════════════ */

import type { NoticeCase, CaseSummary } from "./notice";
import type { AuditEntry } from "./audit";

export interface CaseRepository {
  /* ── Single-case operations ── */
  save(caseObj: NoticeCase): Promise<NoticeCase>;
  load(id: string): Promise<NoticeCase | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;

  /* ── List / query ── */
  listSummaries(ownerId?: string): Promise<CaseSummary[]>;
  listByStatus(status: string, ownerId?: string): Promise<CaseSummary[]>;

  /* ── Audit log ── */
  saveAudit(entry: AuditEntry): Promise<void>;
  loadAudit(caseId: string): Promise<AuditEntry[]>;
}

/* ── Error types ── */

export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RepositoryError";
  }
}

export const RepositoryErrorCode = {
  NOT_FOUND: "NOT_FOUND",
  SAVE_FAILED: "SAVE_FAILED",
  LOAD_FAILED: "LOAD_FAILED",
  DELETE_FAILED: "DELETE_FAILED",
  NETWORK_ERROR: "NETWORK_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;
