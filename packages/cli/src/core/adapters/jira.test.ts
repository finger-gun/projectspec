import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";

vi.mock("../audit.js", () => ({
  recordChangeActivity: vi.fn(),
}));

import { readImportRegistry } from "../imports.js";
import { runJiraImport } from "./jira.js";

describe("jira adapter", () => {
  it("writes snapshot and registry metadata", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-jira-"));
    const result = await runJiraImport(
      {
        instanceUrl: "https://jira.example.com",
        projectKey: "PROJ",
        query: "project = PROJ",
        userEmail: "user@example.com",
        pat: "token",
        payload: {
          epics: [
            {
              id: "1",
              key: "PROJ-1",
              summary: "Epic A",
              status: "Open",
              issueType: "Epic",
            },
          ],
          stories: [],
        },
      },
      rootDir,
    );

    const snapshotPath = path.join(result.snapshotPath, "jira.json");
    expect(fs.existsSync(snapshotPath)).toBe(true);
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as {
      epics: Array<{ key: string }>;
      metadata: Record<string, string>;
    };
    expect(snapshot.epics[0].key).toBe("PROJ-1");
    expect(snapshot.metadata.jiraInstanceUrl).toBe("https://jira.example.com");
    expect(snapshot.metadata.jiraProjectKey).toBe("PROJ");
    expect(snapshot.metadata.jiraQuery).toBe("project = PROJ");

    const registry = readImportRegistry(rootDir);
    expect(registry.sources.jira.metadata?.jiraInstanceUrl).toBe("https://jira.example.com");
    expect(registry.sources.jira.latestSnapshot).toContain("jira");
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("fetches issues when payload is not provided", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-jira-"));
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          total: 1,
          maxResults: 50,
          issues: [
            {
              id: "2",
              key: "PROJ-2",
              fields: {
                summary: "Story A",
                status: { name: "In Progress" },
                issuetype: { name: "Story" },
              },
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await runJiraImport(
      {
        instanceUrl: "https://jira.example.com",
        projectKey: "PROJ",
        userEmail: "user@example.com",
        pat: "token",
        issueKeys: ["PROJ-2"],
        fetchFn,
      },
      rootDir,
    );

    expect(fetchFn).toHaveBeenCalled();
    const callUrl = new URL(String(fetchFn.mock.calls[0]?.[0]));
    expect(callUrl.pathname).toContain("/rest/api/3/search/jql");
    expect(callUrl.searchParams.get("jql")).toContain("key in (PROJ-2)");
    const snapshotPath = path.join(result.snapshotPath, "jira.json");
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as {
      stories: Array<{ key: string }>;
    };
    expect(snapshot.stories[0].key).toBe("PROJ-2");
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("uses home config when env is missing", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-jira-"));
    const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-home-"));
    fs.mkdirSync(path.join(rootDir, "projectspec"), { recursive: true });
    fs.writeFileSync(
      path.join(rootDir, "projectspec", "config.yaml"),
      "projectId: test-project\nprofile: core\nworkflows: []\ntools: []\nintegrations:\n  writeBackEnabled: false\n",
      "utf8",
    );
    fs.mkdirSync(path.join(homeDir, ".projectspec"), { recursive: true });
    fs.writeFileSync(
      path.join(homeDir, ".projectspec", "config.yaml"),
      "version: 1\nprojects:\n  test-project:\n    connectors:\n      jira:\n        JIRA_API_URL: https://jira.example.com\n        JIRA_OAUTH_TOKEN: token\n        JIRA_PROJECT_KEY: PROJ\n",
      "utf8",
    );

    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({ total: 0, maxResults: 50, issues: [] }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const originalHome = process.env.PROJECTSPEC_HOME;
    process.env.PROJECTSPEC_HOME = homeDir;
    const result = await runJiraImport({ fetchFn }, rootDir);
    expect(result.snapshotPath).toContain("jira");
    process.env.PROJECTSPEC_HOME = originalHome;
    fs.rmSync(rootDir, { recursive: true, force: true });
    fs.rmSync(homeDir, { recursive: true, force: true });
  });
});
