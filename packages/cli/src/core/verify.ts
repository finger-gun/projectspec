import { findDrift, readTraceability } from "./traceability.js";

export function runVerify(): string[] {
  const map = readTraceability();
  return findDrift(map);
}
