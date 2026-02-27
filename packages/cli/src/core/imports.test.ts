import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";

vi.mock("./audit.js", () => ({
  recordChangeActivity: vi.fn(),
}));

import { ensureImportStructure, runImport } from "./imports.js";

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
    expect(result.outputDir).toBe(
      path.join(rootDir, "projectspec", "sources", "imported", "confluence"),
    );
    expect(result.timestamp).toMatch(/T/);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
