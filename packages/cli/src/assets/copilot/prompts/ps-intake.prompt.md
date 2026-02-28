---
description: ProjectSpecs intake workflow
---

Run `/ps:intake` to curate requirements.

Required inputs (ask if missing): domain, sources.

Read:
- `projectspec/sources/intake/`
- `projectspec/sources/imported/`
- `projectspec/sources/imported/index.yaml`

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
