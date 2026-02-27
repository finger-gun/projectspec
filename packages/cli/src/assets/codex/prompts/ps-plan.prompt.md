---
description: ProjectSpecs plan workflow
---

Run `/ps:plan` to create delivery plans and traceability links.

Required inputs (ask if missing): change name, scope summary.

Read:
- `projectspec/specs/domains/**/requirements.md`
- `projectspec/specs/architecture/context.md`
- `projectspec/mapping/traceability.yaml`

Write:
- `projectspec/changes/<change>/delivery.md`
- `projectspec/mapping/traceability.yaml`

Traceability example:

requirements:
  REQ-APP-0001:
    - CHG-APP-0001
    - JIRA-123
decisions:
  ADR-0001:
    - CHG-APP-0001
