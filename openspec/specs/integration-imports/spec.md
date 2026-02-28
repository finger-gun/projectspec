## Purpose

Define the read-only import pipeline, registry, and drift checks for external integrations.

## Requirements

### Requirement: Import registry
The system SHALL maintain an import registry at `projectspec/sources/imported/index.yaml` that records imported sources and their metadata.

#### Scenario: Registry entry created
- **WHEN** a new import snapshot is produced for source `jira`
- **THEN** the registry contains an entry for `jira` with snapshot path and timestamp

### Requirement: Import adapter contract
The system SHALL define a minimal adapter contract that produces a snapshot path and registry entry for a given source.

#### Scenario: Adapter returns snapshot and metadata
- **WHEN** an adapter runs for source `confluence`
- **THEN** it returns the snapshot location and metadata required for registry updates

### Requirement: Immutable snapshots
The system SHALL treat imported source snapshots as immutable, storing them under `projectspec/sources/imported/<source>/<timestamp>/`.

#### Scenario: Snapshot path includes timestamp
- **WHEN** an import runs for source `github`
- **THEN** the snapshot is stored in a timestamped directory under `projectspec/sources/imported/github/`

### Requirement: Import audit logging
The system SHALL record import activity for each snapshot in the audit history.

#### Scenario: Audit entry recorded
- **WHEN** an import completes
- **THEN** an audit entry is appended with source and timestamp

### Requirement: Import drift checks
The system SHALL report drift when registry entries are missing or stale relative to imported snapshots.

#### Scenario: Missing registry entry
- **WHEN** snapshots exist for a source but no registry entry exists
- **THEN** drift reporting includes a missing registry warning
