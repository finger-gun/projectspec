import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectSpecConfig } from "./config.js";
import { updateToolExports } from "./exports.js";
import { installTools, removeTools, parseTools } from "./tools.js";

describe("tools", () => {
  const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-tools-"));

  afterEach(() => {
    fs.rmSync(rootDir, { recursive: true, force: true });
    fs.mkdirSync(rootDir, { recursive: true });
  });

  it("filters supported tools", () => {
    const parsed = parseTools(["github-copilot", "unknown", "codex"]);
    expect(parsed).toEqual(["github-copilot", "codex"]);
  });

  it("installs and removes copilot prompts", () => {
    const workflowsDir = path.join(rootDir, "projectspec", "workflows");
    fs.mkdirSync(workflowsDir, { recursive: true });
    fs.writeFileSync(path.join(workflowsDir, "intake.md"), "# /ps:intake\n\nTest.\n", "utf8");
    const config: ProjectSpecConfig = {
      profile: "core",
      workflows: ["/ps:intake"],
      tools: ["github-copilot"],
      integrations: {
        writeBackEnabled: false,
      },
    };
    updateToolExports(config, rootDir);
    installTools(["github-copilot"], rootDir);
    const promptPath = path.join(rootDir, ".github", "prompts", "ps-intake.prompt.md");
    expect(fs.existsSync(promptPath)).toBe(true);

    removeTools(["github-copilot"], rootDir);
    expect(fs.existsSync(path.join(rootDir, ".github", "prompts"))).toBe(false);
  });
});
