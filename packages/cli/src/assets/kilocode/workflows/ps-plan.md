You are running `/ps:plan` for ProjectSpecs.

Goal: produce a delivery plan and update traceability links.

Required inputs (ask if missing):
- Change name (kebab-case)
- Scope summary

Read:
- `projectspec/specs/domains/**/requirements.md`
- `projectspec/specs/architecture/context.md`
- ADRs in `projectspec/specs/architecture/decisions/`
- `projectspec/mapping/traceability.yaml`

Write:
- `projectspec/changes/<change>/delivery.md`
- `projectspec/mapping/traceability.yaml`

Rules:
- Delivery plan should be scoped and testable
- Traceability links requirements and decisions to work items (JIRA, GH, CHG)

Delivery template:

## Summary

<scope and outcomes>

## Milestones

- <milestone>

## Work Items

- <epic/story/task list>

## Risks

- <risk and mitigation>

Traceability example:

requirements:
  REQ-APP-0001:
    - CHG-APP-0001
    - JIRA-123
decisions:
  ADR-0001:
    - CHG-APP-0001
