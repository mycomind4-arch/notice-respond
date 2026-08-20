/**
 * LLM Provider Selector Component
 *
 * Shows available LLM providers and lets the user choose which one
 * to use for document analysis and draft generation.
 */

import { useState, useEffect } from "react";

export type LLMProvider = "gemini" | "claude" | "openai";

export interface ProviderInfo {
  id: LLMProvider;
  label: string;
  description: string;
  available: boolean;
}

export function LLMProviderSelector({
  selected,
  onSelect,
  className = "",
}: {
  selected: LLMProvider | null;
  onSelect: (provider: LLMProvider) => void;
  className?: string;
}) {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch available providers from the server
    fetch("/api/llm-providers")
      .then((res) => res.json())
      .then((data: ProviderInfo[]) => {
        setProviders(data);
        setLoading(false);
        // Auto-select first available if none selected
        if (!selected && data.length > 0) {
          const firstAvailable = data.find((p) => p.available);
          if (firstAvailable) onSelect(firstAvailable.id);
        }
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        Loading AI providers...
      </div>
    );
  }

  if (providers.length === 0) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        No AI providers configured.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground mb-3">
        AI Engine
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {providers.map((provider) => (
          <button
            key={provider.id}
            disabled={!provider.available}
            onClick={() => onSelect(provider.id)}
            className={`rounded-lg border p-3 text-left transition-all ${
              selected === provider.id
                ? "border-stamp bg-stamp/5 ring-1 ring-stamp"
                : "border-rule hover:border-ink/20"
            } ${!provider.available ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
          >
            <div className="text-sm font-medium">{provider.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {provider.available ? provider.description : "API key required"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
