<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# Confluence Read-only Import

The Confluence adapter fetches page content and stores immutable snapshots for intake.

## Snapshot location

```
projectspec/sources/imported/confluence/<timestamp>/confluence.json
```

## Snapshot shape (example)

```json
{
  "pages": [
    {
      "id": "123",
      "title": "Decision Log",
      "url": "https://example.atlassian.net/wiki/spaces/ABC/pages/123",
      "body": "<p>Content</p>",
      "updated": "2024-01-01"
    }
  ],
  "metadata": {
    "confluenceInstanceUrl": "https://example.atlassian.net",
    "confluenceSpaceKey": "ABC",
    "confluencePageIds": "123"
  }
}
```

## Environment configuration

```bash
CONFLUENCE_API_URL=https://your-domain.atlassian.net
CONFLUENCE_USER=you@example.com
CONFLUENCE_PAT=ATATT3xFfG...
CONFLUENCE_OAUTH_TOKEN=eyJhbGci...
CONFLUENCE_PAGE_IDS=123,456
CONFLUENCE_SPACE_KEY=ABC
```

If you pass Confluence URLs to /ps-intake, the adapter infers the base URL and `CONFLUENCE_API_URL` becomes optional.
If `CONFLUENCE_OAUTH_TOKEN` is set, it is used as a Bearer token. Otherwise, Bearer auth uses `CONFLUENCE_PAT` when `CONFLUENCE_USER` is omitted.

Home config (stored at `~/.projectspec/config.yaml`) can also supply these values after `projectspec init`.

## Connector runner

```bash
node packages/cli/dist/scripts/intake-connectors.js https://example.atlassian.net/wiki/spaces/ABC/pages/123
```
