import fs from "fs";
import path from "path";
import YAML from "yaml";

export interface TraceabilityMap {
  requirements: Record<string, string[]>;
  decisions: Record<string, string[]>;
}

export const ID_FORMATS = {
  requirement: /^REQ-[A-Z0-9]+-\d{4}$/,
  decision: /^ADR-\d{4}$/,
  integration: /^INT-[A-Z0-9]+-\d{4}$/,
  change: /^CHG-[A-Z0-9]+-\d{4}$/,
};

const DEFAULT_TRACEABILITY: TraceabilityMap = {
  requirements: {},
  decisions: {},
};

export function readTraceability(rootDir: string = process.cwd()): TraceabilityMap {
  const tracePath = path.join(rootDir, "projectspec", "mapping", "traceability.yaml");
  if (!fs.existsSync(tracePath)) {
    return DEFAULT_TRACEABILITY;
  }

  const raw = fs.readFileSync(tracePath, "utf8");
  const data = YAML.parse(raw) as TraceabilityMap | null;
  return data ?? DEFAULT_TRACEABILITY;
}

export function writeTraceability(
  map: TraceabilityMap,
  rootDir: string = process.cwd(),
): void {
  const tracePath = path.join(rootDir, "projectspec", "mapping", "traceability.yaml");
  const yaml = YAML.stringify(map);
  fs.writeFileSync(tracePath, yaml, "utf8");
}

export function findDrift(map: TraceabilityMap): string[] {
  const issues: string[] = [];

  for (const [req, links] of Object.entries(map.requirements)) {
    if (links.length === 0) {
      issues.push(`Requirement ${req} has no linked work items.`);
    }
  }

  for (const [adr, links] of Object.entries(map.decisions)) {
    if (links.length === 0) {
      issues.push(`Decision ${adr} has no linked items.`);
    }
  }

  return issues;
}
