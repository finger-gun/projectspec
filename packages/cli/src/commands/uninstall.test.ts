import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { removeProjectspecAgentAssets } from "./uninstall.js";

function writeFile(targetPath: string): void {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, "test", "utf8");
}

describe("uninstall", () => {
  it("removes only ProjectSpecs assets", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-uninstall-root-"));
    const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-uninstall-home-"));

    writeFile(path.join(rootDir, ".codex", "prompts", "ps-intake.prompt.md"));
    writeFile(path.join(rootDir, ".codex", "prompts", "keep.prompt.md"));
    writeFile(path.join(homeDir, ".codex", "prompts", "ps-plan.md"));
    writeFile(path.join(homeDir, ".codex", "prompts", "keep.md"));

    writeFile(path.join(rootDir, ".codex", "skills", "ps-intake", "SKILL.md"));
    writeFile(path.join(rootDir, ".codex", "skills", "ps-intake-wizard", "SKILL.md"));
    writeFile(path.join(rootDir, ".codex", "skills", "projectspec-workflows", "SKILL.md"));
    writeFile(path.join(rootDir, ".codex", "skills", "keep-skill", "SKILL.md"));

    writeFile(path.join(rootDir, ".agents", "skills", "ps-plan", "SKILL.md"));
    writeFile(path.join(rootDir, ".agents", "skills", "ps-intake-wizard", "SKILL.md"));
    writeFile(path.join(rootDir, ".agents", "skills", "projectspec-workflows", "SKILL.md"));
    writeFile(path.join(rootDir, ".agents", "skills", "keep-agent", "SKILL.md"));

    writeFile(path.join(rootDir, ".github", "prompts", "ps-intake.prompt.md"));
    writeFile(path.join(rootDir, ".github", "prompts", "opsx-apply.prompt.md"));

    writeFile(path.join(rootDir, ".copilot", "prompts", "ps-plan.prompt.md"));
    writeFile(path.join(rootDir, ".copilot", "prompts", "keep.prompt.md"));

    writeFile(path.join(rootDir, ".kilocode", "workflows", "ps-intake.md"));
    writeFile(path.join(rootDir, ".kilocode", "workflows", "keep.md"));
    writeFile(path.join(rootDir, ".kilocode", "skills", "projectspec-workflows", "SKILL.md"));
    writeFile(path.join(rootDir, ".kilocode", "skills", "ps-intake-wizard", "SKILL.md"));
    writeFile(path.join(rootDir, ".kilocode", "skills", "keep-skill", "SKILL.md"));

    removeProjectspecAgentAssets({ rootDir, homeDir });

    expect(fs.existsSync(path.join(rootDir, ".codex", "prompts", "ps-intake.prompt.md"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".codex", "prompts", "keep.prompt.md"))).toBe(true);
    expect(fs.existsSync(path.join(homeDir, ".codex", "prompts", "ps-plan.md"))).toBe(false);
    expect(fs.existsSync(path.join(homeDir, ".codex", "prompts", "keep.md"))).toBe(true);

    expect(fs.existsSync(path.join(rootDir, ".codex", "skills", "ps-intake"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".codex", "skills", "ps-intake-wizard"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".codex", "skills", "projectspec-workflows"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".codex", "skills", "keep-skill"))).toBe(true);

    expect(fs.existsSync(path.join(rootDir, ".agents", "skills", "ps-plan"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".agents", "skills", "ps-intake-wizard"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".agents", "skills", "projectspec-workflows"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".agents", "skills", "keep-agent"))).toBe(true);

    expect(fs.existsSync(path.join(rootDir, ".github", "prompts", "ps-intake.prompt.md"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".github", "prompts", "opsx-apply.prompt.md"))).toBe(true);

    expect(fs.existsSync(path.join(rootDir, ".copilot", "prompts", "ps-plan.prompt.md"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".copilot", "prompts", "keep.prompt.md"))).toBe(true);

    expect(fs.existsSync(path.join(rootDir, ".kilocode", "workflows", "ps-intake.md"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".kilocode", "workflows", "keep.md"))).toBe(true);
    expect(fs.existsSync(path.join(rootDir, ".kilocode", "skills", "projectspec-workflows"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".kilocode", "skills", "ps-intake-wizard"))).toBe(false);
    expect(fs.existsSync(path.join(rootDir, ".kilocode", "skills", "keep-skill"))).toBe(true);

    fs.rmSync(rootDir, { recursive: true, force: true });
    fs.rmSync(homeDir, { recursive: true, force: true });
  });
});
