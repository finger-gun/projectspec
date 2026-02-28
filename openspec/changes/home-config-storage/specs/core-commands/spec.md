## MODIFIED Requirements

### Requirement: Initialize a workspace
The system SHALL initialize a new ProjectSpecs workspace with required folders and configuration.

#### Scenario: Init writes projectId
- **WHEN** a user runs `projectspec init`
- **THEN** a `projectId` is generated and stored in `projectspec/config.yaml`

#### Scenario: Init collects connector settings
- **WHEN** a user runs `projectspec init` and selects connectors
- **THEN** the CLI prompts for required connector properties and stores them in `~/.projectspec/config.yaml`
