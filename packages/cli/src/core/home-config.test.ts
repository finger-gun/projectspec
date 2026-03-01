import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { readHomeConfig, setProjectConnectors } from "./home-config.js";

describe("home config", () => {
  it("writes and reads project connector config", () => {
    const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-home-"));
    setProjectConnectors(
      "project-1",
      {
        jira: {
          JIRA_API_URL: "https://jira.example.com",
          JIRA_USER: "user@example.com",
          JIRA_PAT: "token",
          JIRA_PROJECT_KEY: "PROJ",
        },
        confluence: {
          CONFLUENCE_PAT: "token",
        },
      },
      homeDir,
    );

    const config = readHomeConfig(homeDir);
    expect(config.projects["project-1"].connectors.jira.JIRA_PROJECT_KEY).toBe("PROJ");
    fs.rmSync(homeDir, { recursive: true, force: true });
  });
});
