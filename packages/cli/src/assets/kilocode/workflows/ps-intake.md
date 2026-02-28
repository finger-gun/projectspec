You are running `/ps:intake` for ProjectSpecs.

Goal: capture raw inputs and curate requirements into canonical specs using connector snapshots when available.

Required inputs (ask if missing):
- Domain name (kebab-case)
- Primary scope description or a single primary source (Jira key / Confluence URL / file)
- Dependencies or supplementary sources (Jira keys / URLs / files)

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
- If inputs are provided inline, treat the first source as primary and the rest as dependencies
- If scope is unclear, ask clarification questions before writing requirements
- Use wizard questions from `projectspec/workflows/intake-wizard.yaml` when running interactively

Wizard (if no inputs provided):
1. Load questions from `projectspec/workflows/intake-wizard.yaml`.
2. Ask for the primary scope.
3. Ask for dependencies or related systems.
4. Ask for constraints/NFRs if still unclear.

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
