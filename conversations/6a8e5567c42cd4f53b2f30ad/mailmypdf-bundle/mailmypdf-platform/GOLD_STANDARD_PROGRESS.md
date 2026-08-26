# Gold Standard Progress

Updated: 2026-08-22

The ecosystem target remains genuine executable Gold Standard for every workflow. `CATALOG` must never be presented as executable capability.

| Milestone | Status | Current evidence |
|---|---|---|
| 1. Contract + complete workflow inventory | ADVANCED | Canonical program and status model established; the 360-workflow universe is now locked and authority pages are generated from that canonical universe. |
| 2. Notice Respond reference certification | ADVANCED | Notice Respond remains the reference implementation; its connected-stage depth is the parity target. The workflow runtime now preserves the explicit approval boundary: completing review checks proves readiness but cannot itself authorize consequential action. |
| 3. Shared execution primitives | ADVANCED | Canonical pipeline runner enforces intelligence, validation, blocking, review, approval, mailing, tracking, and proof-audit stages and is represented as `@mailmypdf/workflows`. |
| 4. Domain-pack SDK and adapter contracts | ADVANCED | Executable capability diagnostics reject declared-but-missing runtime methods and separate catalog metadata from runtime capability. |
| 5. Appeal Mail | ADVANCED | Gold-standard gate, mailing readiness gate, executable capability factory, and regression coverage are present; recent workflows #21–31 and additional administrative/registration workflows have been upgraded; remaining work is full deployed-path certification. |
| 6. Dispute Mail | ADVANCED | Credit-dispute analysis contract, explicit evidence/approval/submission gates, and regression coverage are present; remaining work is full deployed-path certification. |
| 7. Immigration Mail | ADVANCED | Document understanding, preflight validation, human review, approval, mailing, and proof gates are present and regression-tested; remaining work is full deployed-path certification. |
| 8. Small Business + government/administrative | ADVANCED | Small Business has strict executable capability/action-order certification; GovReply and Code Enforcement have lifecycle runners/tests; Records Requests has persistent-state and fulfillment contracts. Real persistence, fulfillment, tracking/proof, authorization, and deployed smoke certification remain explicit gaps. |
| 9. Claims, benefits, debt, tenant, permit, records | IN PROGRESS | Records Requests is the active executable build. Permit Response and Benefits Appeal have domain contracts and explicit shared-owner decisions; Debt Defense, Tenant Reply, and Insurance Claims remain planned. |
| 10. Ecosystem certification + deployed smoke tests | IN PROGRESS | Central ecosystem certification ledger and regression tests exist. Deployment smoke certification is still blocked on real infrastructure and cross-repo runtime verification. |

## Current hard gates

- Missing or unverified evidence stays explicit and blocks consequential execution.
- A workflow cannot claim capability merely because it appears in a catalog or manifest.
- Validation must pass before review, approval, mailing, tracking, and proof certification.
- Approval and mailing remain explicit runtime stages; they cannot be inferred from a draft, review checklist, or schedule.
- Tests must exercise representative fixtures and regression cases before a workflow can be certified.
- A workflow is not Gold merely because its lifecycle runner exists; the actual production integrations and deployed path must still be verified.
- CI/status checks for the newest platform commits are currently absent from the GitHub connector response, so no passing CI result is being claimed.
- Platform CI has been configured to install with `--no-frozen-lockfile`, fail on generated lockfile drift, then run typecheck, test, and build. The existing lockfile still needs one real pnpm regeneration/commit before that CI can turn green.
- Notice Respond's latest hardening commit has no workflow run reported yet; its tests therefore remain locally reported evidence rather than a newly verified remote CI result.

## Next execution order

1. Continue hardening Notice Respond consequential boundaries and add runtime certification around the actual approval-to-mail transition.
2. Finish Records Requests regression certification and real integration gates.
3. Finish Small Business production persistence, authenticated scheduling, fulfillment authentication, carrier tracking, permanent proof, and team approval wiring.
4. Finish deployed-path certification for GovReply, Code Enforcement, Appeal, Dispute, and Immigration.
5. Build dependent planned verticals only after their shared-owner boundaries are proven reusable.
6. Run ecosystem-wide deployed smoke certification only after workflow-level gates are green.
