## 1. Workflow Routing

- [x] 1.1 Identify /ps:* prompt entry points in the CLI/agent routing layer
- [x] 1.2 Implement routing for /ps:intake, /ps:design, /ps:plan, /ps:export, /ps:verify, /ps:archive
- [x] 1.3 Add input validation for required parameters (domain, change, target)
- [x] 1.4 Verify routing with unit tests for each /ps command

## 2. Artifact Writers

- [x] 2.1 Implement /ps:intake writer for `projectspec/specs/domains/<domain>/requirements.md`
- [x] 2.2 Implement /ps:design writer for `projectspec/specs/architecture/context.md` and ADR files
- [x] 2.3 Implement /ps:plan writer for `projectspec/changes/<change>/delivery.md`
- [x] 2.4 Implement /ps:export bundling to `projectspec/exports/<target>/`
- [x] 2.5 Implement /ps:archive snapshot to `projectspec/archive/<change>/`
- [x] 2.6 Verify artifact writes with filesystem-focused tests

## 3. Traceability and Drift

- [x] 3.1 Implement traceability updates in `projectspec/mapping/traceability.yaml`
- [x] 3.2 Implement /ps:verify drift detection over links and stale specs
- [x] 3.3 Add drift report output formatting and exit status
- [x] 3.4 Verify drift detection with fixture-based tests

## 4. Documentation and QA

- [x] 4.1 Update README/docs with /ps:* workflow usage and outputs
- [x] 4.2 Add end-to-end workflow test for a minimal spec cycle
- [x] 4.3 Run lint and unit tests for the new workflows
