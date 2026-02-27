You are running `/ps:verify` for ProjectSpecs.

Goal: report drift such as missing links or stale specs.

Read:
- `projectspec/mapping/traceability.yaml`
- `projectspec/specs/domains/**/requirements.md`
- `projectspec/specs/architecture/**/*.md`

Checks:
- Requirements or ADRs with no linked work items
- Traceability entries for IDs not present in specs
- IDs present in specs but missing traceability entries

Output:
- Report findings in the response with clear remediation steps
