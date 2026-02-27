## Why

ProjectSpecs needs a consistent, agent-driven way to turn intent into canonical specs and traceability artifacts without manual copy/paste. Adding /ps:* workflows now unblocks end-to-end spec cycles and aligns with the local-first `projectspec/` source of truth.

## What Changes

- Add /ps:* prompt workflows that create and update real artifacts in `projectspec/` (intake, design, plan, export, verify, archive).
- Define deterministic artifact locations and updates for requirements, architecture context/ADRs, delivery plans, traceability, exports, and archive snapshots.
- Provide user-facing documentation for the workflows and expected outputs.

## Capabilities

### New Capabilities
- `ps-workflows`: Agent-driven /ps:* workflows that generate and maintain canonical ProjectSpecs artifacts and traceability.

### Modified Capabilities
- None.

## Non-Goals

- Adding new CLI subcommands for these workflows.
- Implementing write-back to external integrations (Jira/Confluence/GitHub Projects) beyond current read-only scope.

## Impact

- CLI prompt handling for /ps:* flows and artifact writing in `projectspec/`.
- Documentation updates describing workflow usage and outputs.
- Tests for workflow behavior and artifact generation.
