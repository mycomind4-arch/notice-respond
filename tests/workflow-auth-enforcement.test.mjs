import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const read = (path) => fs.readFile(path, "utf8");

async function listFiles(dir, ext) {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: false });
  return entries
    .filter(f => f.endsWith(ext))
    .map(f => path.join(dir, f));
}

// ═══════════════════════════════════════════════════════════
// WORKFLOW AUTH ENFORCEMENT TESTS
//
// These tests verify the canonical rule:
//   "An unauthenticated visitor may browse workflow landing pages
//    but must authenticate before creating or starting a workflow."
//
// Server-side enforcement is the critical gate. Frontend guards are
// the UX layer. Both are tested.
// ═══════════════════════════════════════════════════════════

test("analyze endpoint requires server-side authentication", async () => {
  const source = await read("server/api/workflows/analyze.ts");
  assert.match(source, /requireAuthenticatedUser/, "analyze endpoint must call requireAuthenticatedUser");
  assert.match(source, /authErrorResponse/, "analyze endpoint must handle auth errors with authErrorResponse");
  assert.match(source, /toAuthRequest/, "analyze endpoint must convert H3 event to Request for auth");
});

test("draft endpoint requires server-side authentication", async () => {
  const source = await read("server/api/workflows/draft.ts");
  assert.match(source, /requireAuthenticatedUser/, "draft endpoint must call requireAuthenticatedUser");
  assert.match(source, /authErrorResponse/, "draft endpoint must handle auth errors with authErrorResponse");
  assert.match(source, /toAuthRequest/, "draft endpoint must convert H3 event to Request for auth");
});

test("llm-providers endpoint requires server-side authentication", async () => {
  const source = await read("server/api/llm-providers.ts");
  assert.match(source, /requireAuthenticatedUser/, "llm-providers endpoint must call requireAuthenticatedUser");
  assert.match(source, /authErrorResponse/, "llm-providers endpoint must handle auth errors with authErrorResponse");
});

test("useLLMWorkflow passes Bearer token in all API calls", async () => {
  const source = await read("src/domain/use-llm-workflow.ts");
  assert.match(source, /useAuth/, "useLLMWorkflow must use useAuth to get the access token");
  assert.match(source, /accessToken/, "useLLMWorkflow must read accessToken from auth context");
  assert.match(source, /Authorization.*Bearer/, "useLLMWorkflow must pass Bearer token in Authorization header");
  // Must check for missing token before making the call
  assert.match(source, /if\s*\(\s*!accessToken\s*\)/, "useLLMWorkflow must check for missing token before calling the API");
});

test("useStartWorkflowGuard redirects unauthenticated users to /auth", async () => {
  const source = await read("src/lib/use-start-workflow-guard.ts");
  assert.match(source, /useStartWorkflowGuard/, "useStartWorkflowGuard hook must exist");
  assert.match(source, /useAuth/, "useStartWorkflowGuard must use useAuth to check auth state");
  assert.match(source, /navigate.*\/auth/, "useStartWorkflowGuard must redirect to /auth when unauthenticated");
  assert.match(source, /returnTo/, "useStartWorkflowGuard must pass returnTo so users return to their workflow");
  assert.match(source, /safeReturnTo/, "useStartWorkflowGuard must validate the return URL with safeReturnTo");
});

test("safeReturnTo rejects open-redirect attempts", async () => {
  const source = await read("src/lib/use-start-workflow-guard.ts");
  assert.match(source, /safeReturnTo/, "safeReturnTo function must exist");
  // Must reject protocol-relative URLs
  assert.match(source, /\/\//, "safeReturnTo must reject // prefix");
  // Must reject URLs with a scheme
  assert.match(source, /\[a-z\]\+:/i, "safeReturnTo must reject URL schemes like https:");
  // Must default to /dashboard for invalid URLs
  assert.match(source, /\/dashboard/, "safeReturnTo must default to /dashboard for invalid URLs");
});

test("auth page validates returnTo before redirecting", async () => {
  const source = await read("src/routes/auth.tsx");
  assert.match(source, /safeReturnTo/, "auth page must use safeReturnTo to validate returnTo param");
  assert.match(source, /validatedReturnTo/, "auth page must store the validated return URL");
});

test("start route validates returnTo before redirecting", async () => {
  const source = await read("src/routes/start.tsx");
  assert.match(source, /safeReturnTo/, "start route must use safeReturnTo to validate returnTo");
});

// ═══════════════════════════════════════════════════════════
// Verify no unauthenticated fetch calls to workflow endpoints remain
// ═══════════════════════════════════════════════════════════

test("all workflow pages use authFetch or guardedStart for API calls", async () => {
  const files = await listFiles("src/routes/workflows", ".tsx");

  for (const file of files) {
    const source = await read(file);
    const basename = path.basename(file);

    // Skip redirect-only pages
    if (source.includes("Compatibility redirect")) continue;
    // Skip the index page (directory listing)
    if (basename === "index.tsx") continue;

    // If the page calls /api/workflows/draft directly, it must use authFetch
    if (source.includes("/api/workflows/draft")) {
      assert.match(
        source,
        /authFetch/,
        `${basename} calls /api/workflows/draft but does not use authFetch — missing auth token`
      );
    }

    // If the page has a startWorkflow function, it must use the guard
    if (source.includes("startWorkflow")) {
      assert.match(
        source,
        /guardedStart|useStartWorkflowGuard/,
        `${basename} has startWorkflow but does not use useStartWorkflowGuard — missing auth gate`
      );
    }
  }
});

test("no remaining unauthenticated fetch calls to /api/workflows/ in source", async () => {
  const allFiles = await listFiles("src", ".tsx");
  const tsFiles = await listFiles("src", ".ts");

  for (const file of [...allFiles, ...tsFiles]) {
    if (file.includes(".test.")) continue;
    if (file.includes("use-llm-workflow.ts")) continue; // Uses fetch with Bearer header directly
    if (file.includes("use-auth-fetch.ts")) continue; // This IS the auth fetch utility
    if (file.includes("use-start-workflow-guard.ts")) continue; // Guard utility, not a consumer

    const source = await read(file);
    // Look for fetch calls to /api/workflows/ that are NOT authFetch
    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("/api/workflows/") && line.includes("fetch(") && !line.includes("authFetch")) {
        assert.fail(
          `${file}:${i + 1} has unauthenticated fetch to /api/workflows/ — use authFetch instead`
        );
      }
    }
  }
});
