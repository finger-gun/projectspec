import fs from "fs";
import path from "path";
import YAML from "yaml";
import { recordChangeActivity } from "./audit.js";

export interface ImportRequest {
  source: string;
  payloadPath?: string;
}

export interface ImportResult {
  outputDir: string;
  timestamp: string;
}

export interface ImportRegistryEntry {
  source: string;
  latestSnapshot: string;
  updatedAt: string;
  snapshots: string[];
  metadata?: Record<string, string>;
}

export interface ImportRegistry {
  version: 1;
  sources: Record<string, ImportRegistryEntry>;
}

export interface ImportAdapterResult {
  source: string;
  snapshotPath: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

export interface ImportAdapter {
  source: string;
  run: (options?: Record<string, string>) => ImportAdapterResult | Promise<ImportAdapterResult>;
}

const DEFAULT_REGISTRY: ImportRegistry = {
  version: 1,
  sources: {},
};

export function ensureImportStructure(source: string, rootDir: string = process.cwd()): void {
  const importDir = path.join(rootDir, "projectspec", "sources", "imported", source);
  if (!fs.existsSync(importDir)) {
    fs.mkdirSync(importDir, { recursive: true });
  }
}

export function recordImportActivity(source: string, action: string, timestamp: string): void {
  recordChangeActivity({
    type: "import",
    source,
    action,
    timestamp,
  });
}

export function runImport(request: ImportRequest, rootDir: string = process.cwd()): ImportResult {
  const timestamp = new Date().toISOString();
  const snapshotDir = createSnapshotDirectory(request.source, timestamp, rootDir);
  if (request.payloadPath) {
    const targetPath = path.join(snapshotDir, path.basename(request.payloadPath));
    fs.copyFileSync(request.payloadPath, targetPath);
  }
  recordImportActivity(request.source, "import", timestamp);
  updateImportRegistry(
    {
      source: request.source,
      snapshotPath: snapshotDir,
      timestamp,
      metadata: request.payloadPath ? { payload: request.payloadPath } : undefined,
    },
    rootDir,
  );
  return {
    outputDir: snapshotDir,
    timestamp,
  };
}

export function readImportRegistry(rootDir: string = process.cwd()): ImportRegistry {
  const registryPath = getRegistryPath(rootDir);
  if (!fs.existsSync(registryPath)) {
    return DEFAULT_REGISTRY;
  }
  const raw = fs.readFileSync(registryPath, "utf8");
  const data = YAML.parse(raw) as ImportRegistry | null;
  if (!data || typeof data !== "object") {
    return DEFAULT_REGISTRY;
  }
  return {
    version: data.version ?? 1,
    sources: data.sources ?? {},
  };
}

export function writeImportRegistry(
  registry: ImportRegistry,
  rootDir: string = process.cwd(),
): void {
  const registryPath = getRegistryPath(rootDir);
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, YAML.stringify(registry), "utf8");
}

export function updateImportRegistry(
  result: ImportAdapterResult,
  rootDir: string = process.cwd(),
): ImportRegistry {
  const registry = readImportRegistry(rootDir);
  const existing = registry.sources[result.source];
  const snapshots = existing?.snapshots ? [...existing.snapshots] : [];
  if (!snapshots.includes(result.snapshotPath)) {
    snapshots.push(result.snapshotPath);
  }
  registry.sources[result.source] = {
    source: result.source,
    latestSnapshot: result.snapshotPath,
    updatedAt: result.timestamp,
    snapshots,
    metadata: result.metadata ?? existing?.metadata,
  };
  writeImportRegistry(registry, rootDir);
  return registry;
}

export function findImportDrift(rootDir: string = process.cwd()): string[] {
  const issues: string[] = [];
  const registry = readImportRegistry(rootDir);
  const importedRoot = path.join(rootDir, "projectspec", "sources", "imported");
  const sourcesOnDisk = listDirectories(importedRoot).filter((name) => name !== "index.yaml");

  for (const source of sourcesOnDisk) {
    const snapshots = listDirectories(path.join(importedRoot, source));
    if (snapshots.length === 0) {
      continue;
    }
    const latest = snapshots.sort().at(-1);
    if (!latest) {
      continue;
    }
    const entry = registry.sources[source];
    if (!entry) {
      issues.push(`Import registry missing entry for source ${source}.`);
      continue;
    }
    if (!fs.existsSync(entry.latestSnapshot)) {
      issues.push(`Import registry entry for source ${source} points to missing snapshot ${entry.latestSnapshot}.`);
      continue;
    }
    const expectedPath = path.join(importedRoot, source, latest);
    if (path.resolve(entry.latestSnapshot) !== path.resolve(expectedPath)) {
      issues.push(`Import registry for source ${source} is stale (expected ${expectedPath}).`);
    }
  }

  for (const [source, entry] of Object.entries(registry.sources)) {
    const snapshotDir = path.join(importedRoot, source);
    if (!fs.existsSync(snapshotDir)) {
      issues.push(`Import registry entry for source ${source} has no snapshots on disk.`);
      continue;
    }
    if (!entry.latestSnapshot) {
      issues.push(`Import registry entry for source ${source} has no latest snapshot.`);
    }
  }

  return issues;
}

function getRegistryPath(rootDir: string): string {
  return path.join(rootDir, "projectspec", "sources", "imported", "index.yaml");
}

function createSnapshotDirectory(source: string, timestamp: string, rootDir: string): string {
  ensureImportStructure(source, rootDir);
  const snapshotDir = path.join(rootDir, "projectspec", "sources", "imported", source, timestamp);
  fs.mkdirSync(snapshotDir, { recursive: true });
  return snapshotDir;
}

function listDirectories(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
