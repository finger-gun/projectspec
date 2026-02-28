## Context

The import registry and snapshot pipeline are in place, but there is no real integration adapter to populate Jira data. This change introduces a read-only Jira adapter that writes immutable snapshots and registers provenance metadata without adding new CLI subcommands.

## Goals / Non-Goals

**Goals:**
- Define a Jira adapter that produces snapshots of epics/stories and key fields.
- Capture provenance metadata (instance URL, project key, query) in the registry.
- Update intake guidance and documentation to reference Jira snapshots.

**Non-Goals:**
- Write-back to Jira or issue updates.
- Support every Jira field or custom schemas in the first slice.
- New CLI subcommands.

## Decisions

- Store Jira snapshots as JSON under `projectspec/sources/imported/jira/<timestamp>/jira.json`.
  - Rationale: consistent, structured payload that can be consumed by intake.
  - Alternatives: YAML or multiple files per entity type.

- Add a Jira adapter interface that returns snapshot metadata and provenance fields.
  - Rationale: aligns with the import registry contract and keeps adapters pluggable.
  - Alternatives: embed Jira logic into a generic import helper.

- Keep adapter invocation manual for now (no new CLI command).
  - Rationale: respects the “no new subcommands” constraint while enabling early integration.
  - Alternatives: add a hidden or experimental command.

## Risks / Trade-offs

- [Risk] No CLI entry point reduces discoverability → Mitigation: document adapter usage and expected snapshot format.
- [Risk] Jira API variability across instances → Mitigation: keep field set minimal and configurable via options metadata.
- [Risk] Snapshot size grows quickly → Mitigation: scope to epics/stories and limit fields.

## Migration Plan

- Add Jira adapter module and types.
- Update registry metadata to include Jira provenance fields.
- Add tests for adapter output and registry updates.
- Update /ps:intake guidance and docs.

## Open Questions

- What default Jira query should be recommended for MVP usage?
- Should we include parent/child issue relationships in the snapshot?
