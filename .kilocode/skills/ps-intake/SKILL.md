---
name: ps-intake
description: ProjectSpecs /ps:intake workflow.
---

# /ps:intake

Capture raw inputs and curate requirements from connectors and files.

Outputs:
- projectspec/specs/domains/<domain>/requirements.md

Steps:
1. If no inputs, run a short wizard based on projectspec/workflows/intake-wizard.yaml.
2. If inputs provided, treat the first source as primary and the rest as dependencies.
3. Classify inputs (Jira keys, Confluence URLs, file paths).
4. Use connectors to fetch Jira/Confluence and write snapshots into projectspec/sources/imported/.
5. Review projectspec/sources/imported/index.yaml for available snapshots.
6. Extract requirements, assign stable IDs (REQ-<DOMAIN>-####).
7. Prefer snapshots under projectspec/sources/imported/jira/ and confluence/ when available.
8. Write requirements.md with a concise summary and requirement list.
9. If env vars are missing, use connector settings from ~/.projectspec/config.yaml.

Connector runner:
- node packages/cli/dist/scripts/intake-connectors.js <inputs...>
