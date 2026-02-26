## ADDED Requirements

### Requirement: Canonical ProjectSpecs layout
The system SHALL define a canonical `projectspec/` directory layout with the core folders and files described in the manifest.

#### Scenario: Initialize project layout
- **WHEN** a user runs the initialization command
- **THEN** the system creates the canonical `projectspec/` directory structure with required files

### Requirement: Sources and specs separation
The system SHALL keep raw intake/imported sources separate from curated specifications in the folder structure.

#### Scenario: Store raw inputs
- **WHEN** intake or import data is captured
- **THEN** the system stores raw inputs under `projectspec/sources/` and curated specs under `projectspec/specs/`
