---
description: ProjectSpecs intake workflow
---

Run `/ps:intake` to curate requirements from connector inputs.

Accept inputs:
- Jira issue keys (e.g. ROSSCRISP-2712)
- Confluence URLs
- Local file paths

Connector runner (build first if needed):
- `pnpm --filter @projectspec/cli build`
- `node packages/cli/dist/scripts/intake-connectors.js <inputs...>`

Required inputs (ask if missing): domain, primary scope or primary source, dependencies.

Read:
- `projectspec/sources/intake/`
- `projectspec/sources/imported/`
- `projectspec/sources/imported/index.yaml`
- `projectspec/sources/imported/jira/` (if present)
- `projectspec/sources/imported/confluence/` (if present)

Write:
- `projectspec/specs/domains/<domain>/requirements.md`

Rules:
- Use IDs `REQ-<DOMAIN>-####`
- Preserve existing IDs and append new requirements

Output template:

## Overview

<summary>

## Requirements

### REQ-<DOMAIN>-0001: <title>
<description>

## Sources

- <source list>
Assumptions:
- If inputs are provided inline, treat the first source as the primary scope and the rest as dependencies.
- If scope is unclear, ask follow-up questions before writing requirements.
- Use `projectspec/workflows/intake-wizard.yaml` for wizard questions.

Wizard (when no inputs are provided):
1) Load questions from `projectspec/workflows/intake-wizard.yaml`.
2) Ask for primary scope description or a single Jira/Confluence/file source.
3) Ask for dependencies/related systems (IDs/URLs/files).
4) Ask for constraints/NFRs if still unclear.
