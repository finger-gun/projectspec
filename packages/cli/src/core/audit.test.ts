import fs from "fs";
import os from "os";
import path from "path";
import YAML from "yaml";
import { describe, expect, it } from "vitest";
import { recordChangeActivity } from "./audit.js";

describe("audit", () => {
  it("appends change activity entries", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-audit-"));
    recordChangeActivity(
      { type: "test", action: "first", timestamp: "2024-01-01T00:00:00.000Z" },
      rootDir,
    );
    recordChangeActivity(
      { type: "test", action: "second", timestamp: "2024-01-02T00:00:00.000Z" },
      rootDir,
    );
    const auditPath = path.join(rootDir, "projectspec", "changes", "audit.yaml");
    const entries = YAML.parse(fs.readFileSync(auditPath, "utf8")) as Array<{ action: string }>;
    expect(entries).toHaveLength(2);
    expect(entries[0].action).toBe("first");
    expect(entries[1].action).toBe("second");
    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
