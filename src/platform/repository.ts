/* ═══════════════════════════════════════════════════════════
   REPOSITORY PROVIDER
   
   Returns the active CaseRepository implementation.
   
   - If SUPABASE_URL + SUPABASE_ANON_KEY are set → SupabaseCaseRepository
   - Otherwise → InMemoryCaseRepository (dev/SSR default)
   
   Usage:
     import { getRepository } from "@/platform/repository";
     const repo = getRepository();
     const myCase = await repo.load(id);
   
   Override for tests:
     import { setRepository } from "@/platform/repository";
     setRepository(new InMemoryCaseRepository());
   ═══════════════════════════════════════════════════════════ */

import type { CaseRepository } from "../domain/case-repository";
import { getInMemoryRepository } from "./in-memory-repository";
import { SupabaseCaseRepository } from "./supabase-repository";
import { hasSupabase } from "./supabase-client";

let activeRepo: CaseRepository | null = null;

/**
 * Returns the active case repository.
 * Uses Supabase when configured, falls back to in-memory.
 */
export function getRepository(): CaseRepository {
  if (!activeRepo) {
    if (hasSupabase()) {
      activeRepo = new SupabaseCaseRepository();
    } else {
      activeRepo = getInMemoryRepository();
    }
  }
  return activeRepo;
}

/**
 * Override the repository (used in tests to inject a mock).
 */
export function setRepository(repo: CaseRepository): void {
  activeRepo = repo;
}
