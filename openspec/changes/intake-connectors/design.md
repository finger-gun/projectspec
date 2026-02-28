## Context

Intake workflows need to fetch Jira/Confluence sources directly and snapshot them into `projectspec/sources/imported/` before curating requirements. The existing import registry supports snapshots but lacks connector-driven intake and Confluence provenance metadata.

## Goals / Non-Goals

**Goals:**
- Accept connector inputs in /ps-intake (issue IDs, URLs, local files).
- Fetch Jira and Confluence sources via connectors and snapshot them into imports.
- Record Confluence provenance metadata in the import registry.

**Non-Goals:**
- Write-back to Jira/Confluence.
- New CLI subcommands.
- Full schema coverage for all Jira/Confluence fields.

## Decisions

- Parse /ps-intake arguments to classify Jira issue keys, Confluence URLs, and local files.
  - Rationale: keeps the workflow prompt simple while enabling multiple source types.
  - Alternatives: require explicit flags or separate prompts for each source.

- Use connector adapters that accept env-based auth (PAT + user email) and return snapshot metadata.
  - Rationale: aligns with existing Jira adapter and avoids embedding secrets in prompts.
  - Alternatives: OAuth flows or interactive auth.

- Store Confluence snapshots as JSON under `projectspec/sources/imported/confluence/<timestamp>/confluence.json`.
  - Rationale: consistent with Jira snapshot conventions and easy to parse in intake.
  - Alternatives: markdown exports per page.

## Risks / Trade-offs

- [Risk] Ambiguous input parsing could misclassify sources → Mitigation: document accepted patterns and log skipped inputs.
- [Risk] Confluence API limits or permissions → Mitigation: allow scoped queries and surface clear errors.
- [Risk] Snapshot size growth → Mitigation: limit to referenced pages/issues and key fields.

## Migration Plan

- Add connector input parsing for /ps-intake guidance.
- Implement Confluence adapter + snapshot writer and registry metadata.
- Update Jira connector usage to accept issue key lists.
- Update documentation and tests.

## Open Questions

- What minimum Confluence fields are required for intake (title, body, links)?
- Should we support attachment downloads in the first slice?
