import { findDrift, readTraceability } from "./traceability.js";

export function runVerify(rootDir: string = process.cwd()): string[] {
  const map = readTraceability(rootDir);
  return findDrift(map, rootDir);
}
