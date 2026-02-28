---
description: ProjectSpecs verify workflow
---

Run `/ps:verify` to report drift.

Read:
- `projectspec/mapping/traceability.yaml`
- `projectspec/specs/domains/**/requirements.md`
- `projectspec/specs/architecture/**/*.md`

Report:
- Requirements or ADRs with no linked work items
- Traceability entries for missing IDs
- IDs present in specs but missing traceability entries
