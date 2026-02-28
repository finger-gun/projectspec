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