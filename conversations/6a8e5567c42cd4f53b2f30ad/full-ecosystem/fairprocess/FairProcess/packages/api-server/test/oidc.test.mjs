import assert from "node:assert/strict";
import { generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import { AuthenticationError, createOidcTokenVerifier } from "../dist/oidc.js";

const issuer = "https://identity.example.test";
const audience = "fairprocess-api";
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const publicJwk = publicKey.export({ format: "jwk" });
publicJwk.kid = "test-key";
publicJwk.alg = "RS256";
publicJwk.use = "sig";

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function token(payload, header = { alg: "RS256", kid: "test-key", typ: "JWT" }) {
  const signingInput = `${encode(header)}.${encode(payload)}`;
  const signature = sign("RSA-SHA256", Buffer.from(signingInput), privateKey).toString("base64url");
  return `${signingInput}.${signature}`;
}

function fetcher() {
  return async (url) => {
    if (url === `${issuer}/.well-known/openid-configuration`) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { issuer, jwks_uri: `${issuer}/jwks` };
        },
      };
    }
    if (url === `${issuer}/jwks`) {
      return {
        ok: true,
        status: 200,
        async json() {
          return { keys: [publicJwk] };
        },
      };
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
}

const nowSeconds = 1_800_000_000;

function standardClaims(overrides = {}) {
  return {
    iss: issuer,
    sub: "user-123",
    aud: audience,
    exp: nowSeconds + 300,
    iat: nowSeconds - 10,
    email: "analyst@example.test",
    name: "Example Analyst",
    ...overrides,
  };
}

test("verifies a signed RS256 OIDC token and returns authenticated identity", async () => {
  const verifier = createOidcTokenVerifier({
    issuer,
    audience,
    fetcher: fetcher(),
    now: () => nowSeconds * 1000,
  });

  const identity = await verifier.verify(token(standardClaims()));

  assert.deepEqual(identity, {
    issuer,
    subject: "user-123",
    audiences: [audience],
    expiresAt: nowSeconds + 300,
    email: "analyst@example.test",
    name: "Example Analyst",
  });
});

test("rejects a token issued for another audience", async () => {
  const verifier = createOidcTokenVerifier({
    issuer,
    audience,
    fetcher: fetcher(),
    now: () => nowSeconds * 1000,
  });

  await assert.rejects(
    verifier.verify(token(standardClaims({ aud: "another-api" }))),
    (error) => error instanceof AuthenticationError && error.code === "invalid_audience",
  );
});

test("rejects expired tokens", async () => {
  const verifier = createOidcTokenVerifier({
    issuer,
    audience,
    fetcher: fetcher(),
    now: () => nowSeconds * 1000,
    clockSkewSeconds: 0,
  });

  await assert.rejects(
    verifier.verify(token(standardClaims({ exp: nowSeconds - 1 }))),
    (error) => error instanceof AuthenticationError && error.code === "token_expired",
  );
});

test("rejects unsigned or unsupported JWT algorithms", async () => {
  const verifier = createOidcTokenVerifier({
    issuer,
    audience,
    fetcher: fetcher(),
    now: () => nowSeconds * 1000,
  });

  const unsigned = `${encode({ alg: "none", typ: "JWT" })}.${encode(standardClaims())}.`;
  await assert.rejects(
    verifier.verify(unsigned),
    (error) => error instanceof AuthenticationError && error.code === "unsupported_algorithm",
  );
});
