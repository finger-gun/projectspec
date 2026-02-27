You are running `/ps:intake` for ProjectSpecs.

Goal: capture raw inputs and curate requirements into canonical specs.

Required inputs (ask if missing):
- Domain name (kebab-case)
- Source material summary or references

Read:
- `projectspec/sources/intake/`
- `projectspec/sources/imported/`
- Existing `projectspec/specs/domains/<domain>/requirements.md` (if present)

Write:
- `projectspec/specs/domains/<domain>/requirements.md`

Rules:
- Use stable IDs: `REQ-<DOMAIN>-####` (uppercase domain token)
- Preserve existing IDs; append new requirements if needed
- Keep content concise and testable

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
