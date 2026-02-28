## Why

Intake currently depends on manual imports, which breaks the “production-grade” promise and slows teams that already live in Jira/Confluence. Connector-driven intake makes /ps-intake actionable by fetching sources directly and producing consistent snapshots.

## What Changes

- Add connector-driven /ps-intake inputs that accept Jira issue IDs, Confluence URLs, and local file paths.
- Use Jira and Confluence connectors to fetch and snapshot source content into `projectspec/sources/imported/`.
- Update intake workflow guidance to prefer connector snapshots and registry metadata.

## Capabilities

### New Capabilities
- `intake-connectors`: Connector-driven /ps-intake inputs that fetch Jira/Confluence sources and snapshot them for intake.

### Modified Capabilities
- `integration-imports`: Include Confluence provenance metadata in registry entries.

## Non-Goals

- Write-back to Jira or Confluence.
- New CLI subcommands.
- Full schema coverage for every Jira/Confluence field.

## Impact

- Connector modules for Jira/Confluence and import registry metadata.
- /ps-intake workflow guidance and documentation.
