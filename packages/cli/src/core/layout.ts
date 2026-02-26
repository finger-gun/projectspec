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
      fs.writeFileSync(fullPath, "", "utf8");
    }
  }
}
