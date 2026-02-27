---
name: projectspec-workflows
description: Agent workflows for ProjectSpecs.
---

Use these workflows to guide ProjectSpecs actions and produce canonical artifacts:

- /ps:intake: curate requirements into `projectspec/specs/domains/<domain>/requirements.md`
- /ps:design: update `projectspec/specs/architecture/context.md` and ADRs in `projectspec/specs/architecture/decisions/`
- /ps:plan: write `projectspec/changes/<change>/delivery.md` and update `projectspec/mapping/traceability.yaml`
- /ps:export: generate bundles in `projectspec/exports/<target>/`
- /ps:verify: report drift (missing links, stale IDs)
- /ps:archive: snapshot completed changes into `projectspec/archive/<change>/`

Rules:
- Keep artifacts concise and human-readable
- Preserve stable IDs (REQ-*, ADR-*, CHG-*)
- Do not add new CLI subcommands for these workflows
