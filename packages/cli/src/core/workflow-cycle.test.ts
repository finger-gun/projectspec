import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ensureProjectLayout } from "./layout.js";
import { runVerify } from "./verify.js";
import { writeTraceability } from "./traceability.js";

describe("workflow cycle", () => {
  it("supports a minimal spec cycle without drift", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-cycle-"));
    ensureProjectLayout(rootDir);

    const requirementsDir = path.join(rootDir, "projectspec", "specs", "domains", "core");
    fs.mkdirSync(requirementsDir, { recursive: true });
    fs.writeFileSync(
      path.join(requirementsDir, "requirements.md"),
      "REQ-CORE-0001\n",
      "utf8",
    );

    const decisionsDir = path.join(
      rootDir,
      "projectspec",
      "specs",
      "architecture",
      "decisions",
    );
    fs.mkdirSync(decisionsDir, { recursive: true });
    fs.writeFileSync(path.join(decisionsDir, "ADR-0001.md"), "ADR-0001\n", "utf8");

    writeTraceability(
      {
        requirements: {
          "REQ-CORE-0001": ["CHG-CORE-0001"],
        },
        decisions: {
          "ADR-0001": ["CHG-CORE-0001"],
        },
      },
      rootDir,
    );

    const issues = runVerify(rootDir);
    expect(issues).toEqual([]);
  });
});
