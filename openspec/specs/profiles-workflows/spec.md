## Purpose

Define how profiles and workflows control artifact generation.

## Requirements

### Requirement: Profile selection
The system SHALL support profiles that enable or disable workflow capabilities.

#### Scenario: Profile enables workflows
- **WHEN** a profile is selected in configuration
- **THEN** only the workflows and artifacts for that profile are generated

### Requirement: Workflow pruning
The system SHALL prune generated artifacts for workflows that are deselected.

#### Scenario: Disabled workflow artifacts removed
- **WHEN** a profile or workflow is disabled
- **THEN** the system removes previously generated artifacts for that workflow

### Requirement: Default core profile
The system SHALL provide a default `core` profile with the standard workflow set.

#### Scenario: Core profile in use
- **WHEN** no profile is specified
- **THEN** the system uses the `core` profile and its workflows
