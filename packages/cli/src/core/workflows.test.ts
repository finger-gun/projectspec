import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { updateWorkflows } from "./workflows.js";
import type { ProjectSpecConfig } from "./config.js";

const ALL_WORKFLOW_FILES = [
  "intake.md",
  "design.md",
  "plan.md",
  "export.md",
  "verify.md",
  "archive.md",
];

describe("workflows", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-workflows-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("writes templates for enabled workflows", () => {
    const config: ProjectSpecConfig = {
      profile: "core",
      workflows: [
        "/ps:intake",
        "/ps:design",
        "/ps:plan",
        "/ps:export",
        "/ps:verify",
        "/ps:archive",
      ],
      tools: [],
      integrations: {
        writeBackEnabled: false,
      },
    };

    updateWorkflows(config, tempDir);

    const workflowsDir = path.join(tempDir, "projectspec", "workflows");
    const entries = fs.readdirSync(workflowsDir).sort();
    expect(entries).toEqual(expect.arrayContaining(ALL_WORKFLOW_FILES));

    const intake = fs.readFileSync(path.join(workflowsDir, "intake.md"), "utf8");
    expect(intake).toContain("/ps:intake");
    expect(intake.trim().length).toBeGreaterThan(0);
  });

  it("prunes disabled workflows", () => {
    const config: ProjectSpecConfig = {
      profile: "core",
      workflows: ["/ps:intake"],
      tools: [],
      integrations: {
        writeBackEnabled: false,
      },
    };

    updateWorkflows(config, tempDir);

    const workflowsDir = path.join(tempDir, "projectspec", "workflows");
    const entries = fs.readdirSync(workflowsDir).sort();
    expect(entries).toEqual(["intake.md"]);
  });
});
