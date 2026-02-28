## Why

Current connector credentials are sourced from `.env`, which breaks for global installs and leaks per-project secrets into repos. We need a durable, user-scoped config store that can be initialized per ProjectSpecs workspace.

## What Changes

- Add user-home config store under `~/.projectspec/` for sensitive connector settings.
- Extend `projectspec init` to ask for harness + connector selections and capture required connector properties.
- Create per-project config entries keyed by the initialized workspace.

## Capabilities

### New Capabilities
- `connector-config`: user-home config storage and per-project connector definitions, including required metadata for prompts.

### Modified Capabilities
- `core-commands`: `projectspec init` collects connector choices and required properties, and persists them to the user-home config.

## Impact

- CLI init flow, connector adapter metadata, config loading/resolution.
- Documentation updates for setup and credential storage.

## Non-Goals

- Migrate existing `.env` data automatically.
- Add write-back or new connector types beyond Jira/Confluence.
- Replace project-local `projectspec/config.yaml` for non-secret settings.
