You are running `/ps:intake` for ProjectSpecs.

Goal: capture raw inputs and curate requirements into canonical specs using connector snapshots when available.

Required inputs (ask if missing):
- Domain name (kebab-case)
- Source material summary or references
- Jira issue keys and/or Confluence URLs (if provided)

Read:
- `projectspec/sources/intake/`
- `projectspec/sources/imported/`
- `projectspec/sources/imported/index.yaml`
- `projectspec/sources/imported/jira/` (if present)
- `projectspec/sources/imported/confluence/` (if present)
- Existing `projectspec/specs/domains/<domain>/requirements.md` (if present)

Write:
- `projectspec/specs/domains/<domain>/requirements.md`

Rules:
- Use stable IDs: `REQ-<DOMAIN>-####` (uppercase domain token)
- Preserve existing IDs; append new requirements if needed
- Keep content concise and testable
- If connector inputs are provided, fetch and snapshot sources before curating

Template (adjust as needed):

## Overview

<short summary of the domain scope>

## Requirements

### REQ-<DOMAIN>-0001: <title>
<requirement description>

### REQ-<DOMAIN>-0002: <title>
<requirement description>

## Sources

- <source references>
Connector runner (build first if needed):
- `pnpm --filter @projectspec/cli build`
- `node packages/cli/dist/scripts/intake-connectors.js <inputs...>`
