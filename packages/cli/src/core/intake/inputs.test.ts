import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { classifyIntakeInputs } from "./inputs.js";

describe("intake input parsing", () => {
  it("classifies jira keys, confluence urls, and file paths", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-intake-"));
    const filePath = path.join(rootDir, "notes.md");
    fs.writeFileSync(filePath, "notes", "utf8");

    const result = classifyIntakeInputs(
      [
        "ROSSCRISP-2712",
        "https://inter-ikea.atlassian.net/wiki/spaces/ABC/pages/12345",
        filePath,
        "unknown",
      ],
      { cwd: rootDir },
    );

    expect(result.jiraKeys).toEqual(["ROSSCRISP-2712"]);
    expect(result.confluenceUrls).toHaveLength(1);
    expect(result.filePaths).toEqual([filePath]);
    expect(result.unknown).toEqual(["unknown"]);

    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
