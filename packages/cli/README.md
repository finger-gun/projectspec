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
projectspec /ps:intake
projectspec /ps:design
projectspec /ps:plan
projectspec /ps:export
projectspec /ps:verify
projectspec /ps:archive
```

## Notes

- `init` creates the canonical `projectspec/` layout and a default config.
- `update` regenerates workflow artifacts based on the active profile.
- Workflow commands run the corresponding generators.
