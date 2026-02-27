<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="../../docs/assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# ProjectSpecs CLI

This package provides the `projectspec` CLI for initializing and managing ProjectSpecs artifacts.

## Install

This CLI is intended to be built and run from the monorepo during development.

```bash
pnpm --filter @projectspec/cli build
```

## Usage

```bash
projectspec init
projectspec update
projectspec verify
projectspec uninstall
```

## Command reference

### `projectspec init`

Creates the canonical `projectspec/` folder layout and writes a default `projectspec/config.yaml` if it does not exist. Also generates workflow artifacts based on the default profile and installs agent prompts for selected tools.

### `projectspec update`

Regenerates workflow artifacts based on `projectspec/config.yaml`. Creates files for enabled workflows, prunes artifacts for disabled workflows, and syncs tool bundles into harness locations.

Optional flags:
- `--skip-exports`: Skip tool bundle generation and harness sync.

### `projectspec verify`

Runs drift checks against `projectspec/mapping/traceability.yaml` and reports missing links.

### `projectspec uninstall`

Removes the `projectspec/` workspace and any installed agent assets for supported tools. Use `--yes` to skip confirmation.

## Agent workflows

Workflow actions like `/ps:intake`, `/ps:design`, `/ps:plan`, `/ps:export`, `/ps:verify`, and `/ps:archive` are agent prompts, not CLI commands. Use them in your AI tool of choice.

Expected outputs:

- `/ps:intake` -> `projectspec/specs/domains/<domain>/requirements.md`
- `/ps:design` -> `projectspec/specs/architecture/context.md` and ADRs in `projectspec/specs/architecture/decisions/`
- `/ps:plan` -> `projectspec/changes/<change>/delivery.md` and `projectspec/mapping/traceability.yaml`
- `/ps:export` -> `projectspec/exports/<target>/`
- `/ps:verify` -> drift report (missing links, stale IDs)
- `/ps:archive` -> `projectspec/archive/<change>/`

## Tool setup

`projectspec init` prompts for tools and installs workflow prompts into their expected folders. Tool bundles are generated under `projectspec/exports/<tool>/` and mirrored into the harness locations below.

- KiloCode: `.kilocode/workflows/` and `.kilocode/skills/`
- GitHub Copilot: `.github/prompts/`
- Codex: `.codex/skills/`
