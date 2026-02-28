---
name: projectspec-workflows
description: Agent workflows for ProjectSpecs.
---

Use these workflows to guide ProjectSpecs actions and produce canonical artifacts.

# /ps:archive

Snapshot and archive completed changes.

Outputs:
- projectspec/archive/<change>/

Steps:
1. Copy the change delivery artifacts and related specs.
2. Include traceability.yaml in the snapshot.

# /ps:design

Update architecture context and ADRs.

Outputs:
- projectspec/specs/architecture/context.md
- projectspec/specs/architecture/decisions/ADR-####-<slug>.md

Steps:
1. Review current requirements and architecture context.
2. Update context.md with key constraints and boundaries.
3. Record new decisions as ADRs with rationale and consequences.

# /ps:export

Generate tool-ready bundles without modifying canonical specs.

Outputs:
- projectspec/exports/<target>/

Steps:
1. Collect relevant specs, plans, and traceability data.
2. Write the bundle contents into the target directory.

# /ps:intake

Capture raw inputs and curate requirements from connectors and files.

Outputs:
- projectspec/specs/domains/<domain>/requirements.md

Steps:
1. Classify inputs (Jira keys, Confluence URLs, file paths).
2. Use connectors to fetch Jira/Confluence and write snapshots into projectspec/sources/imported/.
3. Review projectspec/sources/imported/index.yaml for available snapshots.
4. Extract requirements, assign stable IDs (REQ-<DOMAIN>-####).
5. Prefer snapshots under projectspec/sources/imported/jira/ and confluence/ when available.
6. Write requirements.md with a concise summary and requirement list.

Connector runner:
- pnpm --filter @projectspec/cli build
- node packages/cli/dist/scripts/intake-connectors.js <inputs...>

# /ps:plan

Produce delivery plans and update traceability.

Outputs:
- projectspec/changes/<change>/delivery.md
- projectspec/mapping/traceability.yaml

Steps:
1. Summarize scope and milestones in delivery.md.
2. Map requirements and decisions to work items in traceability.yaml.

# /ps:verify

Detect drift and missing traceability links.

Checks:
- Missing links in projectspec/mapping/traceability.yaml
- IDs present in specs but missing traceability entries
- Traceability entries referencing missing IDs
