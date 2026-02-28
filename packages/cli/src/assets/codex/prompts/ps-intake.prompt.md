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

Required inputs (ask if missing): domain, sources.

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
