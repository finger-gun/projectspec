## Context

ProjectSpecs already treats `projectspec/` as the local-first, canonical source of truth. The change introduces /ps:* prompt workflows that produce and maintain requirements, architecture, delivery planning, exports, verification, and archive artifacts without adding new CLI subcommands. This must stay fully typed, CLI-first, and compatible with existing workflows and integrations.

## Goals / Non-Goals

**Goals:**
- Provide agent-driven /ps:* workflows that write deterministic artifacts in `projectspec/`.
- Preserve traceability across requirements, architecture decisions, plans, and exports.
- Keep workflows readable, testable, and aligned with existing OpenSpec conventions.

**Non-Goals:**
- Adding new CLI subcommands or replacing existing OpenSpec flows.
- Writing back to external systems (Jira/Confluence/GitHub Projects).
- Changing the on-disk ProjectSpecs layout outside the specified paths.

## Decisions

- Implement /ps:* as prompt-level workflows rather than CLI subcommands.
  - Rationale: meets “no new subcommands” constraint and leverages existing agent prompt routing.
  - Alternatives: add dedicated CLI commands or a separate server process.

- Use deterministic file outputs in `projectspec/` with explicit paths per workflow.
  - Rationale: keeps artifacts discoverable, stable for tooling, and diff-friendly.
  - Alternatives: generate outputs in temporary locations and sync later.

- Centralize traceability updates in `projectspec/mapping/traceability.yaml`.
  - Rationale: single authoritative map for REQ/ADR/Change relationships and drift checks.
  - Alternatives: embed links only in Markdown or generate separate index files per domain.

- Implement verification as drift detection over links and file presence.
  - Rationale: aligns with traceability goals and enables deterministic checks.
  - Alternatives: only check file timestamps or rely on user confirmation.

- Keep export generation as a pure build step producing `projectspec/exports/<target>/` bundles.
  - Rationale: avoids side effects in core specs while enabling tool-ready outputs.
  - Alternatives: export in-place or mutate canonical specs for target needs.

## Risks / Trade-offs

- [Risk] Ambiguity in workflow inputs leading to incorrect artifact structure → Mitigation: define minimal required prompts and validate paths/IDs before writing.
- [Risk] Drift checks could be noisy for legacy specs → Mitigation: allow scoped verification and clear reporting of missing links vs. stale content.
- [Risk] Overwriting user edits in specs → Mitigation: merge strategies that append or update by stable IDs, not wholesale rewrite.
- [Risk] Exports may lag behind canonical specs → Mitigation: include export provenance and last-built metadata.

## Migration Plan

- Add /ps:* prompt routing and handlers.
- Implement artifact writers for each workflow with stable paths and ID conventions.
- Add traceability mapping updates and drift verification.
- Add export bundling and archive snapshot creation.
- Add tests and documentation updates.
- Rollback: disable /ps:* routing or revert workflow handlers without impacting existing CLI behavior.

## Open Questions

- Do we want a standard ADR template for /ps:design or reuse existing ADR conventions?
- Which export targets should be supported initially (e.g., json, markdown bundle)?
