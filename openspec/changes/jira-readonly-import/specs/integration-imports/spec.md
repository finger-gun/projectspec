## MODIFIED Requirements

### Requirement: Import registry
The system SHALL maintain an import registry at `projectspec/sources/imported/index.yaml` that records imported sources and their metadata.

#### Scenario: Registry entry created
- **WHEN** a new import snapshot is produced for source `jira`
- **THEN** the registry contains an entry for `jira` with snapshot path and timestamp

#### Scenario: Jira provenance captured
- **WHEN** a Jira snapshot is registered
- **THEN** the registry includes instance URL, project key, and query metadata
