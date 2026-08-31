# Publishing reusable MailMyPDF platform packages

The platform is a pnpm workspace. Internal packages may use `workspace:*` while developing together; publishing must be verified with the packed tarballs so workspace ranges are rewritten to publishable dependency ranges.

## Required package checks

The reusable package set is:

- `@mailmypdf/core`
- `@mailmypdf/documents`
- `@mailmypdf/intelligence`
- `@mailmypdf/workflows`
- `@mailmypdf/proof`
- `@mailmypdf/fulfillment`

Before publishing, run the repository's package verification command and inspect the generated package manifests. A package is not considered consumable merely because TypeScript builds inside the workspace.

## Vertical consumption rule

Vertical applications should consume released platform packages rather than copying source files. Until a release is available, verticals may use a narrow compatibility adapter, but the adapter must map to platform contracts and must not fork platform implementations.

## Release gate

A release is allowed only when:

1. lockfile is synchronized with every package manifest;
2. typecheck passes;
3. tests pass;
4. all reusable packages build;
5. each packed tarball has a valid `package.json`;
6. no published package retains an unusable `workspace:` dependency range;
7. package exports resolve from the packed artifact.
