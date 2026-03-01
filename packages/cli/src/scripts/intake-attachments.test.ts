import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";

import {
  buildPythonScript,
  buildSummary,
  detectType,
  listAttachmentFiles,
  resolveSnapshotDir,
} from "./intake-attachments.js";

describe("intake-attachments", () => {
  it("detects attachment types", () => {
    expect(detectType("/tmp/file.xlsx")).toBe("xlsx");
    expect(detectType("/tmp/file.csv")).toBe("csv");
    expect(detectType("/tmp/file.drawio")).toBe("drawio");
    expect(detectType("/tmp/file.png")).toBe("image");
    expect(detectType("/tmp/file.unknown")).toBe("unknown");
  });

  it("lists attachment files recursively", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-attachments-"));
    const attachmentsDir = path.join(rootDir, "attachments", "123");
    fs.mkdirSync(attachmentsDir, { recursive: true });
    const fileA = path.join(attachmentsDir, "a.csv");
    const fileB = path.join(attachmentsDir, "nested", "b.png");
    fs.mkdirSync(path.dirname(fileB), { recursive: true });
    fs.writeFileSync(fileA, "col1,col2\n1,2\n", "utf8");
    fs.writeFileSync(fileB, "", "utf8");

    const files = listAttachmentFiles(path.join(rootDir, "attachments"));
    expect(files).toEqual(expect.arrayContaining([fileA, fileB]));
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("resolves snapshot dir from index.yaml", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-index-"));
    const importedDir = path.join(rootDir, "projectspec", "sources", "imported");
    fs.mkdirSync(importedDir, { recursive: true });
    const latest = path.join(importedDir, "confluence", "2026-01-01T00:00:00.000Z");
    fs.mkdirSync(latest, { recursive: true });
    fs.writeFileSync(
      path.join(importedDir, "index.yaml"),
      "version: 1\nsources:\n  confluence:\n    latestSnapshot: " + latest + "\n",
      "utf8",
    );

    expect(resolveSnapshotDir(rootDir)).toBe(latest);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("builds attachment summary without python", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-summary-"));
    const attachmentsDir = path.join(rootDir, "attachments");
    fs.mkdirSync(attachmentsDir, { recursive: true });
    const filePath = path.join(attachmentsDir, "spec.csv");
    fs.writeFileSync(filePath, "col1,col2\n1,2\n", "utf8");

    process.env.PROJECTSPEC_PYTHON_DISABLED = "1";

    const summary = buildSummary(rootDir, attachmentsDir);
    expect(summary.files.length).toBe(1);
    expect(summary.files[0].error).toBe("python3 missing");

    delete process.env.PROJECTSPEC_PYTHON_DISABLED;
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("buildPythonScript contains expected parsers", () => {
    const script = buildPythonScript();
    expect(script).toContain("def read_xlsx");
    expect(script).toContain("def read_csv");
    expect(script).toContain("def read_drawio");
    expect(script).toContain("def read_image");
  });
});
