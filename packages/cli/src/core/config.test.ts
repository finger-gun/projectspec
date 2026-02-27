import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { readConfig, writeDefaultConfig } from "./config.js";

describe("config", () => {
  it("returns defaults when config is missing", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-config-"));
    const config = readConfig(rootDir);
    expect(config.profile).toBe("core");
    expect(config.workflows.length).toBeGreaterThan(0);
    expect(config.tools).toEqual([]);
    expect(config.integrations.writeBackEnabled).toBe(false);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("writes default config when absent", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-config-"));
    writeDefaultConfig(rootDir);
    const configPath = path.join(rootDir, "projectspec", "config.yaml");
    expect(fs.existsSync(configPath)).toBe(true);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("merges partial config with defaults", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-config-"));
    const configPath = path.join(rootDir, "projectspec", "config.yaml");
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(
      configPath,
      "profile: custom\nworkflows: []\nintegrations:\n  writeBackEnabled: true\n",
      "utf8",
    );
    const config = readConfig(rootDir);
    expect(config.profile).toBe("custom");
    expect(config.workflows).toEqual([]);
    expect(config.tools).toEqual([]);
    expect(config.integrations.writeBackEnabled).toBe(true);
    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
