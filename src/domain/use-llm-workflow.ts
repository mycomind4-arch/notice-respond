/**
 * useLLMWorkflow — shared hook for LLM-powered document analysis and draft generation.
 *
 * All workflows use this to call the /api/workflows/analyze and /api/workflows/draft
 * endpoints. The deterministic extraction (regex-based) runs in parallel as a
 * validation layer. The LLM output is the primary intelligence source; the
 * deterministic output validates and enriches it.
 *
 * AUTH: This hook automatically includes the authenticated user's Bearer token
 * in all API calls. If the user is not authenticated, the calls will receive
 * a 401 from the server, and the error is surfaced to the UI.
 *
 * Usage:
 *   const llm = useLLMWorkflow("cp2000-response");
 *   await llm.analyze(file, text);
 *   await llm.generateDraft(analysis, userFacts, userObjective);
 */

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth";

export interface LLMAnalysis {
  summary?: string;
  [key: string]: unknown;
}

export interface LLMValidation {
  passed: boolean;
  errors: number;
  warnings: number;
  findings: Array<{ check: string; passed: boolean; severity: string; detail: string }>;
}

export interface LLMWorkflowState {
  loading: boolean;
  error: string | null;
  analysis: LLMAnalysis | null;
  draft: string | null;
  draftValidation: LLMValidation | null;
  provider: string | null;
}

export function useLLMWorkflow(workflowId: string) {
  const { accessToken } = useAuth();
  const [state, setState] = useState<LLMWorkflowState>({
    loading: false,
    error: null,
    analysis: null,
    draft: null,
    draftValidation: null,
    provider: null,
  });

  const analyze = useCallback(async (file: File | null, text: string): Promise<LLMAnalysis | null> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (!accessToken) {
      setState((s) => ({ ...s, loading: false, error: "Sign in to your MailMyPDF Account to use AI analysis." }));
      return null;
    }

    try {
      const authHeaders: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
      };

      let res: Response;
      if (file) {
        const formData = new FormData();
        formData.append("document", file);
        formData.append("workflowId", workflowId);
        res = await fetch("/api/workflows/analyze", {
          method: "POST",
          body: formData,
          headers: authHeaders,
        });
      } else {
        res = await fetch("/api/workflows/analyze", {
          method: "POST",
          headers: { ...authHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ text, workflowId }),
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.statusMessage || err.error || `Analysis failed (${res.status})`);
      }
      const data = await res.json();
      setState((s) => ({
        ...s,
        loading: false,
        analysis: data.analysis,
        provider: data.provider,
      }));
      return data.analysis;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed.";
      setState((s) => ({ ...s, loading: false, error: message }));
      return null;
    }
  }, [workflowId, accessToken]);

  const generateDraft = useCallback(async (
    analysis: LLMAnalysis,
    userFacts: string,
    userObjective: string,
    documentText?: string,
  ): Promise<string | null> => {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (!accessToken) {
      setState((s) => ({ ...s, loading: false, error: "Sign in to your MailMyPDF Account to generate a draft." }));
      return null;
    }

    try {
      const res = await fetch("/api/workflows/draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          workflowId,
          analysis,
          userFacts,
          userObjective,
          documentText,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.statusMessage || err.error || `Draft generation failed (${res.status})`);
      }
      const data = await res.json();
      setState((s) => ({
        ...s,
        loading: false,
        draft: data.draft,
        draftValidation: data.validation,
        provider: data.provider,
      }));
      return data.draft;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Draft generation failed.";
      setState((s) => ({ ...s, loading: false, error: message }));
      return null;
    }
  }, [workflowId, accessToken]);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      analysis: null,
      draft: null,
      draftValidation: null,
      provider: null,
    });
  }, []);

  return { ...state, analyze, generateDraft, reset };
}
