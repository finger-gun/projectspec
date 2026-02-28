## Purpose

Define read-only Jira snapshots and registry provenance metadata.

## Requirements

### Requirement: Jira snapshot export
The system SHALL produce a Jira snapshot file under `projectspec/sources/imported/jira/<timestamp>/jira.json` containing epics, stories, and key fields.

#### Scenario: Snapshot created
- **WHEN** the Jira adapter runs
- **THEN** a JSON snapshot is written to a timestamped Jira import directory

### Requirement: Jira provenance metadata
The system SHALL record Jira provenance metadata in the import registry entry for Jira imports.

#### Scenario: Provenance captured
- **WHEN** a Jira snapshot is registered
- **THEN** the registry includes instance URL, project key, and query metadata
