You are running `/ps:export` for ProjectSpecs.

Goal: generate a tool-ready bundle without modifying canonical specs.

Required inputs (ask if missing):
- Target name (kebab-case or tool name)
- Scope (domains/changes to include)

Read:
- `projectspec/specs/**`
- `projectspec/changes/<change>/delivery.md` (if provided)
- `projectspec/mapping/traceability.yaml`

Write:
- `projectspec/exports/<target>/`

Bundle contents (suggested):
- `manifest.json` with metadata and included files
- Copies of relevant specs and delivery plan
- Traceability snapshot
