## ADDED Requirements

### Requirement: Initialize ProjectSpecs workspace
The system SHALL provide a `projectspec init` command that creates the canonical folder layout and a base `config.yaml`.

#### Scenario: Init creates baseline structure
- **WHEN** a user runs `projectspec init` in a repository
- **THEN** the system creates the canonical layout and writes a default `config.yaml`

### Requirement: Update generated artifacts
The system SHALL provide a `projectspec update` command that regenerates skills/commands and prunes deselected workflows.

#### Scenario: Update refreshes and prunes
- **WHEN** a user runs `projectspec update`
- **THEN** the system regenerates tool bundles and removes artifacts for disabled workflows

### Requirement: Workflow commands
The system SHALL expose workflow commands that drive intake, design, planning, export, verification, and archive steps.

#### Scenario: Workflow command available
- **WHEN** a user invokes a workflow command (e.g., `/ps:intake`)
- **THEN** the system runs the corresponding workflow generator
