/* ═══════════════════════════════════════════════════════════
   REPOSITORY PROVIDER
   
   Returns the active CaseRepository implementation.
   
   Currently: InMemoryCaseRepository (dev/SSR default).
   Next stage: SupabaseCaseRepository when env vars are present.
   
   Usage:
     import { getRepository } from "@/platform/repository";
     const repo = getRepository();
     const myCase = await repo.load(id);
   ═══════════════════════════════════════════════════════════ */

import type { CaseRepository } from "../domain/case-repository";
import { getInMemoryRepository } from "./in-memory-repository";

let activeRepo: CaseRepository | null = null;

/**
 * Returns the active case repository.
 * Falls back to in-memory when no persistence is configured.
 */
export function getRepository(): CaseRepository {
  if (!activeRepo) {
    activeRepo = getInMemoryRepository();
  }
  return activeRepo;
}

/**
 * Override the repository (used when Supabase is initialized
 * or in tests to inject a mock).
 */
export function setRepository(repo: CaseRepository): void {
  activeRepo = repo;
}
