## Why

The import registry now exists, but without a real integration adapter the workflow still relies on manual snapshots. A Jira read-only adapter validates the pipeline end-to-end and unlocks realistic intake from enterprise sources.

## What Changes

- Add a Jira read-only adapter that snapshots epics/stories and key fields into `projectspec/sources/imported/jira/<timestamp>/`.
- Capture provenance metadata (instance URL, project key, query) in the import registry.
- Update intake guidance to consume Jira snapshots and registry metadata.

## Capabilities

### New Capabilities
- `jira-readonly-import`: Read-only Jira snapshot adapter producing registry-backed imports.

### Modified Capabilities
- `integration-imports`: Include Jira-specific provenance fields in registry entries.

## Non-Goals

- Jira write-back or issue updates.
- Full mapping of every Jira field or custom schema support.
- New CLI subcommands for integrations.

## Impact

- `core/imports` adapter registry and metadata schema.
- Documentation for import usage and Jira snapshot expectations.
