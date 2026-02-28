## Context

ProjectSpecs currently sources connector credentials from `.env`, which is unsuitable for global installs and risks leaking secrets into repositories. `projectspec init` already creates `projectspec/config.yaml` for workspace-level settings, but there is no user-scoped config store for sensitive connector data. We need a durable, user-home location to store per-project connector configuration while keeping non-secret settings local to the workspace.

## Goals / Non-Goals

**Goals:**
- Introduce a user-home config store at `~/.projectspec/` for sensitive connector settings.
- Link each ProjectSpecs workspace to a stable `projectId` stored in `projectspec/config.yaml`.
- Extend `projectspec init` to collect harness + connector selections and required connector properties, persisting them under the `projectId`.
- Provide a connector metadata model for required properties and prompt sourcing.

**Non-Goals:**
- Automatic migration of existing `.env` values.
- Adding new connector types beyond Jira/Confluence.
- Replacing project-local `projectspec/config.yaml` for non-secret settings.

## Decisions

- **Decision: Persist a `projectId` in `projectspec/config.yaml`.**
  - Rationale: Provides a stable, repo-local key to look up user-home secrets without relying on file paths.
  - Alternatives considered:
    - Use absolute repo path as key (rejected: breaks with repo moves/renames).
    - Derive key from Git remote (rejected: not always present or stable).

- **Decision: Store connector secrets in `~/.projectspec/config.yaml` keyed by `projectId`.**
  - Rationale: Centralized, user-scoped storage avoids per-repo secret leakage while supporting multiple projects.
  - Alternatives considered:
    - Per-project hidden file in repo (rejected: still checked into source control risk).
    - OS keychain (rejected for MVP due to platform variability and complexity).

- **Decision: Add connector metadata to adapter definitions for required properties.**
  - Rationale: Allows the CLI to prompt for connector-specific fields without hardcoding per-connector logic.
  - Alternatives considered:
    - Maintain a separate connector registry file (deferred: adds another source of truth).

- **Decision: Keep `projectspec/config.yaml` for non-secret settings and references only.**
  - Rationale: Preserves existing behavior and keeps secrets out of repo while retaining local configuration.
  - Alternatives considered:
    - Move all config to user-home (rejected: reduces portability for non-secret config).

## Risks / Trade-offs

- [Risk] Users may delete home config and lose connector settings → Mitigation: document backup guidance and add clear error messaging when credentials are missing.
- [Risk] Multiple workspaces could accidentally share a `projectId` if copied → Mitigation: generate a new `projectId` on init; add optional validation to warn on duplicates.
- [Risk] CLI prompts grow as connectors expand → Mitigation: metadata-driven prompts and per-connector validation.
- [Trade-off] User-home config is less portable across machines → Mitigation: document re-init steps and allow re-entry of credentials.

## Migration Plan

- On `projectspec init`, generate `projectId`, write to `projectspec/config.yaml`, then collect connector data and persist under `~/.projectspec/config.yaml`.
- For existing workspaces, add a lightweight upgrade path: if `projectId` missing, generate and prompt for connector re-entry on next init/update.
- Rollback: remove the home config entry and fall back to existing behavior (no secrets), requiring re-init.

## Open Questions

- Should the home config be split per project into separate files (e.g., `~/.projectspec/projects/<projectId>.yaml`) instead of a single config?
- Do we want an optional deterministic `projectId` derived from repo metadata to aid migration?
