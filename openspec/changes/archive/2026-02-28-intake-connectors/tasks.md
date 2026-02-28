## 1. Intake Input Parsing

- [x] 1.1 Define parser for /ps-intake arguments (Jira keys, Confluence URLs, file paths)
- [x] 1.2 Add tests for argument classification
- [x] 1.3 Add default intake wizard config file and ensure layout creates it

## 2. Connector Fetchers

- [x] 2.1 Implement Confluence connector adapter (read-only snapshot)
- [x] 2.2 Extend Jira adapter to fetch by issue keys list
- [x] 2.3 Add tests for connector snapshot output

## 3. Import Registry Metadata

- [x] 3.1 Extend registry metadata to include Confluence provenance fields
- [x] 3.2 Update registry write logic for Confluence metadata
- [x] 3.3 Add tests for Confluence metadata persistence

## 4. Intake Workflow Guidance and Docs

- [x] 4.1 Update /ps-intake prompts to accept connector inputs
- [x] 4.2 Document connector usage and examples in docs
- [x] 4.3 Run lint, test, and coverage gates
- [x] 4.4 Add intake wizard skill files for harnesses
