# FairProcess Web

The web artifact contains two clearly separated interfaces:

1. **`index.html` — demonstration UI**
   - synthetic records only;
   - no authentication, uploads, signatures, ledger, or county integration;
   - retained as a visual reference for the complete analyst workflow.

2. **`live.html` — live analyst workspace**
   - connects to the existing FairProcess OIDC API;
   - uses only records returned by the authenticated tenant;
   - lists and creates cases;
   - discovers policy bundles and rules;
   - adds instrument expectations;
   - imports recorder CSV with search provenance;
   - runs deterministic audits;
   - reviews, downloads, authorizes, and publishes reports according to server permissions;
   - displays case audit events and tenant audit-chain verification.

## Run locally

Build the full repository, then serve the web output:

```bash
pnpm build
npx serve apps/web/dist -p 3000
```

Open:

- demonstration: `http://localhost:3000/`
- live client: `http://localhost:3000/live.html`

Run the API separately on its configured host, commonly `http://localhost:3001`, and include the web origin in `CORS_ORIGIN`.

## Authentication boundary

The live page does not collect an identity-provider password. An operator supplies a short-lived OIDC access token issued for the configured FairProcess audience. The page:

- keeps the token only in JavaScript memory;
- clears it on disconnect or reload;
- does not use local storage, session storage, cookies, URL parameters, tenant headers, or actor headers;
- sends the token only in the `Authorization: Bearer` header;
- renders API values using DOM `textContent`, not HTML insertion.

Production deployments should use an identity-provider integration that delivers short-lived tokens without requiring manual copying. The manual token field is an operator/test interface, not a replacement for an OIDC authorization-code-with-PKCE login.

## Safety boundary

FairProcess identifies evidentiary status; it does not render legal conclusions. “Not located” is not proof that a record does not exist. Report authorization and publication remain permission-gated server operations recorded in the audit chain.

## Tests

`apps/web/test/live-client.test.mjs` enforces the client-side security and endpoint contract. The root CI command also rebuilds the static artifact and runs the existing demonstration sanitization tests.
