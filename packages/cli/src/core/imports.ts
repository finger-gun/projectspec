import fs from "fs";
import path from "path";
import { recordChangeActivity } from "./audit.js";

export interface ImportRequest {
  source: string;
  payloadPath?: string;
}

export interface ImportResult {
  outputDir: string;
  timestamp: string;
}

export function ensureImportStructure(source: string, rootDir: string = process.cwd()): void {
  const importDir = path.join(rootDir, "projectspec", "sources", "imported", source);
  if (!fs.existsSync(importDir)) {
    fs.mkdirSync(importDir, { recursive: true });
  }
}

export function recordImportActivity(source: string, action: string): void {
  recordChangeActivity({
    type: "import",
    source,
    action,
    timestamp: new Date().toISOString(),
  });
}

export function runImport(request: ImportRequest, rootDir: string = process.cwd()): ImportResult {
  ensureImportStructure(request.source, rootDir);
  recordImportActivity(request.source, "import");
  return {
    outputDir: path.join(rootDir, "projectspec", "sources", "imported", request.source),
    timestamp: new Date().toISOString(),
  };
}
