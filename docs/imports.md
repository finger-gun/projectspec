<div align="right">
  <a href="https://github.com/finger-gun/projectspec"><img src="./assets/logo.svg" alt="ProjectSpecs" width="130" /></a>
</div>

# Import Pipeline

ProjectSpecs supports read-only imports that snapshot external sources into the local workspace. Imports are immutable snapshots recorded in a registry for discovery and drift checks.

## Layout

```
projectspec/
  sources/
    imported/
      index.yaml
      <source>/
        <timestamp>/
          <payload files>
```

## Registry (`index.yaml`)

The registry records the latest snapshot per source plus historical snapshot paths.

Example:

```yaml
version: 1
sources:
  jira:
    source: jira
    latestSnapshot: projectspec/sources/imported/jira/2024-01-01T00:00:00.000Z
    updatedAt: 2024-01-01T00:00:00.000Z
    snapshots:
      - projectspec/sources/imported/jira/2024-01-01T00:00:00.000Z
    metadata:
      payload: projectspec/sources/imported/jira/2024-01-01T00:00:00.000Z/jira.json
```

## Import Adapter Contract

Each adapter produces:

- `source`: integration name (e.g., `jira`)
- `snapshotPath`: path to the timestamped snapshot directory
- `timestamp`: ISO timestamp for the snapshot
- `metadata`: optional key/value metadata (payload path, filters, etc.)

## Drift Signals

Verification should flag:

- Snapshots on disk without a registry entry
- Registry entries pointing to missing snapshots
- Registry entries that are stale relative to latest snapshots
