# Governed Policy Lifecycle

FairProcess uses one shared, versioned policy catalog. Policy permissions and the configured governance tenant determine who may change that catalog; activation state determines which rules may affect an audit.

## States

- `draft` — authored but not ready for legal review or use.
- `legal_review_required` — awaiting qualified human legal/policy review.
- `active` — eligible for deterministic audit evaluation.
- `superseded` — replaced by a newer active version for the same jurisdiction.
- `deprecated` — retained for provenance but intentionally withdrawn.

## Creation

`POST /api/policies` accepts only `draft` and `legal_review_required`. Creating an `active`, `superseded`, or `deprecated` bundle is rejected. Creation records the `policy_created` audit action; it does not imply approval or activation.

## Activation

`PATCH /api/policies/:id/activate` requires:

1. `policy:activate` permission; and
2. membership in `POLICY_GOVERNANCE_TENANT_ID`.

Activation runs in a database transaction. A jurisdiction-scoped PostgreSQL advisory lock serializes concurrent approvals. The target becomes `active`, and every other active bundle for the same jurisdiction becomes `superseded` before the transaction commits.

The audit event records the target version, its prior state, and the IDs of bundles superseded by the decision.

## Audit selection

Automatic audit selection queries active bundles only. When a caller supplies `policyBundleId`, a pre-handler verifies that the named bundle is active before audit execution.

PostgreSQL also enforces the invariant: an `integrity_reports` row cannot reference a policy bundle whose state is not `active`. This prevents future or racing code paths from persisting a report against a draft, review-required, deprecated, or superseded policy.

## Historical reproducibility

A policy becoming superseded does not invalidate reports generated while it was active. Existing report rows retain their original `policy_bundle_id` for provenance. The active-policy trigger applies when a report is inserted or its policy reference changes; it does not rewrite historical reports when catalog status later changes.
