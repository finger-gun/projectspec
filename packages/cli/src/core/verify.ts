import { findImportDrift } from "./imports.js";
import { findDrift, readTraceability } from "./traceability.js";

export function runVerify(rootDir: string = process.cwd()): string[] {
  const map = readTraceability(rootDir);
  const issues = findDrift(map, rootDir);
  return issues.concat(findImportDrift(rootDir));
}
