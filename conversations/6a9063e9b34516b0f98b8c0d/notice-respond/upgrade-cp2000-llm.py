#!/usr/bin/env python3
"""Add LLM analysis and draft generation to the CP2000 route."""
import re

filepath = "src/routes/workflows/cp2000-response.tsx"
with open(filepath, 'r') as f:
    content = f.read()

# 1. Add LLM hook after the state declarations (after fileInputRef line)
# Find: const fileInputRef = useRef<HTMLInputElement>(null);
# Add after it: const llmAnalysis = useCombinedAnalysis("cp2000-response");
old_line = '  const fileInputRef = useRef<HTMLInputElement>(null);'
new_line = old_line + '\n  const llmAnalysis = useCombinedAnalysis("cp2000-response");'
content = content.replace(old_line, new_line, 1)

# 2. Add LLM analysis call at the end of handleFileUpload
# Find the end of handleFileUpload (before the closing of the useCallback)
# The last statement before the closing is the update((s) => setExtraction(s, {...}))
# I'll add the LLM call after the extraction is set

old_extraction_end = """      extractionConfidence: extraction.classificationConfidence,
    }));
  }, [update, buildGoldStandardPipeline]);"""

new_extraction_end = """      extractionConfidence: extraction.classificationConfidence,
    }));

    // ── LLM-powered analysis (runs alongside deterministic extraction) ──
    llmAnalysis.analyzeWithLLM(file, sanitizedText);
  }, [update, buildGoldStandardPipeline, llmAnalysis]);"""

content = content.replace(old_extraction_end, new_extraction_end, 1)

# 3. Add LLMAnalysisPanel in the extraction step
# Find the end of the extraction step's extracted facts section
# Look for the closing of the cp2000Extraction display section

# Find: {/* Gold-standard intelligence */}
old_intelligence = "              {/* Gold-standard intelligence */}"
new_intelligence = """              {/* LLM-powered analysis */}
              {llmAnalysis.llmAnalysis && (
                <LLMAnalysisPanel analysis={llmAnalysis.llmAnalysis} provider={llmAnalysis.llmProvider} />
              )}
              {llmAnalysis.llmLoading && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary animate-pulse">
                  ✦ AI is analyzing your document…
                </div>
              )}

              {/* Gold-standard intelligence */}"""
content = content.replace(old_intelligence, new_intelligence, 1)

# 4. Add AI draft generation button
# Find the "Regenerate draft" button and add an "AI Generate" button before it
old_regenerate = """              <button
                onClick={handleGenerateDraft}
                className="mt-4 rounded-full border border-rule px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Regenerate draft
              </button>"""

new_regenerate = """              <button
                onClick={async () => {
                  if (llmAnalysis.llmAnalysis) {
                    const draft = await llmAnalysis.analyzeWithLLM(null, '');
                    // Use the draft API directly
                    const res = await fetch('/api/workflows/draft', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        workflowId: 'cp2000-response',
                        analysis: llmAnalysis.llmAnalysis,
                        userFacts: state.userFacts,
                        userObjective: state.userObjective,
                        documentText: state.upload?.rawText,
                      }),
                    });
                    if (res.ok) {
                      const data = await res.json();
                      update((s) => setDraft(s, data.draft));
                      if (data.validation) update((s) => setDraftValidation(s, data.validation));
                    }
                  }
                }}
                disabled={!llmAnalysis.llmAnalysis}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-stamp transition-transform hover:-translate-y-0.5 disabled:opacity-30"
              >
                ✦ Generate with AI
              </button>
              <button
                onClick={handleGenerateDraft}
                className="mt-4 ml-2 rounded-full border border-rule px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
              >
                Regenerate draft (template)
              </button>"""

content = content.replace(old_regenerate, new_regenerate, 1)

with open(filepath, 'w') as f:
    f.write(content)

print("✓ CP2000 LLM integration complete")
