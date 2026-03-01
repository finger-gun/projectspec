<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# Intake Connectors

Connector-driven intake accepts Jira issue keys, Confluence URLs, and local files and snapshots them before curation.

## Example usage

```bash
node packages/cli/dist/scripts/intake-connectors.js ROSSCRISP-2712 https://example.atlassian.net/wiki/spaces/ABC/pages/123 ./notes.md
```

## Inputs

- Jira issue keys (e.g., `ROSSCRISP-2712`)
- Confluence page URLs
- Local file paths

## Output

- Jira snapshot: `projectspec/sources/imported/jira/<timestamp>/jira.json`
- Confluence snapshot: `projectspec/sources/imported/confluence/<timestamp>/confluence.json`
- Local files copied into `projectspec/sources/intake/`
