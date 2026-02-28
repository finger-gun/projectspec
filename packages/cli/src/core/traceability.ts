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

const ID_PATTERNS = {
  requirement: /REQ-[A-Z0-9]+-\d{4}/g,
  decision: /ADR-\d{4}/g,
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
  fs.mkdirSync(path.dirname(tracePath), { recursive: true });
  const yaml = YAML.stringify(map);
  fs.writeFileSync(tracePath, yaml, "utf8");
}

export function findDrift(map: TraceabilityMap, rootDir: string = process.cwd()): string[] {
  const issues: string[] = [];
  const requirementIds = collectIdsFromSpecs(
    rootDir,
    ["projectspec/specs/domains"],
    ID_PATTERNS.requirement,
  );
  const decisionIds = collectIdsFromSpecs(
    rootDir,
    ["projectspec/specs/architecture"],
    ID_PATTERNS.decision,
  );

  for (const [req, links] of Object.entries(map.requirements)) {
    if (links.length === 0) {
      issues.push(`Requirement ${req} has no linked work items.`);
    }
    if (!requirementIds.has(req)) {
      issues.push(`Requirement ${req} is missing from specs.`);
    }
  }

  for (const [adr, links] of Object.entries(map.decisions)) {
    if (links.length === 0) {
      issues.push(`Decision ${adr} has no linked items.`);
    }
    if (!decisionIds.has(adr)) {
      issues.push(`Decision ${adr} is missing from specs.`);
    }
  }

  for (const req of requirementIds) {
    if (!map.requirements[req]) {
      issues.push(`Requirement ${req} is missing a traceability entry.`);
    }
  }

  for (const adr of decisionIds) {
    if (!map.decisions[adr]) {
      issues.push(`Decision ${adr} is missing a traceability entry.`);
    }
  }

  return issues;
}

function collectIdsFromSpecs(rootDir: string, directories: string[], pattern: RegExp): Set<string> {
  const ids = new Set<string>();
  for (const relativeDir of directories) {
    const fullDir = path.join(rootDir, relativeDir);
    if (!fs.existsSync(fullDir)) {
      continue;
    }
    const files = listMarkdownFiles(fullDir);
    for (const file of files) {
      const raw = fs.readFileSync(file, "utf8");
      const matches = raw.match(pattern);
      if (!matches) {
        continue;
      }
      for (const match of matches) {
        ids.add(match);
      }
    }
  }
  return ids;
}

function listMarkdownFiles(root: string): string[] {
  const entries = fs.readdirSync(root, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      results.push(...listMarkdownFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) {
      results.push(entryPath);
    }
  }
  return results;
}
