<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# Home Config Storage

ProjectSpecs stores connector credentials in a user-home config so secrets are not committed to repositories.

## Location

```
~/.projectspec/config.yaml
```

## Structure (example)

```yaml
version: 1
projects:
  <projectId>:
    connectors:
      jira:
        JIRA_API_URL: https://inter-ikea.atlassian.net
        JIRA_USER: user@example.com
        JIRA_PAT: <token>
        JIRA_OAUTH_TOKEN: <token>
        JIRA_PROJECT_KEY: ROSSCRISP
      confluence:
        CONFLUENCE_API_URL: https://inter-ikea.atlassian.net
        CONFLUENCE_PAT: <token>
        CONFLUENCE_OAUTH_TOKEN: <token>
        CONFLUENCE_USER: user@example.com
        CONFLUENCE_PAGE_IDS: 123,456
```

## Project ID

The CLI writes a stable `projectId` into `projectspec/config.yaml` during `projectspec init` and uses it to look up connector settings.

## Re-init behavior

- If the home config is missing, `projectspec init` prompts for connector values again.
- If `projectId` is missing, the CLI generates one and prompts for connector values.
