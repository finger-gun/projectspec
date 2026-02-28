## 1. Project ID and Home Config

- [ ] 1.1 Add projectId generation and persistence in projectspec/config.yaml
- [ ] 1.2 Add home config loader/writer for ~/.projectspec/config.yaml
- [ ] 1.3 Add tests for projectId persistence and home config IO

## 2. Connector Metadata and Prompts

- [ ] 2.1 Define connector metadata (required properties) for Jira/Confluence
- [ ] 2.2 Extend init flow to prompt for connector properties and persist to home config
- [ ] 2.3 Add tests for init connector prompting and persistence

## 3. Usage and Verification

- [ ] 3.1 Update docs for home config storage and re-init behavior
- [ ] 3.2 Update intake guidance to reference home config when env is missing
- [ ] 3.3 Run lint, test, and coverage gates
