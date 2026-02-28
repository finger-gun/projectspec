import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";

vi.mock("./audit.js", () => ({
  recordChangeActivity: vi.fn(),
}));

import {
  ensureImportStructure,
  findImportDrift,
  readImportRegistry,
  runImport,
  updateImportRegistry,
  writeImportRegistry,
} from "./imports.js";

describe("imports", () => {
  it("creates import structure", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-imports-"));
    ensureImportStructure("jira", rootDir);
    const importDir = path.join(rootDir, "projectspec", "sources", "imported", "jira");
    expect(fs.existsSync(importDir)).toBe(true);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("runs import and returns output info", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-imports-"));
    const result = runImport({ source: "confluence" }, rootDir);
    expect(result.outputDir).toContain(
      path.join(rootDir, "projectspec", "sources", "imported", "confluence"),
    );
    expect(result.outputDir.endsWith(result.timestamp)).toBe(true);
    expect(result.timestamp).toMatch(/T/);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("reads and writes registry", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-imports-"));
    const registry = readImportRegistry(rootDir);
    expect(registry.version).toBe(1);
    updateImportRegistry(
      {
        source: "jira",
        snapshotPath: path.join(rootDir, "projectspec", "sources", "imported", "jira", "2024"),
        timestamp: "2024-01-01T00:00:00.000Z",
      },
      rootDir,
    );
    const updated = readImportRegistry(rootDir);
    expect(updated.sources.jira).toBeDefined();
    writeImportRegistry(updated, rootDir);
    const reloaded = readImportRegistry(rootDir);
    expect(reloaded.sources.jira.latestSnapshot).toContain("jira");
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("reports import drift", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-imports-"));
    const snapshotDir = path.join(
      rootDir,
      "projectspec",
      "sources",
      "imported",
      "github",
      "2024-01-01T00:00:00.000Z",
    );
    fs.mkdirSync(snapshotDir, { recursive: true });
    const issues = findImportDrift(rootDir);
    expect(issues).toEqual(
      expect.arrayContaining(["Import registry missing entry for source github."]),
    );
    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
