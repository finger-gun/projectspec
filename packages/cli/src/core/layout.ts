import fs from "fs";
import path from "path";

const REQUIRED_DIRECTORIES = [
  "projectspec",
  "projectspec/sources",
  "projectspec/sources/intake",
  "projectspec/sources/imported",
  "projectspec/specs",
  "projectspec/specs/domains",
  "projectspec/specs/architecture",
  "projectspec/specs/architecture/decisions",
  "projectspec/specs/architecture/integrations",
  "projectspec/mapping",
  "projectspec/changes",
  "projectspec/exports",
  "projectspec/archive",
];

const REQUIRED_FILES = [
  "projectspec/specs/architecture/context.md",
  "projectspec/mapping/traceability.yaml",
  "projectspec/workflows/intake-wizard.yaml",
];

export function ensureProjectLayout(rootDir: string = process.cwd()): void {
  for (const dir of REQUIRED_DIRECTORIES) {
    const fullPath = path.join(rootDir, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  }

  for (const file of REQUIRED_FILES) {
    const fullPath = path.join(rootDir, file);
    if (!fs.existsSync(fullPath)) {
      const content = file.endsWith("intake-wizard.yaml")
        ? defaultIntakeWizardConfig()
        : "";
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, content, "utf8");
    }
  }
}

function defaultIntakeWizardConfig(): string {
  return [
    "version: 1",
    "questions:",
    "  - id: primary_scope",
    "    prompt: Describe the feature/change request, or provide a primary Jira key/Confluence URL/file path.",
    "  - id: dependencies",
    "    prompt: Describe dependencies or provide additional Jira keys/URLs/files.",
    "  - id: constraints",
    "    prompt: Note any constraints or NFRs (security, performance, compliance).",
    "notes:",
    "  treat_first_input_as_primary: true",
    "",
  ].join("\n");
}
