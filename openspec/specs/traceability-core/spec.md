## Purpose

Define the traceability model, stable identifiers, and drift detection.

## Requirements

### Requirement: Stable identifiers
The system SHALL define stable identifiers for requirements, decisions, integration contracts, and changes.

#### Scenario: New requirement gets a stable ID
- **WHEN** a requirement is added to curated specs
- **THEN** the system assigns a stable ID following the defined format (e.g., `REQ-<domain>-####`)

### Requirement: Traceability map
The system SHALL maintain a `traceability.yaml` that maps requirements to epics, stories, ADRs, and tests.

#### Scenario: Traceability updated
- **WHEN** a delivery plan is generated or updated
- **THEN** the system updates `traceability.yaml` to link REQs to work items

### Requirement: Drift detection
The system SHALL detect missing or stale links between requirements and downstream artifacts.

#### Scenario: Drift reported
- **WHEN** verification runs
- **THEN** the system reports requirements without linked work items or missing ADRs
