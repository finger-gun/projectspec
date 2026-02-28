## Purpose

Define connector-driven /ps-intake inputs and snapshot usage.

## Requirements

### Requirement: Intake connector inputs
The system SHALL accept /ps-intake inputs that include Jira issue keys, Confluence URLs, and local file paths.

#### Scenario: Jira issue key input
- **WHEN** a user runs `/ps-intake ROSSCRISP-2712`
- **THEN** the system treats the input as a Jira source to fetch

#### Scenario: Confluence URL input
- **WHEN** a user provides a Confluence URL
- **THEN** the system treats the input as a Confluence source to fetch

#### Scenario: Local file input
- **WHEN** a user provides a local file path
- **THEN** the system ingests the file as an intake source

### Requirement: Connector snapshots
The system SHALL use connectors to fetch Jira and Confluence sources and store immutable snapshots under `projectspec/sources/imported/<source>/<timestamp>/`.

#### Scenario: Jira snapshot stored
- **WHEN** Jira connector fetch completes
- **THEN** a snapshot is stored under `projectspec/sources/imported/jira/<timestamp>/`

#### Scenario: Confluence snapshot stored
- **WHEN** Confluence connector fetch completes
- **THEN** a snapshot is stored under `projectspec/sources/imported/confluence/<timestamp>/`

### Requirement: Intake uses snapshots
The system SHALL prefer connector snapshots and registry metadata when curating requirements.

#### Scenario: Intake prioritizes snapshots
- **WHEN** snapshots exist for Jira or Confluence
- **THEN** /ps-intake uses the snapshots as primary input

### Requirement: Configurable intake wizard
The system SHALL load intake wizard questions from `projectspec/workflows/intake-wizard.yaml` when /ps-intake runs without inputs.

#### Scenario: Wizard questions loaded
- **WHEN** a user runs `/ps-intake` with no inputs
- **THEN** the wizard prompts are loaded from the config file and asked in order
