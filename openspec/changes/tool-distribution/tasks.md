## 1. Export Pipeline Foundations

- [x] 1.1 Define tool export manifest schema and TypeScript types
- [x] 1.2 Add tool registry for KiloCode, Copilot, Codex with export and harness paths
- [x] 1.3 Add verification: unit test for manifest serialization stability

## 2. Tool Bundle Generation

- [x] 2.1 Implement canonical spec loader for export inputs with deterministic ordering
- [x] 2.2 Implement bundle generator that writes outputs to `projectspec/exports/<tool>/`
- [x] 2.3 Add verification: unit test to assert deterministic output across runs

## 3. Update Integration and Pruning

- [x] 3.1 Integrate bundle generation into `projectspec update`
- [x] 3.2 Copy exports into harness locations (`.kilocode/`, `.github/`, `.codex/`)
- [x] 3.3 Implement pruning using the manifest to remove obsolete exports and generated harness files only
- [x] 3.4 Add verification: test pruning removes obsolete files and preserves unrelated harness files

## 4. Documentation and CLI Behavior

- [x] 4.1 Document tool bundles and export locations in CLI docs/README
- [x] 4.2 Document harness sync locations and prompt discovery per tool
- [x] 4.3 Add/verify CLI option behavior for skipping exports if needed
- [x] 4.4 Add verification: run lint and unit tests for new export pipeline
