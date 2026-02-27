## ADDED Requirements

### Requirement: Workflow routing for /ps commands
The system SHALL recognize /ps:* prompts and route them to the corresponding ProjectSpecs workflow handlers.

#### Scenario: Route intake prompt
- **WHEN** a user issues `/ps:intake` with a description and domain
- **THEN** the system starts the intake workflow and proceeds to create the required artifacts

### Requirement: Intake writes domain requirements
The /ps:intake workflow SHALL write curated requirements to `projectspec/specs/domains/<domain>/requirements.md` using stable requirement IDs.

#### Scenario: Create domain requirements file
- **WHEN** the intake workflow completes for domain `payments`
- **THEN** `projectspec/specs/domains/payments/requirements.md` exists with structured requirements and IDs

### Requirement: Design updates architecture context and ADRs
The /ps:design workflow SHALL update `projectspec/specs/architecture/context.md` and create or update ADR files as needed.

#### Scenario: Record an architectural decision
- **WHEN** design identifies a new architectural decision
- **THEN** an ADR is created or updated in `projectspec/specs/architecture/` and the context is updated

### Requirement: Plan writes delivery plan and traceability
The /ps:plan workflow SHALL write `projectspec/changes/<change>/delivery.md` and update `projectspec/mapping/traceability.yaml` with links between requirements, decisions, and planned work.

#### Scenario: Update delivery plan and traceability
- **WHEN** a planning session completes for change `ps-workflows`
- **THEN** `projectspec/changes/ps-workflows/delivery.md` exists and traceability mappings include the change

### Requirement: Export generates tool-ready bundles
The /ps:export workflow SHALL generate a bundle in `projectspec/exports/<target>/` without modifying canonical specs.

#### Scenario: Export a markdown bundle
- **WHEN** a user runs `/ps:export` with target `markdown`
- **THEN** `projectspec/exports/markdown/` is created with derived artifacts and canonical specs are unchanged

### Requirement: Verify reports drift
The /ps:verify workflow SHALL report drift such as missing links and stale specs based on traceability data.

#### Scenario: Detect missing links
- **WHEN** a requirement lacks a traceability link to a plan or decision
- **THEN** the verification report identifies the missing linkage

### Requirement: Archive snapshots completed changes
The /ps:archive workflow SHALL move completed changes into `projectspec/archive/<change>/` with a snapshot of related specs and traceability context.

#### Scenario: Archive a completed change
- **WHEN** a user runs `/ps:archive` for change `ps-workflows`
- **THEN** `projectspec/archive/ps-workflows/` contains a snapshot of the change artifacts
