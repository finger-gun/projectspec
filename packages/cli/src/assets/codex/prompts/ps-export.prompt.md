---
description: ProjectSpecs export workflow
---

Run `/ps:export` to generate a tool-ready bundle.

Required inputs (ask if missing): target, scope.

Read:
- `projectspec/specs/**`
- `projectspec/changes/<change>/delivery.md` (if provided)
- `projectspec/mapping/traceability.yaml`

Write:
- `projectspec/exports/<target>/`

Include a `manifest.json` with metadata and included files.
