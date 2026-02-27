import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { findDrift } from "./traceability.js";

describe("traceability", () => {
  it("reports missing links and stale entries", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-traceability-"));
    const requirementsDir = path.join(rootDir, "projectspec", "specs", "domains", "app");
    const architectureDir = path.join(rootDir, "projectspec", "specs", "architecture");
    fs.mkdirSync(requirementsDir, { recursive: true });
    fs.mkdirSync(architectureDir, { recursive: true });
    fs.writeFileSync(
      path.join(requirementsDir, "requirements.md"),
      "### Requirement: Login\nREQ-APP-0001\n",
      "utf8",
    );
    fs.writeFileSync(
      path.join(architectureDir, "context.md"),
      "ADR-0001\n",
      "utf8",
    );

    const issues = findDrift(
      {
        requirements: {
          "REQ-APP-0001": [],
          "REQ-APP-0002": ["JIRA-1"],
        },
        decisions: {
          "ADR-0001": [],
          "ADR-0002": ["JIRA-2"],
        },
      },
      rootDir,
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        "Requirement REQ-APP-0001 has no linked work items.",
        "Decision ADR-0001 has no linked items.",
        "Requirement REQ-APP-0002 is missing from specs.",
        "Decision ADR-0002 is missing from specs.",
      ]),
    );
  });

  it("reports missing traceability entries for known IDs", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-traceability-"));
    const requirementsDir = path.join(rootDir, "projectspec", "specs", "domains", "billing");
    const decisionsDir = path.join(rootDir, "projectspec", "specs", "architecture", "decisions");
    fs.mkdirSync(requirementsDir, { recursive: true });
    fs.mkdirSync(decisionsDir, { recursive: true });
    fs.writeFileSync(
      path.join(requirementsDir, "requirements.md"),
      "REQ-BILLING-0003\n",
      "utf8",
    );
    fs.writeFileSync(path.join(decisionsDir, "ADR-0004.md"), "ADR-0004\n", "utf8");

    const issues = findDrift(
      {
        requirements: {},
        decisions: {},
      },
      rootDir,
    );

    expect(issues).toEqual(
      expect.arrayContaining([
        "Requirement REQ-BILLING-0003 is missing a traceability entry.",
        "Decision ADR-0004 is missing a traceability entry.",
      ]),
    );
  });
});
