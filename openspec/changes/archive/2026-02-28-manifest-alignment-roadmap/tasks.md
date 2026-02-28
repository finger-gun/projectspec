## 1. Import Registry

- [x] 1.1 Define registry schema for `projectspec/sources/imported/index.yaml`
- [x] 1.2 Implement read/write helpers for the registry
- [x] 1.3 Add tests for registry serialization and default handling

## 2. Import Adapter Contract

- [x] 2.1 Define adapter interface and snapshot output metadata
- [x] 2.2 Update core import helper to write timestamped snapshots and registry entries
- [x] 2.3 Add tests for adapter output and snapshot path conventions

## 3. Drift Verification

- [x] 3.1 Extend verify to detect missing registry entries and stale imports
- [x] 3.2 Add tests for import drift detection scenarios

## 4. Workflow and Docs

- [x] 4.1 Update /ps:intake guidance to reference the import registry
- [x] 4.2 Document the import pipeline and registry format in docs
- [x] 4.3 Run lint, test, and coverage gates
