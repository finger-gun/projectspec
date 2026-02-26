## Context

ProjectSpecs is establishing a baseline specification layer and CLI, modeled after OpenSpec mechanics, to keep enterprise requirements and architecture artifacts coherent. The initial scope is local-first with read-only integrations and a minimal traceability engine. The change introduces a canonical folder layout, a small command surface, and profile/workflow-driven generation of artifacts and tool bundles.

## Goals / Non-Goals

**Goals:**
- Define a stable `projectspec/` layout and the minimum viable data model (REQ/ADR/INT/Change).
- Specify CLI command behavior for `init`, `update`, and workflow commands (`/ps:intake`, `/ps:design`, `/ps:plan`, `/ps:export`, `/ps:verify`, `/ps:archive`).
- Establish profile/workflow selection rules and how generators prune or refresh artifacts.
- Define MVP integration scope (read-only) and constraints for future write-back.

**Non-Goals:**
- Implementing actual Jira/Confluence/GitHub connectors in this change.
- Designing a UI or replacing existing PM tools.
- Defining a full governance/compliance policy set.

## Decisions

- **Local-first canonical layout**: Use the `projectspec/` folder structure from `docs/manifest.md` as the contract. This ensures all downstream exports are derived from a single source of truth.
- **CLI-first distribution**: The CLI is the primary interface for initializing, updating, and exporting artifacts, aligning with OpenSpec’s proven mechanics.
- **Profiles over phases**: Profiles/workflows enable optional behavior without gating actions. This preserves the “actions, not phase gates” philosophy and supports selective generation/pruning.
- **Minimal traceability core**: Start with stable IDs and a single `traceability.yaml` map, enabling drift checks without over-constraining intake.
- **Read-only integrations in MVP**: Import-only reduces risk and scope while still delivering immediate enterprise value; write-back remains a phase 2 decision.

## Risks / Trade-offs

- **Scope creep from integrations** → Mitigation: lock MVP to read-only imports and record explicit boundaries in specs.
- **Over-prescriptive structure for diverse teams** → Mitigation: allow profiles/workflows to tailor generation, keep core layout minimal.
- **Traceability rigor slows adoption** → Mitigation: keep ID rules minimal and allow iterative enrichment.
