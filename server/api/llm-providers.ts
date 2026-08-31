/**
 * GET /api/llm-providers
 * Returns the list of configured LLM providers and the default.
 *
 * AUTH: Requires an authenticated MailMyPDF Account session. This prevents
 * anonymous users from probing the AI control-plane configuration.
 */
import { createError, defineEventHandler, getRequestHeaders, getRequestURL, type H3Event } from "h3";
import { getAvailableProviders } from "../../src/platform/llm-service";
import { requireAuthenticatedUser, authErrorResponse } from "../../src/lib/auth-guard";

function toAuthRequest(event: H3Event): Request {
  return new Request(getRequestURL(event).toString(), {
    headers: getRequestHeaders(event) as HeadersInit,
  });
}

export default defineEventHandler(async (event: H3Event) => {
  if (event.method !== "GET") {
    throw createError({ statusCode: 405, statusMessage: "Method not allowed." });
  }

  try {
    await requireAuthenticatedUser(toAuthRequest(event));
  } catch (error) {
    return authErrorResponse(error);
  }

  const providers = getAvailableProviders();
  return {
    providers,
    default: providers[0] ?? null,
    available: providers.length > 0,
  };
});
