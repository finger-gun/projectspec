<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# Jira Read-only Import

The Jira adapter produces immutable snapshots for epics and stories, plus key fields needed for intake and traceability.

## Snapshot location

```
projectspec/sources/imported/jira/<timestamp>/jira.json
```

## Snapshot shape (example)

```json
{
  "epics": [
    {
      "id": "1",
      "key": "PROJ-1",
      "summary": "Epic A",
      "status": "Open",
      "issueType": "Epic",
      "assignee": "Owner",
      "labels": ["customer"]
    }
  ],
  "stories": [],
  "metadata": {
    "jiraInstanceUrl": "https://jira.example.com",
    "jiraProjectKey": "PROJ",
    "jiraQuery": "project = PROJ"
  }
}
```

## Registry metadata

The import registry entry for Jira includes:

- `jiraInstanceUrl`
- `jiraProjectKey`
- `jiraQuery` (optional)

## Usage notes

- Snapshots are immutable; each run writes a new timestamped folder.
- Intake workflows should prioritize Jira snapshots when available.

## Connector runner

```bash
pnpm --filter @projectspec/cli build
node packages/cli/dist/scripts/intake-connectors.js ROSSCRISP-2712
```

## Environment configuration

Set these variables before running the adapter:

```bash
JIRA_PAT=ATATT3xFfG...
JIRA_API_URL=https://your-domain.atlassian.net
JIRA_USER=you@example.com
JIRA_PROJECT_KEY=PROJ
JIRA_QUERY="project = PROJ AND issuetype in (Epic, Story)"
```

`JIRA_QUERY` is optional. If omitted, the adapter defaults to:

```
project = <JIRA_PROJECT_KEY> AND issuetype in (Epic, Story)
```
