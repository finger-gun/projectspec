<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# ProjectSpecs — Project Manifest (v0.1)

## One-liner

**ProjectSpecs is a lightweight, AI-native project specification layer** that turns enterprise requirements and architecture artifacts into **structured, traceable “project specs”** that can be consistently consumed by humans, teams, and any AI assistant—without copy/paste.

## The hole we’re fixing

Modern enterprise delivery has “AI islands”: BA docs, Jira epics, architecture decisions, solution designs, integration contracts, security requirements, and dev stories all drift and duplicate across tools.

**ProjectSpecs makes specs a first-class, versioned, syncable project asset**—so requirements → architecture → execution remains coherent as it flows across roles and systems.

## What we’re copying from OpenSpec (mechanics that work)

ProjectSpecs will mirror OpenSpec’s successful mechanics:

* **CLI-first distribution** (Node 20+, TypeScript), easy install and upgrade.
* A **project directory** that holds canonical artifacts (like `openspec/…`).
* **Tool-agnostic delivery**: install “skills” into many assistants (Claude/Cursor/Windsurf/etc.) by writing files into their tool directories.
* **Profiles/workflows**: enable different workflow sets and keep generated files in sync (including pruning deselected workflows).

## Product philosophy

* **Actions, not phase gates**: you can update artifacts anytime; the system helps you keep consistency rather than blocking progress.
* **Single source of truth**: canonical specs live in the repo/project folder; integrations are views/sync targets.
* **Traceability without bureaucracy**: link everything with stable IDs and deltas.
* **Human-readable always**: Markdown/YAML/JSON artifacts designed for humans *and* machines.

---

# Core concepts & artifacts

## Proposed folder layout

```text
projectspec/
  config.yaml
  sources/
    intake/                 # raw inputs: transcripts, emails, workshop notes
    imported/               # snapshots from Jira/Confluence/GitHub Projects/etc.
  specs/
    domains/
      <domain>/
        requirements.md     # curated requirements (with IDs)
        scenarios.md        # Gherkin-like, flows, acceptance
        nfr.md              # NFRs (security, perf, availability)
        glossary.md
    architecture/
      context.md            # context + constraints
      decisions/
        ADR-0001-....md
      integrations/
        <system>.md         # contracts, events, APIs, mappings
  mapping/
    traceability.yaml       # requirement ↔ epic ↔ story ↔ ADR ↔ test
  changes/
    <change-id>-<slug>/
      proposal.md
      impact.md             # who/what systems affected
      updated-specs/        # patches/diffs or regenerated views
      delivery.md           # plan: epics/stories/tasks suggestions
  exports/
    <target>/               # tool-ready bundles for AI assistants
  archive/
    <date>-<slug>/
```

## The “atoms” (minimum viable data model)

* **Requirement**: `REQ-<domain>-####` with status, owner, source link(s)
* **Decision (ADR)**: `ADR-####`
* **Integration contract**: `INT-<system>-####`
* **Work item mapping**: `JIRA-EPIC`, `JIRA-STORY`, `ADO-…`, `GHP-…`
* **Change**: a bounded delta set that updates requirements/architecture and emits downstream “delivery suggestions”

---

# Workflow (BA → SA → Team → AI)

## Intake → Curate (BA / PO)

**Command:** `/ps:intake`

* Capture raw requirements from meeting notes, documents, Jira/Confluence imports
* Normalize into `requirements.md` with IDs + sources

## Structure → Decide (Solution Architect)

**Command:** `/ps:design`

* Create/update domain boundaries, NFRs, integration contracts, ADRs
* Build traceability to existing epics/design topics

## Plan → Emit work (Team / Delivery)

**Command:** `/ps:plan`

* Produce “delivery.md” suggestions: epics, stories, test charters, rollout steps
* Update `traceability.yaml` linking REQs → epics → stories

## Implement with any AI (Developers)

**Command:** `/ps:export <target>`

* Export a scoped, tool-ready context bundle (prompt pack / spec pack) for spec-driven coding
* Keep “project truth” consistent while enabling SDD at the team edge

## Verify & Drift control

**Command:** `/ps:verify`

* Detect spec drift: stories added without REQ, ADR missing for key change, integration contract outdated, NFR not addressed
* Report deltas and recommended fixes

---

# Integrations & “skills” (high-value, enterprise-first)

## Why integrations matter

Most intake is already in **Jira**, **Confluence**, and increasingly **GitHub Projects**. ProjectSpecs should treat these as **first-class intake sources** and (optionally) **sync targets**.

## Integration modes

* **Read-only import** (MVP-friendly): pull data into `sources/imported/` and generate/refresh curated specs.
* **Write-back** (enterprise value): update existing work items and optionally create new ones based on curated specs.

## Proposed integration skills

### Jira skills

* Read: epics, stories, issue links, fields, comments, attachments, acceptance criteria
* Map: Jira entities ↔ ProjectSpecs atoms (`REQ-*`, `ADR-*`) via labels/custom fields
* Write-back:

  * Update an Epic description/status/AC from curated requirements
  * Create epics/stories from a `delivery.md` plan
  * Keep traceability links updated (REQ ↔ Epic ↔ Story)

### Confluence skills

* Read: pages/spaces, attachments, meeting notes, RFCs
* Extract: requirements + decisions into ProjectSpecs structure
* Publish:

  * Push curated `requirements.md` and ADRs to a chosen Confluence space
  * Maintain backlinks to ProjectSpecs IDs

### GitHub Projects & GitHub Issues/PRs skills

* Read: project items, issue bodies, PR descriptions, labels
* Link: PR/issue ↔ REQ/ADR IDs
* Write-back:

  * Update issue bodies with canonical excerpts (or references)
  * Create issues from `delivery.md`

## Governance / safety for write-back

Write-back should be explicitly enabled per integration and support:

* Dry-run mode (show diffs)
* Scoped permissions (project/space/repo allowlists)
* Field mapping config (custom fields/labels)
* Audit log of changes in `projectspec/changes/`

---

# Architecture (modeled after OpenSpec)

## Runtime shape

* **CLI**: `projectspec` command (Node/TypeScript)
* **Generators**:

  * Skills generator (writes `SKILL.md` bundles per workflow)
  * Command generator (writes tool-specific command files using adapters)
* **Adapters**:

  * AI tool adapters (Claude/Cursor/Windsurf/etc.)
  * Integration adapters (Jira/Confluence/GitHub Projects) as optional plugins

## Profiles

* `core` (default): intake/design/plan/export/verify/archive
* `enterprise`: adds governance hooks (security, risk, compliance)
* `integrations`: enables Jira/Confluence/GitHub read + optional write-back
* `team-sdd`: optimized export into spec-driven development tools

---

# MVP scope (what to build first)

**MVP = Local-first + AI-tool distribution + traceability core + read-only integrations**

1. `projectspec init`

   * create folder layout + `config.yaml`
   * detect AI tools and install skills/commands
2. `projectspec update`

   * regenerate and prune skills/commands based on enabled workflows
3. Workflows as AI-invokable commands:

   * `/ps:intake`, `/ps:design`, `/ps:plan`, `/ps:export`, `/ps:verify`, `/ps:archive`
4. Minimal traceability engine:

   * stable IDs + `traceability.yaml`
   * drift checks (missing links, stale contracts, orphaned work items)
5. Integrations (read-only in MVP):

   * Jira import (epics/stories fields + AC)
   * Confluence import (pages + attachments)
   * GitHub Projects import (items + linked issues)

**Phase 2 (high enterprise value): write-back**

* Jira: update epic/story descriptions, create epics/stories from plans
* GitHub: create/update issues, link PRs to REQs
* Confluence: publish curated specs, maintain backlinks

---

# Non-goals

* Replacing Jira/Confluence/ADO
* Being a “project management tool”
* Enforcing a single SDLC or governance model
* Real-time collaboration UI (initially)

# Success metrics

* Copy/paste reduction into AI tools
* Drift reduction (REQ vs story vs implementation)
* Faster BA→SA→team handover
* Adoption in brownfield enterprise contexts

# Licensing & community stance

* MIT
* Plugin interface for enterprise adapters (Jira/Confluence/etc.) so core stays small

# First implementation notes (how to start)

Mirror OpenSpec-style modules:

* `core/init` (project folder creation + tool detection + skill/command generation)
* `core/update` (regenerate + prune based on workflow/profile)
* `core/config` (supported tools and their skill directories)
* `cli/` wiring (subcommands + hooks)

---

## Open questions (for later refinement)

* How strict should ID enforcement be in free-form intake?
* What is the minimum required metadata for REQs/NFRs in large enterprise programs?
* Best default mapping strategy for Jira custom fields and labels?
* Where to store secrets/tokens (recommend OS keychain/env vars; never commit)?
