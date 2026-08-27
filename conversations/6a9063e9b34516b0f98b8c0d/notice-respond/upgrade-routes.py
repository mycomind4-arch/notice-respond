#!/usr/bin/env python3
"""
Upgrade the head() function in each workflow route to use createWorkflowHead().
This adds FAQ structured data, keywords, breadcrumbs, and rich meta tags.
Also adds FAQSection to the intro page and LLM analysis imports.
"""
import re
import os
import sys

ROUTES_DIR = "src/routes/workflows"

# Map route files to workflow IDs
ROUTE_MAP = {
    "cp2000-response.tsx": "cp2000-response",
    "cp14-response.tsx": "cp14-response",
    "cp504-response.tsx": "cp504-response",
    "cp523-response.tsx": "cp523-response",
    "irs-notice.tsx": "irs-notice",
    "court-summons.tsx": "court-summons",
    "agency-action.tsx": "agency-action",
    "file-appeal.tsx": "file-appeal",
    "transunion-dispute.tsx": "transunion-dispute",
    "experian-dispute.tsx": "experian-dispute",
    "equifax-dispute.tsx": "equifax-dispute",
}

IMPORTS_TO_ADD = """import { createWorkflowHead } from "@/domain/enhanced-head";
import { useCombinedAnalysis } from "@/domain/use-combined-analysis";
import { LLMAnalysisPanel } from "@/components/llm-analysis-panel";
import { FAQSection } from "@/components/faq-section";
import { getWorkflowSEO } from "@/domain/workflow-seo";"""

# Patterns for finding the head function
# Pattern 1: head: () => { ... } (complex routes with multiple lines)
# Pattern 2: head: () => ({ meta: [ ... ] }) (simple routes, single line)

def replace_head_function(content, workflow_id):
    """Replace the head() function with createWorkflowHead call."""
    
    # Pattern 1: Multi-line head function (head: () => { ... },
    # Find "head: () => {" and match until the closing "},\n" before component:
    pattern1 = r'head:\s*\(\)\s*=>\s*\{[^}]*?\},\s*\n\s*component:'
    
    # Pattern 2: Single-expression head (head: () => ({ meta: [...] }),
    pattern2 = r'head:\s*\(\)\s*=>\s*\(\{[^}]*?\}\),'
    
    replacement = f'head: () => createWorkflowHead("{workflow_id}"),'
    
    # Try pattern 1 first (with balanced braces)
    # Find the head function by locating "head: () =>" and matching braces
    head_match = re.search(r'(head:\s*\(\)\s*=>\s*\{)', content)
    if head_match:
        start = head_match.start()
        # Find matching closing brace
        brace_count = 0
        i = head_match.end() - 1  # position of the opening {
        while i < len(content):
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
                if brace_count == 0:
                    # Found the closing brace of the head function
                    # Look for the comma after it
                    end = i + 1
                    while end < len(content) and content[end] in ' \t\n':
                        end += 1
                    if end < len(content) and content[end] == ',':
                        end += 1
                    # Replace from start to end
                    content = content[:start] + replacement + content[end:]
                    break
            i += 1
    else:
        # Try pattern 2 (single expression)
        content = re.sub(pattern2, replacement, content, count=1, flags=re.DOTALL)
    
    return content

def add_imports(content):
    """Add LLM and SEO imports after the existing imports."""
    if "createWorkflowHead" in content:
        return content  # Already added
    
    # Find the last import line
    import_lines = list(re.finditer(r'^import\s+.*?;\s*$', content, re.MULTILINE))
    if import_lines:
        last_import = import_lines[-1]
        insert_pos = last_import.end()
        content = content[:insert_pos] + "\n" + IMPORTS_TO_ADD + content[insert_pos:]
    
    return content

def add_faq_to_intro(content, workflow_id):
    """Add FAQSection to the intro step."""
    if "FAQSection" in content and "faq" in content:
        # Check if FAQSection is already used in JSX
        if "<FAQSection" in content:
            return content
    
    # Find the intro step section and add FAQ at the end
    # Look for pattern: step === 0 or state.phase === "intro"
    # Add FAQ section before the closing div of the intro section
    
    # For complex routes using state.phase === "intro"
    intro_pattern = r'(state\.phase === "intro".*?)(\s*</div>\s*\n\s*\{state\.phase)'
    match = re.search(intro_pattern, content, re.DOTALL)
    if match:
        insert_text = f'\n\n        {{(() => {{ const seo = getWorkflowSEO("{workflow_id}"); return seo ? <FAQSection faq={{seo.faq}} /> : null; }})()}}\n'
        content = content[:match.end()-len(match.group(2))] + insert_text + content[match.end()-len(match.group(2)):]
        return content
    
    # For simple routes using step === 0
    intro_pattern2 = r'(step === 0.*?)(</div>\s*\n\s*\{step === 1)'
    match2 = re.search(intro_pattern2, content, re.DOTALL)
    if match2:
        insert_text = f'\n          {{(() => {{ const seo = getWorkflowSEO("{workflow_id}"); return seo ? <FAQSection faq={{seo.faq}} /> : null; }})()}}\n        '
        content = content[:match2.end()-len(match2.group(2))] + insert_text + content[match2.end()-len(match2.group(2)):]
        return content
    
    return content

for filename, workflow_id in ROUTE_MAP.items():
    filepath = os.path.join(ROUTES_DIR, filename)
    if not os.path.exists(filepath):
        print(f"SKIP: {filepath} not found")
        continue
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    original = content
    
    # Step 1: Add imports
    content = add_imports(content)
    
    # Step 2: Replace head function
    content = replace_head_function(content, workflow_id)
    
    # Step 3: Add FAQ to intro
    content = add_faq_to_intro(content, workflow_id)
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✓ Updated {filename}")
    else:
        print(f"- No changes to {filename}")

print("\nDone. Run build to verify.")
