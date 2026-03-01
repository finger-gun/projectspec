import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";

import { main, loadEnv } from "./intake-connectors.js";

vi.mock("../core/intake/connectors.js", () => ({
  runIntakeConnectors: vi.fn(async () => ({
    jiraSnapshots: ["jira"],
    confluenceSnapshots: ["confluence"],
    intakeFiles: ["file"],
    unknown: ["unknown"],
  })),
}));

describe("intake-connectors script", () => {
  it("loads env from current directory", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-env-"));
    const envPath = path.join(rootDir, ".env");
    fs.writeFileSync(envPath, "TEST_KEY=VALUE\n#COMMENT\n", "utf8");
    const loaded = loadEnv(rootDir);
    expect(loaded).toBe(envPath);
    expect(process.env.TEST_KEY).toBe("VALUE");

    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("prints summary and unknown inputs", async () => {
    const stdoutSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const argv = process.argv.slice();
    process.argv = ["node", "intake-connectors.js", "JIRA-1", "https://example.atlassian.net/wiki/spaces/ABC/pages/123"];

    await main();

    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Jira snapshots: 1"));
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Confluence snapshots: 1"));
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Intake files: 1"));
    expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining("Unrecognized inputs: unknown"));

    stdoutSpy.mockRestore();
    stderrSpy.mockRestore();
    process.argv = argv;
  });

  it("errors when no inputs are provided", async () => {
    const stderrSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const argv = process.argv.slice();
    process.argv = ["node", "intake-connectors.js"];

    await main();

    expect(stderrSpy).toHaveBeenCalledWith("No intake inputs provided.\n");
    stderrSpy.mockRestore();
    process.argv = argv;
  });
});
