import fs from "fs";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
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
    installTools(["github-copilot"], rootDir);
    const promptPath = path.join(rootDir, ".github", "prompts", "ps-intake.prompt.md");
    expect(fs.existsSync(promptPath)).toBe(true);

    removeTools(["github-copilot"], rootDir);
    expect(fs.existsSync(path.join(rootDir, ".github", "prompts"))).toBe(false);
  });
});
