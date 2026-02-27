## Why

ProjectSpecs already defines a canonical source of truth, but AI tools can drift when their prompts are updated manually. We need automated tool bundles so every tool stays aligned as specs evolve.

## What Changes

- Add generation of tool-specific bundles from canonical specs into `projectspec/exports/<tool>/`.
- Make `projectspec update` re-sync tool bundles and prune obsolete export artifacts.
- Mirror tool bundles into harness-specific locations (e.g., `.kilocode/`, `.github/`, `.codex/`).
- Document how tool bundles are produced and where they live.

## Capabilities

### New Capabilities
- `tool-distribution`: Generate and maintain tool-specific bundles from canonical specs with sync and pruning behavior.

### Modified Capabilities

## Non-Goals

- No new integrations with external AI platforms beyond bundled outputs.
- No changes to how canonical specs are authored or validated.

## Impact

- CLI update workflow (export generation and pruning hooks).
- Exported artifacts in `projectspec/exports/` for KiloCode/Copilot/Codex.
- Harness-specific prompt locations for each tool.
- Documentation and tests for bundle generation consistency.
