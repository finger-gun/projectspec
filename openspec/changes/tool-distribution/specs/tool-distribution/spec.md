## ADDED Requirements

### Requirement: Generate tool bundles
The system SHALL generate tool-specific bundles from canonical specs into `projectspec/exports/<tool>/` for each supported tool (KiloCode, Copilot, Codex).

#### Scenario: Bundles created for supported tools
- **WHEN** a bundle generation run completes
- **THEN** each supported tool has an export directory with generated artifacts

### Requirement: Re-sync on update
The system SHALL re-generate tool bundles as part of `projectspec update` using the current canonical specs.

#### Scenario: Update reflects spec changes
- **WHEN** a canonical spec is changed and `projectspec update` runs
- **THEN** the corresponding tool bundle outputs reflect the new spec content

### Requirement: Prune obsolete exports
The system SHALL prune previously generated export artifacts that are no longer produced by the current bundle generation.

#### Scenario: Obsolete exports are removed
- **WHEN** a previously generated artifact is no longer produced by the current inputs
- **THEN** the obsolete artifact is removed from the tool export directory

### Requirement: Sync to harness locations
The system SHALL copy tool bundle outputs into the harness-specific locations so `/ps:*` prompts are available in each tool.

#### Scenario: Harness locations updated
- **WHEN** tool bundles are generated during `projectspec update`
- **THEN** the harness directories contain the corresponding tool outputs

### Requirement: Preserve non-managed harness files
The system SHALL prune only files it previously generated and SHALL NOT delete unrelated files in tool harness directories.

#### Scenario: Pruning does not remove unrelated files
- **WHEN** pruning runs for a tool harness directory
- **THEN** files not listed in the tool export manifest remain intact

### Requirement: Export manifest
The system SHALL write a manifest for each tool bundle that lists generated artifacts and the canonical spec inputs used.

#### Scenario: Manifest updated on generation
- **WHEN** a tool bundle is generated
- **THEN** the manifest lists the generated files and input identifiers for that run

### Requirement: Deterministic output
The system SHALL produce deterministic outputs for a given set of canonical specs.

#### Scenario: Identical inputs yield identical outputs
- **WHEN** bundle generation runs twice with unchanged canonical specs
- **THEN** the generated artifacts are identical
