## 1. Project structure and config

- [ ] 1.1 Define the canonical `projectspec/` layout and required files in CLI scaffolding logic
- [ ] 1.2 Generate a default `config.yaml` aligned to the core profile

## 2. CLI command surface

- [ ] 2.1 Implement `projectspec init` to create the layout and config
- [ ] 2.2 Implement `projectspec update` to regenerate skills/commands and prune disabled workflows
- [ ] 2.3 Wire workflow commands (`/ps:intake`, `/ps:design`, `/ps:plan`, `/ps:export`, `/ps:verify`, `/ps:archive`)

## 3. Profiles and workflow generation

- [ ] 3.1 Add profile selection logic with a default `core` profile
- [ ] 3.2 Implement artifact generation filtering by profile/workflow
- [ ] 3.3 Implement pruning for deselected workflows

## 4. Traceability core

- [ ] 4.1 Define ID formats for REQ/ADR/INT/Change
- [ ] 4.2 Add `traceability.yaml` read/write utilities
- [ ] 4.3 Implement drift checks for missing links and missing ADRs

## 5. Integration boundaries (MVP)

- [ ] 5.1 Define read-only import workflow inputs/outputs
- [ ] 5.2 Ensure imports store data under `projectspec/sources/imported/`
- [ ] 5.3 Add explicit write-back gating and audit logging in change artifacts
