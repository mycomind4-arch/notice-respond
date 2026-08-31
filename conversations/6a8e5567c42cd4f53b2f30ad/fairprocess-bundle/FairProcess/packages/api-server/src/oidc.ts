import { createPublicKey, verify as verifySignature } from "node:crypto";

export type AuthenticationErrorCode =
  | "malformed_token"
  | "unsupported_algorithm"
  | "missing_key_id"
  | "signing_key_not_found"
  | "invalid_signature"
  | "invalid_issuer"
  | "invalid_audience"
  | "missing_subject"
  | "missing_expiration"
  | "token_expired"
  | "token_not_active"
  | "provider_unavailable"
  | "invalid_provider_response"
  | "configuration_error";

export class AuthenticationError extends Error {
  readonly code: AuthenticationErrorCode;

  constructor(code: AuthenticationErrorCode, message: string) {
    super(message);
    this.name = "AuthenticationError";
    this.code = code;
  }
}

export interface VerifiedIdentity {
  issuer: string;
  subject: string;
  audiences: string[];
  expiresAt: number;
  email?: string;
  name?: string;
}

export interface TokenVerifier {
  verify(token: string): Promise<VerifiedIdentity>;
}

type FetchResponse = {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
};

export type AuthFetcher = (url: string) => Promise<FetchResponse>;

export interface OidcVerifierConfig {
  issuer: string;
  audience: string | string[];
  jwksUri?: string;
  allowedAlgorithms?: string[];
  clockSkewSeconds?: number;
  cacheTtlMs?: number;
  fetcher?: AuthFetcher;
  now?: () => number;
}

type JwtHeader = {
  alg?: unknown;
  kid?: unknown;
  typ?: unknown;
};

type JwtPayload = {
  iss?: unknown;
  sub?: unknown;
  aud?: unknown;
  exp?: unknown;
  nbf?: unknown;
  email?: unknown;
  name?: unknown;
};

type Jwk = Record<string, unknown> & {
  kid?: string;
  alg?: string;
  use?: string;
  kty?: string;
};

const defaultFetcher: AuthFetcher = async (url) => {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    throw new AuthenticationError(
      "provider_unavailable",
      `Unable to reach the configured identity provider: ${String(error)}`,
    );
  }
  return {
    ok: response.ok,
    status: response.status,
    json: () => response.json(),
  };
};

function decodePart<T>(encoded: string, label: string): T {
  try {
    const decoded = Buffer.from(encoded, "base64url").toString("utf8");
    return JSON.parse(decoded) as T;
  } catch {
    throw new AuthenticationError("malformed_token", `JWT ${label} is not valid base64url JSON`);
  }
}

function parseJwt(token: string): {
  encodedHeader: string;
  encodedPayload: string;
  signature: Buffer;
  header: JwtHeader;
  payload: JwtPayload;
} {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part, index) => index < 2 && part.length === 0)) {
    throw new AuthenticationError("malformed_token", "Bearer token must be a three-part JWT");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts as [string, string, string];
  return {
    encodedHeader,
    encodedPayload,
    signature: Buffer.from(encodedSignature, "base64url"),
    header: decodePart<JwtHeader>(encodedHeader, "header"),
    payload: decodePart<JwtPayload>(encodedPayload, "payload"),
  };
}

function normalizeAudiences(value: unknown): string[] {
  if (typeof value === "string" && value.length > 0) return [value];
  if (Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0)) {
    return value as string[];
  }
  return [];
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AuthenticationError("invalid_provider_response", "Identity provider returned invalid JSON");
  }
  return value as Record<string, unknown>;
}

export function createOidcTokenVerifier(config: OidcVerifierConfig): TokenVerifier {
  const issuer = config.issuer.trim();
  const requiredAudiences = (Array.isArray(config.audience) ? config.audience : [config.audience])
    .map((value) => value.trim())
    .filter(Boolean);
  if (!issuer || requiredAudiences.length === 0) {
    throw new AuthenticationError(
      "configuration_error",
      "OIDC issuer and at least one audience are required",
    );
  }

  const allowedAlgorithms = new Set(config.allowedAlgorithms ?? ["RS256"]);
  const clockSkewSeconds = config.clockSkewSeconds ?? 60;
  const cacheTtlMs = config.cacheTtlMs ?? 300_000;
  const fetcher = config.fetcher ?? defaultFetcher;
  const now = config.now ?? Date.now;

  let cachedJwksUri = config.jwksUri;
  let cachedKeys: { expiresAt: number; keys: Jwk[] } | undefined;

  async function getJwksUri(): Promise<string> {
    if (cachedJwksUri) return cachedJwksUri;
    const discoveryUrl = `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
    const response = await fetcher(discoveryUrl);
    if (!response.ok) {
      throw new AuthenticationError(
        "provider_unavailable",
        `OIDC discovery failed with HTTP ${response.status}`,
      );
    }
    const discovery = asRecord(await response.json());
    if (discovery.issuer !== issuer || typeof discovery.jwks_uri !== "string") {
      throw new AuthenticationError(
        "invalid_provider_response",
        "OIDC discovery issuer or jwks_uri is invalid",
      );
    }
    cachedJwksUri = discovery.jwks_uri;
    return cachedJwksUri;
  }

  async function getKeys(forceRefresh = false): Promise<Jwk[]> {
    const currentTime = now();
    if (!forceRefresh && cachedKeys && cachedKeys.expiresAt > currentTime) {
      return cachedKeys.keys;
    }
    const response = await fetcher(await getJwksUri());
    if (!response.ok) {
      throw new AuthenticationError(
        "provider_unavailable",
        `OIDC JWKS request failed with HTTP ${response.status}`,
      );
    }
    const body = asRecord(await response.json());
    if (!Array.isArray(body.keys)) {
      throw new AuthenticationError("invalid_provider_response", "OIDC JWKS response has no keys array");
    }
    const keys = body.keys.filter((value): value is Jwk => Boolean(value && typeof value === "object"));
    cachedKeys = { expiresAt: currentTime + cacheTtlMs, keys };
    return keys;
  }

  async function findSigningKey(kid: string, algorithm: string): Promise<Jwk> {
    const matches = (keys: Jwk[]) =>
      keys.find(
        (key) =>
          key.kid === kid &&
          (!key.alg || key.alg === algorithm) &&
          (!key.use || key.use === "sig") &&
          key.kty === "RSA",
      );

    const cachedMatch = matches(await getKeys());
    if (cachedMatch) return cachedMatch;
    const refreshedMatch = matches(await getKeys(true));
    if (refreshedMatch) return refreshedMatch;
    throw new AuthenticationError("signing_key_not_found", "No matching OIDC signing key was found");
  }

  return {
    async verify(token: string): Promise<VerifiedIdentity> {
      const parsed = parseJwt(token);
      const algorithm = parsed.header.alg;
      if (typeof algorithm !== "string" || !allowedAlgorithms.has(algorithm) || algorithm !== "RS256") {
        throw new AuthenticationError("unsupported_algorithm", "JWT signing algorithm is not allowed");
      }
      if (typeof parsed.header.kid !== "string" || parsed.header.kid.length === 0) {
        throw new AuthenticationError("missing_key_id", "JWT header is missing a key identifier");
      }

      const jwk = await findSigningKey(parsed.header.kid, algorithm);
      let publicKey;
      try {
        publicKey = createPublicKey({ key: jwk, format: "jwk" } as never);
      } catch {
        throw new AuthenticationError("invalid_provider_response", "OIDC signing key is invalid");
      }

      const signingInput = Buffer.from(`${parsed.encodedHeader}.${parsed.encodedPayload}`);
      if (!verifySignature("RSA-SHA256", signingInput, publicKey, parsed.signature)) {
        throw new AuthenticationError("invalid_signature", "JWT signature verification failed");
      }

      if (parsed.payload.iss !== issuer) {
        throw new AuthenticationError("invalid_issuer", "JWT issuer does not match configuration");
      }
      if (typeof parsed.payload.sub !== "string" || parsed.payload.sub.length === 0) {
        throw new AuthenticationError("missing_subject", "JWT subject is required");
      }

      const audiences = normalizeAudiences(parsed.payload.aud);
      if (!requiredAudiences.some((required) => audiences.includes(required))) {
        throw new AuthenticationError("invalid_audience", "JWT audience does not include FairProcess");
      }
      if (typeof parsed.payload.exp !== "number" || !Number.isFinite(parsed.payload.exp)) {
        throw new AuthenticationError("missing_expiration", "JWT expiration is required");
      }

      const currentSeconds = Math.floor(now() / 1000);
      if (parsed.payload.exp + clockSkewSeconds <= currentSeconds) {
        throw new AuthenticationError("token_expired", "JWT has expired");
      }
      if (
        typeof parsed.payload.nbf === "number" &&
        Number.isFinite(parsed.payload.nbf) &&
        parsed.payload.nbf - clockSkewSeconds > currentSeconds
      ) {
        throw new AuthenticationError("token_not_active", "JWT is not active yet");
      }

      return {
        issuer,
        subject: parsed.payload.sub,
        audiences,
        expiresAt: parsed.payload.exp,
        ...(typeof parsed.payload.email === "string" ? { email: parsed.payload.email } : {}),
        ...(typeof parsed.payload.name === "string" ? { name: parsed.payload.name } : {}),
      };
    },
  };
}

export function createOidcTokenVerifierFromEnv(env: NodeJS.ProcessEnv = process.env): TokenVerifier {
  const issuer = env.OIDC_ISSUER?.trim();
  const audience = env.OIDC_AUDIENCE?.split(",").map((value) => value.trim()).filter(Boolean);
  if (!issuer || !audience || audience.length === 0) {
    throw new AuthenticationError(
      "configuration_error",
      "OIDC_ISSUER and OIDC_AUDIENCE must be configured before the API starts",
    );
  }

  return createOidcTokenVerifier({
    issuer,
    audience,
    ...(env.OIDC_JWKS_URI?.trim() ? { jwksUri: env.OIDC_JWKS_URI.trim() } : {}),
  });
}
