# Contributing

Thanks for your interest in contributing to ProjectSpecs.

## Before You Start

Please read:

- [docs/overview.md](docs/overview.md) for product context
- [docs/manifest.md](docs/manifest.md) for the spec model and workflow

## Hard Rules

These are non-negotiable. PRs that violate them will be closed.

### 1. All Features Require OpenSpec Artifacts

Every feature, change, or addition must be captured in OpenSpec artifacts. No exceptions.

Workflow:

1. Create a change with the OpenSpec workflow
2. Author proposal/specs/design/tasks
3. Implement the change
4. Archive the change

Why: specs force clarity before code, speed reviews, and keep an audit trail for future contributors.

### 2. AI Development Mandate

If AI is used at any point (code, docs, specs, extraction), OpenSpec artifacts are mandatory. This ensures AI output is reviewed, intentional, and traceable.

### 3. TypeScript and Quality Gates

- TypeScript only (no implicit any)
- All new features must pass lint and unit tests

## Documentation Expectations

If you add a new spec or feature, update user/developer-facing docs. High-level design belongs in `docs/` and should not duplicate OpenSpec artifacts.

## Project Structure

This repo is a pnpm + Turbo monorepo:

```
packages/
  cli/            ProjectSpecs CLI

docs/             Product and developer docs
openspec/         OpenSpec workflow artifacts
projectspec/      Generated workspace (from CLI init)
```

## Running Checks

```bash
pnpm lint
pnpm test
```

## Pull Request Process

1. Reference or create an OpenSpec change
2. Keep PRs focused on one logical change
3. Explain what changed and why, with links to specs
4. Ensure lint and tests pass
5. Respond to review feedback quickly
