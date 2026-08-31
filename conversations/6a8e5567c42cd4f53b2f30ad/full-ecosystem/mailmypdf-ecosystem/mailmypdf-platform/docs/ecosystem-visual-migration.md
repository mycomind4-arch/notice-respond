# Ecosystem Visual Migration Contract

## Canonical ownership
The Platform owns the shared visual language. Vertical repositories consume it. The original MailMyPDF application is intentionally excluded from this migration and must not be modified by vertical/platform visual work.

## Shared primitives
Typography, spacing, surfaces, controls, navigation, status badges, dialogs, tables, workflow states, focus treatment, responsive breakpoints, reduced motion, and accessibility conventions are shared.

## Themed variation
Verticals may customize accent treatment and domain-specific composition, but not the underlying component semantics. Target approximately 80% shared system / 20% vertical personality.

## Migration sequence
1. Inventory existing UI primitives.
2. Map each primitive to Platform tokens/components.
3. Replace divergent tokens first.
4. Replace shared components incrementally.
5. Validate responsive, keyboard, and reduced-motion behavior.
6. Run visual regression checks before each vertical release.

## Explicit exclusion
Do not edit the original MailMyPDF repository as part of this initiative. It remains the visual reference baseline and production canonical.
