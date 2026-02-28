<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# ProjectSpecs Architecture

This document describes how the ProjectSpecs CLI and agent workflows operate today and how they are intended to evolve.

## CLI Responsibilities

- Initialize a canonical `projectspec/` workspace.
- Install workflow prompts and skills for supported tools.
- Generate and prune tool exports.
- Validate traceability drift.

## Runtime Components

- **CLI**: `projectspec` command (Node.js, TypeScript).
- **Project workspace**: `projectspec/` folder as source of truth.
- **Workflows**: agent-driven /ps:* prompts.
- **Exports**: tool-specific bundles and manifests.

## Data Flow Summary

- Inputs (raw and imported) are curated into specs.
- Architecture decisions update context and ADRs.
- Plans produce delivery artifacts and traceability links.
- Exports generate tool-ready bundles.
- Verify reports drift across requirements and decisions.
- Archive snapshots completed changes.

## Sequence Diagrams

### Initialization

```mermaid
sequenceDiagram
  participant User
  participant CLI as projectspec
  participant FS as FileSystem
  participant Tools as Tool Harnesses

  User->>CLI: projectspec init
  CLI->>FS: ensure projectspec/ layout
  CLI->>FS: write config.yaml
  CLI->>FS: generate projectspec/workflows/*.md
  CLI->>Tools: install prompts/skills
  CLI-->>User: Initialized ProjectSpecs workspace
```

### Update (Workflows + Exports)

```mermaid
sequenceDiagram
  participant User
  participant CLI as projectspec
  participant FS as FileSystem
  participant Tools as Tool Harnesses

  User->>CLI: projectspec update
  CLI->>FS: regenerate projectspec/workflows/*.md
  CLI->>FS: generate exports in projectspec/exports/<tool>/
  CLI->>FS: write export manifest
  CLI->>Tools: sync prompts/skills/exports
  CLI->>Tools: prune obsolete generated files
  CLI-->>User: Updated ProjectSpecs workflows
```

### /ps:intake Workflow

```mermaid
sequenceDiagram
  participant User
  participant Agent
  participant FS as FileSystem

  User->>Agent: /ps:intake domain=payments
  Agent->>FS: read projectspec/sources/intake/
  Agent->>FS: read projectspec/sources/imported/
  Agent->>FS: write projectspec/specs/domains/payments/requirements.md
  Agent-->>User: Intake complete
```

### /ps:plan Workflow

```mermaid
sequenceDiagram
  participant User
  participant Agent
  participant FS as FileSystem

  User->>Agent: /ps:plan change=ps-workflows
  Agent->>FS: read specs + ADRs
  Agent->>FS: write projectspec/changes/ps-workflows/delivery.md
  Agent->>FS: update projectspec/mapping/traceability.yaml
  Agent-->>User: Plan complete
```

### /ps:verify Workflow

```mermaid
sequenceDiagram
  participant User
  participant CLI as projectspec
  participant FS as FileSystem

  User->>CLI: projectspec verify
  CLI->>FS: read projectspec/mapping/traceability.yaml
  CLI->>FS: scan requirements + ADRs
  CLI-->>User: Drift report (missing links / stale IDs)
```

## Future Architecture Work

- Read-only integrations for Jira/Confluence/GitHub Projects into `projectspec/sources/imported/`.
- Stronger traceability utilities for REQ/ADR/INT/CHG IDs.
- Export manifests with provenance and bundle metadata.
- Drift verification across integrations and contracts.

See `docs/imports.md` for the import pipeline and registry format.
