## Why

The manifest promises read-only integration imports, but the codebase lacks a standard import registry and minimal adapter contract to make imported sources actionable in workflows. Aligning on a small, end-to-end import slice now keeps the roadmap credible and unblocks intake/traceability work that depends on imported data.

## What Changes

- Introduce a read-only import registry with stable metadata for imported sources under `projectspec/sources/imported/`.
- Define a minimal import adapter contract for generating snapshots and updating the registry.
- Extend drift checks to flag imported sources missing registry entries or stale metadata.
- Document the import pipeline and expected file layout for contributors.

## Capabilities

### New Capabilities
- `integration-imports`: Read-only import pipeline with a registry and adapter contract for snapshots under `projectspec/sources/imported/`.

### Modified Capabilities
- None.

## Non-Goals

- Implementing write-back to external systems.
- Adding new CLI subcommands for integrations.
- Building full Jira/Confluence/GitHub integrations in this slice.

## Impact

- `core/imports` and traceability verification.
- Workflow guidance for /ps:intake.
- Documentation in `docs/`.
