## Purpose

Define MVP integration boundaries and write-back gating.

## Requirements

### Requirement: Read-only integration mode
The system SHALL support read-only imports for Jira, Confluence, and GitHub Projects in the MVP.

#### Scenario: Import data from an integration
- **WHEN** a user runs an import workflow
- **THEN** the system stores imported data under `projectspec/sources/imported/`

### Requirement: Write-back gating
The system SHALL require explicit enablement for any write-back behavior to external tools.

#### Scenario: Write-back disabled by default
- **WHEN** an integration is configured without write-back enabled
- **THEN** the system does not modify external systems

### Requirement: Integration audit trail
The system SHALL record changes resulting from integrations in the change history.

#### Scenario: Integration change logged
- **WHEN** an import or write-back runs
- **THEN** the system records the activity in the change artifacts
