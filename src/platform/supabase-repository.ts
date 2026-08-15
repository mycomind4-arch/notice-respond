/* ═══════════════════════════════════════════════════════════
   SUPABASE CASE REPOSITORY
   
   Persists cases to Supabase. Each case is stored as a single
   row in the `cases` table, with the full case JSON in a `data`
   column. Audit entries go in the `audit_entries` table.
   
   Schema (SQL):
   
   CREATE TABLE cases (
     id UUID PRIMARY KEY,
     owner_id TEXT DEFAULT '',
     status TEXT NOT NULL,
     notice_type TEXT DEFAULT 'other',
     agency TEXT,
     reference_number TEXT,
     notice_date TEXT,
     readiness_score INTEGER DEFAULT 0,
     health_status TEXT DEFAULT 'incomplete',
     deadline_date TEXT,
     has_draft BOOLEAN DEFAULT false,
     has_mailing BOOLEAN DEFAULT false,
     created_at TIMESTAMPTZ DEFAULT now(),
     updated_at TIMESTAMPTZ DEFAULT now(),
     data JSONB NOT NULL
   );
   
   CREATE INDEX cases_owner_id_idx ON cases(owner_id);
   CREATE INDEX cases_status_idx ON cases(status);
   CREATE INDEX cases_updated_at_idx ON cases(updated_at DESC);
   
   CREATE TABLE audit_entries (
     id UUID PRIMARY KEY,
     case_id TEXT,
     actor TEXT,
     action TEXT,
     object_type TEXT,
     description TEXT,
     result TEXT DEFAULT 'success',
     is_security_event BOOLEAN DEFAULT false,
     timestamp TIMESTAMPTZ DEFAULT now(),
     data JSONB
   );
   
   CREATE INDEX audit_entries_case_id_idx ON audit_entries(case_id);
   ═══════════════════════════════════════════════════════════ */

import type { NoticeCase, CaseSummary } from "../domain/notice";
import { deserializeCase, serializeCase, toCaseSummary } from "../domain/notice";
import type { AuditEntry } from "../domain/audit";
import type { CaseRepository } from "../domain/case-repository";
import { RepositoryError, RepositoryErrorCode } from "../domain/case-repository";
import { getSupabase } from "./supabase-client";

export class SupabaseCaseRepository implements CaseRepository {
  private get table() {
    const supabase = getSupabase();
    if (!supabase) {
      throw new RepositoryError(
        "Supabase client not initialized",
        RepositoryErrorCode.NETWORK_ERROR,
      );
    }
    return supabase.from("cases");
  }

  private get auditTable() {
    const supabase = getSupabase();
    if (!supabase) {
      throw new RepositoryError(
        "Supabase client not initialized",
        RepositoryErrorCode.NETWORK_ERROR,
      );
    }
    return supabase.from("audit_entries");
  }

  async save(caseObj: NoticeCase): Promise<NoticeCase> {
    try {
      const data = serializeCase(caseObj);
      const summary = toCaseSummary(caseObj);

      const row = {
        id: caseObj.id,
        owner_id: caseObj.ownerId,
        status: caseObj.status,
        notice_type: caseObj.noticeType,
        agency: caseObj.agency || null,
        reference_number: caseObj.referenceNumber || null,
        notice_date: caseObj.noticeDate || null,
        readiness_score: caseObj.readinessScore,
        health_status: caseObj.healthStatus,
        deadline_date: summary.deadlineDate || null,
        has_draft: summary.hasDraft,
        has_mailing: summary.hasMailing,
        created_at: caseObj.createdAt,
        updated_at: caseObj.updatedAt,
        data: data,
      };

      const { error } = await this.table.upsert(row, { onConflict: "id" });

      if (error) {
        throw new RepositoryError(
          `Supabase save failed: ${error.message}`,
          RepositoryErrorCode.SAVE_FAILED,
          error,
        );
      }

      return caseObj;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        `Failed to save case ${caseObj.id}`,
        RepositoryErrorCode.SAVE_FAILED,
        err,
      );
    }
  }

  async load(id: string): Promise<NoticeCase | null> {
    try {
      const { data, error } = await this.table
        .select("data")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw new RepositoryError(
          `Supabase load failed: ${error.message}`,
          RepositoryErrorCode.LOAD_FAILED,
          error,
        );
      }

      if (!data?.data) return null;
      return deserializeCase(data.data as Record<string, unknown>);
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        `Failed to load case ${id}`,
        RepositoryErrorCode.LOAD_FAILED,
        err,
      );
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.table.delete().eq("id", id);
      if (error) {
        throw new RepositoryError(
          `Supabase delete failed: ${error.message}`,
          RepositoryErrorCode.DELETE_FAILED,
          error,
        );
      }
      return true;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        `Failed to delete case ${id}`,
        RepositoryErrorCode.DELETE_FAILED,
        err,
      );
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const { data, error } = await this.table
        .select("id")
        .eq("id", id)
        .maybeSingle();

      if (error) return false;
      return !!data;
    } catch {
      return false;
    }
  }

  async listSummaries(ownerId?: string): Promise<CaseSummary[]> {
    try {
      let query = this.table.select(
        "id, workflow_id, status, notice_type, agency, reference_number, notice_date, readiness_score, health_status, deadline_date, has_draft, has_mailing, created_at, updated_at",
      );

      if (ownerId) {
        query = query.eq("owner_id", ownerId);
      }

      const { data, error } = await query.order("updated_at", { ascending: false });

      if (error) {
        throw new RepositoryError(
          `Supabase list failed: ${error.message}`,
          RepositoryErrorCode.LOAD_FAILED,
          error,
        );
      }

      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        workflowId: row.workflow_id,
        status: row.status,
        noticeType: row.notice_type,
        agency: row.agency || undefined,
        referenceNumber: row.reference_number || undefined,
        noticeDate: row.notice_date || undefined,
        readinessScore: row.readiness_score,
        healthStatus: row.health_status,
        deadlineDate: row.deadline_date || undefined,
        hasDraft: row.has_draft,
        hasMailing: row.has_mailing,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to list cases",
        RepositoryErrorCode.LOAD_FAILED,
        err,
      );
    }
  }

  async listByStatus(status: string, ownerId?: string): Promise<CaseSummary[]> {
    try {
      let query = this.table.select(
        "id, workflow_id, status, notice_type, agency, reference_number, notice_date, readiness_score, health_status, deadline_date, has_draft, has_mailing, created_at, updated_at",
      );

      query = query.eq("status", status);
      if (ownerId) {
        query = query.eq("owner_id", ownerId);
      }

      const { data, error } = await query.order("updated_at", { ascending: false });

      if (error) {
        throw new RepositoryError(
          `Supabase listByStatus failed: ${error.message}`,
          RepositoryErrorCode.LOAD_FAILED,
          error,
        );
      }

      if (!data) return [];

      return data.map((row: any) => ({
        id: row.id,
        workflowId: row.workflow_id,
        status: row.status,
        noticeType: row.notice_type,
        agency: row.agency || undefined,
        referenceNumber: row.reference_number || undefined,
        noticeDate: row.notice_date || undefined,
        readinessScore: row.readiness_score,
        healthStatus: row.health_status,
        deadlineDate: row.deadline_date || undefined,
        hasDraft: row.has_draft,
        hasMailing: row.has_mailing,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to list cases by status",
        RepositoryErrorCode.LOAD_FAILED,
        err,
      );
    }
  }

  async saveAudit(entry: AuditEntry): Promise<void> {
    try {
      const { error } = await this.auditTable.insert({
        id: entry.id,
        case_id: entry.caseId || null,
        actor: entry.actor,
        action: entry.action,
        object_type: entry.objectType,
        description: entry.description,
        result: entry.result,
        is_security_event: entry.isSecurityEvent,
        timestamp: entry.timestamp,
        data: entry,
      });

      if (error) {
        throw new RepositoryError(
          `Supabase audit save failed: ${error.message}`,
          RepositoryErrorCode.SAVE_FAILED,
          error,
        );
      }
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to save audit entry",
        RepositoryErrorCode.SAVE_FAILED,
        err,
      );
    }
  }

  async loadAudit(caseId: string): Promise<AuditEntry[]> {
    try {
      const { data, error } = await this.auditTable
        .select("data")
        .eq("case_id", caseId)
        .order("timestamp", { ascending: true });

      if (error) {
        throw new RepositoryError(
          `Supabase audit load failed: ${error.message}`,
          RepositoryErrorCode.LOAD_FAILED,
          error,
        );
      }

      if (!data) return [];
      return data.map((row: any) => row.data as AuditEntry);
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw new RepositoryError(
        "Failed to load audit entries",
        RepositoryErrorCode.LOAD_FAILED,
        err,
      );
    }
  }
}
