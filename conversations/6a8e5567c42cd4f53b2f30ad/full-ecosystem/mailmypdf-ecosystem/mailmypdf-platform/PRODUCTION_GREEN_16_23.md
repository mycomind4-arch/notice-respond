# Production Green — Steps 16–23

These steps extend the original 15-step capability audit into live-service readiness. A service is not green because credentials exist; it is green only after its configured health probe passes.

16. Live smoke-test runner — implemented: `runLiveSmoke` requires every checked service to pass.
17. HTTP health-probe adapters — implemented: generic authenticated/unauthed probes with timeout handling.
18. Trigger/Docling live probes — implemented through configured HTTP probe construction; deployment-specific health URLs remain environment concerns.
19. Model-provider live probe — implemented when a provider health endpoint is configured.
20. MCP live probe — implemented through the configured MCP endpoint.
21. Fulfillment and telemetry live probes — implemented when health endpoints are configured.
22. Production gate semantics — configured, failed, and unconfigured are distinct states; no credential-only green.
23. Release-readiness audit — implemented by combining configuration gates with live smoke results; external services without credentials or reachable endpoints remain yellow.

## Release rule

`GREEN` requires every required service to have a passing live check. Missing configuration, skipped checks, failures, and timeouts are not green.

## Required environment

- `TRIGGER_ENDPOINT`, `TRIGGER_API_KEY`
- `DOCLING_ENDPOINT`, optional `DOCLING_API_KEY`
- `MODEL_PROVIDER`, `MODEL_API_KEY`, and provider health endpoint when supported
- `MCP_ENDPOINT`
- `FULFILLMENT_PROVIDER`, `FULFILLMENT_API_KEY`, and health endpoint when supported
- `TELEMETRY_ENDPOINT`

The repository intentionally does not contain credentials. Live green status must be established by the deployment environment running the smoke suite.
