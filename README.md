<div align="center">

<img src="./docs/assets/logo.svg" alt="ProjectSpecs" width="300" />

<h4>

ProjectSpecs is a lightweight, AI-native project specification layer that turns enterprise requirements and architecture artifacts into structured, traceable project specs consumable by humans and AI assistants.

</h4>

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
![AI](https://img.shields.io/badge/AI-Enabled-6f42c1)
[![pnpm](https://img.shields.io/badge/pnpm-workspace-orange.svg)](https://pnpm.io/)
[![turborepo](https://img.shields.io/badge/Turbo-monorepo-0f7bff.svg)](https://turbo.build/)

</div>

## Why ProjectSpecs

- Reduce copy/paste drift across enterprise artifacts and AI tools
- Keep a single, local source of truth for requirements and architecture
- Preserve traceability from requirements to delivery and verification
- Enable AI-assisted workflows without losing human-readable context

## Quick Start

Requirements:

- Node.js 20+
- pnpm 9+

Install and build:

```bash
pnpm install
pnpm build
```

Initialize a project:

```bash
pnpm projectspec -- init
```

## Development

This repo uses pnpm workspaces and Turbo.

### Setup

```bash
pnpm install
```

### Common tasks

```bash
pnpm lint
pnpm test
pnpm build
```

## Documentation

- Project overview: [docs/overview.md](docs/overview.md)
- Project manifest: [docs/manifest.md](docs/manifest.md)
- CLI usage: [packages/cli/README.md](packages/cli/README.md)

## Status

Early foundation phase. Expect breaking changes while core workflows and tooling stabilize.

## Repository Layout

```text
.
├─ docs/
├─ openspec/
├─ packages/
│  └─ cli/
└─ projectspec/
```

## Contributing

We welcome contributions. Please read [CONTRIBUTING](CONTRIBUTING.md) before opening a PR.
