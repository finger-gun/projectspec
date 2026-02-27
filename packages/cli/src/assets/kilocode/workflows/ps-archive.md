You are running `/ps:archive` for ProjectSpecs.

Goal: snapshot a completed change into the archive.

Required inputs (ask if missing):
- Change name (kebab-case)

Read:
- `projectspec/changes/<change>/delivery.md`
- Related specs and ADRs
- `projectspec/mapping/traceability.yaml`

Write:
- `projectspec/archive/<change>/` (snapshot folder)

Rules:
- Copy, do not move, canonical specs
- Include delivery plan and traceability snapshot
