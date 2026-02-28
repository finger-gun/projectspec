import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { runVerify } from "./verify.js";
import { writeTraceability } from "./traceability.js";

describe("verify", () => {
  it("includes import drift issues", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-verify-"));
    const snapshotDir = path.join(
      rootDir,
      "projectspec",
      "sources",
      "imported",
      "jira",
      "2024-01-01T00:00:00.000Z",
    );
    fs.mkdirSync(snapshotDir, { recursive: true });
    writeTraceability({ requirements: {}, decisions: {} }, rootDir);

    const issues = runVerify(rootDir);
    expect(issues).toEqual(
      expect.arrayContaining(["Import registry missing entry for source jira."]),
    );
    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
