## MODIFIED Requirements

### Requirement: Import registry
The system SHALL maintain an import registry at `projectspec/sources/imported/index.yaml` that records imported sources and their metadata.

#### Scenario: Registry entry created
- **WHEN** a new import snapshot is produced for source `confluence`
- **THEN** the registry contains an entry for `confluence` with snapshot path and timestamp

#### Scenario: Confluence provenance captured
- **WHEN** a Confluence snapshot is registered
- **THEN** the registry includes instance URL, space key, and page IDs metadata
