## ADDED Requirements

### Requirement: User-home connector config store
The system SHALL store connector credentials and metadata in a user-home config file under `~/.projectspec/config.yaml`.

#### Scenario: Home config written
- **WHEN** a user completes connector setup
- **THEN** the connector data is stored under the user-home config file

### Requirement: Per-project connector mapping
The system SHALL associate connector configuration with a `projectId` stored in `projectspec/config.yaml`.

#### Scenario: Project mapping created
- **WHEN** a workspace is initialized
- **THEN** the `projectId` is written to `projectspec/config.yaml` and used to look up connectors in the home config

### Requirement: Connector property metadata
The system SHALL define required connector properties so the CLI can prompt for missing values.

#### Scenario: Required properties exposed
- **WHEN** a connector is selected
- **THEN** the CLI reads its required properties and prompts the user for values
