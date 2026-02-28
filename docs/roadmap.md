<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# ProjectSpecs Roadmap

This roadmap aligns the manifest vision with the current CLI architecture and focuses on small, end-to-end slices.

## Near-Term (Next 1–2 Slices)

### 1) Read-only integration imports

- Import registry (`projectspec/sources/imported/index.yaml`)
- Immutable snapshots per source
- Drift checks for missing/stale registry entries
- Documentation for adapter contract and registry schema

### 2) First adapter (Jira read-only)

- Snapshot epics/stories + key fields into imported sources
- Include provenance and source metadata
- Intake guidance to consume snapshots

## Mid-Term (Next 2–3 Slices)

### 3) Traceability utilities

- Link REQ/ADR/INT/CHG to work items
- Update and validate `projectspec/mapping/traceability.yaml`
- Drift reporting for orphaned work items and stale contracts

### 4) Export bundles and scoping

- Scoped exports by domain/change
- Bundle manifest with provenance and inputs
- Consistent sync into tool harnesses

### 5) Verification expansion

- Contract freshness checks (integrations, NFRs, ADRs)
- Severity levels and actionable remediation hints

## Longer-Term

### 6) Read-only adapters for Confluence and GitHub Projects

- Confluence page snapshots and decision extraction
- GitHub Projects snapshots with issue/PR linking

### 7) Optional write-back (enterprise)

- Explicitly gated updates to Jira/GitHub/Confluence
- Dry-run diffs, allowlists, and audit trails

## Guiding Principles

- Local-first `projectspec/` is the source of truth
- Agent workflows, not new CLI subcommands
- Stable IDs and traceability over copy/paste
- Test coverage must be >=80% for all code
