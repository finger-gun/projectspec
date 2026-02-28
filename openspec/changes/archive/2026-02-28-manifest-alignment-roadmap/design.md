## Context

The manifest and architecture promise read-only integrations, but the current CLI only provides folder layout and a minimal imports helper without a registry or consistent adapter contract. Workflows (especially /ps:intake) cannot reliably discover imported sources or reason about their freshness. This change introduces a minimal, registry-backed import slice that stays local-first and CLI-subcommand-free.

## Goals / Non-Goals

**Goals:**
- Add a canonical import registry under `projectspec/sources/imported/` to track source metadata.
- Define a minimal adapter contract for read-only imports to write snapshots and update the registry.
- Extend drift checks to report missing registry entries and stale imports.

**Non-Goals:**
- No write-back to external systems.
- No new CLI subcommands for integrations.
- No full Jira/Confluence/GitHub integrations in this slice.

## Decisions

- Store the import registry at `projectspec/sources/imported/index.yaml`.
  - Rationale: keeps registry adjacent to imported snapshots and aligned with local-first layout.
  - Alternatives: store in `projectspec/mapping/` or embed in `traceability.yaml`.

- Define a simple adapter contract (inputs: source name + options; outputs: snapshot path + registry entry).
  - Rationale: enables multiple integrations to share consistent output without new CLI commands.
  - Alternatives: hardcode import formats per integration without shared contract.

- Treat imports as immutable snapshots with timestamps and provenance metadata.
  - Rationale: allows deterministic intake and drift checks without mutating history.
  - Alternatives: in-place updates of a single snapshot per source.

- Extend verify to flag stale registry entries and missing import metadata.
  - Rationale: closes the loop between manifest promise and operational drift signals.
  - Alternatives: keep verify limited to REQ/ADR links only.

## Risks / Trade-offs

- [Risk] Registry schema changes could require migration → Mitigation: version the registry and provide a default migration path.
- [Risk] Snapshot sprawl increases repo size → Mitigation: document retention guidance and allow pruning strategies later.
- [Risk] Ambiguous “stale” definitions → Mitigation: define staleness thresholds as optional metadata and start with informational warnings.

## Migration Plan

- Add registry schema and read/write helpers.
- Update import helper to write registry entries.
- Add verify checks for import registry drift.
- Update workflow guidance and docs.
- Rollback: stop writing registry and skip import drift checks.

## Open Questions

- Should import registry entries include optional schema validation for imported payloads?
- Do we want per-source retention limits for snapshots in this phase?
