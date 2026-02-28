---
name: ps-intake-wizard
description: Guided intake wizard for ProjectSpecs.
license: MIT
compatibility: ProjectSpecs workflows
---

Load wizard questions from `projectspec/workflows/intake-wizard.yaml` and ask them in order.
If inputs were provided inline, treat the first source as primary and the rest as dependencies.
If scope is still unclear, ask clarifying questions before curating requirements.
