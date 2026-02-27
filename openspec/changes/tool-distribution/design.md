## Context

ProjectSpecs uses a canonical `projectspec/` folder as the source of truth, but AI tool prompts are currently updated manually. We need a repeatable, deterministic export pipeline that generates tool-specific bundles and keeps them synchronized when the canonical specs change.

## Goals / Non-Goals

**Goals:**
- Generate deterministic tool-specific bundles from canonical specs into `projectspec/exports/<tool>/`.
- Integrate bundle generation and pruning into the existing update workflow.
- Provide a clear manifest or index to determine what to prune on re-sync.
- Sync tool bundles into harness-specific locations so `/ps:*` prompts are available in each tool.

**Non-Goals:**
- No changes to canonical spec authoring or validation rules.
- No direct publishing to external AI platforms.

## Decisions

- **Export pipeline integrated into update**: Hook export generation into `projectspec update` so bundles stay aligned.
  - Alternatives considered: a separate `projectspec export` command only. Rejected because it allows drift unless users remember to run it.

- **Per-tool export directories with manifest**: Each tool bundle lives at `projectspec/exports/<tool>/` with a manifest describing generated artifacts and inputs.
  - Alternatives considered: a single combined export folder, or relying on file globs for pruning. Rejected because tool outputs differ and pruning needs a stable inventory.

- **Mirror bundles into harness locations**: After export generation, copy outputs to tool-specific locations (`.kilocode/`, `.github/`, `.codex/`) without deleting non-generated files.
  - Alternatives considered: symlinks or only exporting under `projectspec/exports/`. Rejected because symlinks can be unreliable across platforms and tools need their expected directories populated.

- **Deterministic generation with stable ordering**: Ensure bundles are reproducible by sorting inputs and normalizing output formatting.
  - Alternatives considered: best-effort generation without ordering guarantees. Rejected due to noisy diffs and hard-to-verify sync.

- **Pruning based on manifest**: On update, remove exported files no longer produced by current inputs.
  - Alternatives considered: wiping the entire export folder. Rejected to avoid unnecessary churn for large bundles and to allow future partial exports.

## Risks / Trade-offs

- **Risk:** Export output becomes large or slow to generate. → **Mitigation:** Incremental generation using manifest diffs and cached inputs when feasible.
- **Risk:** Tool-specific formatting diverges from expectations. → **Mitigation:** Validate bundles with unit tests and sample fixtures per tool.
- **Trade-off:** Tight coupling to update flow could slow `projectspec update`. → **Mitigation:** Allow a flag to skip exports if needed, but default to on.
- **Risk:** Pruning could delete non-managed files in target tool directories. → **Mitigation:** Prune only files listed in the export manifest.

## Migration Plan

- Add export pipeline and manifest generation.
- Update `projectspec update` to call the export pipeline and prune obsolete artifacts.
- Add documentation for tool bundles and location.
- Add/adjust tests for deterministic output and pruning behavior.
- Update tool targets for harness-specific directories and verify installation behavior.

## Open Questions

- Do we need a separate `projectspec export` command in addition to update, or is update-only sufficient?
- What is the minimal manifest schema needed for pruning and traceability?
