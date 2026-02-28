import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { runIntakeConnectors } from "./connectors.js";

describe("intake connectors", () => {
  it("runs connectors and copies files", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-intake-"));
    const filePath = path.join(rootDir, "note.txt");
    fs.writeFileSync(filePath, "note", "utf8");

    const jiraFetchFn = async (): Promise<Response> =>
      new Response(
        JSON.stringify({
          total: 0,
          maxResults: 50,
          issues: [],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    const confluenceFetchFn = async (): Promise<Response> =>
      new Response(
        JSON.stringify({
          id: "1",
          title: "Page",
          body: { storage: { value: "<p>Body</p>" } },
          version: { when: "2024-01-01" },
          _links: { webui: "/wiki/spaces/ABC/pages/1" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );

    const originalEnv = { ...process.env };
    process.env.JIRA_API_URL = "https://jira.example.com";
    process.env.JIRA_USER = "user@example.com";
    process.env.JIRA_PAT = "token";
    process.env.CONFLUENCE_API_URL = "https://confluence.example.com";
    process.env.CONFLUENCE_USER = "user@example.com";
    process.env.CONFLUENCE_PAT = "token";

    const result = await runIntakeConnectors(
      [
        "ROSSCRISP-2712",
        "https://confluence.example.com/wiki/spaces/ABC/pages/1?pageId=1",
        filePath,
      ],
      { rootDir, jiraFetchFn, confluenceFetchFn },
    );

    expect(result.jiraSnapshots).toHaveLength(1);
    expect(result.confluenceSnapshots).toHaveLength(1);
    expect(result.intakeFiles).toHaveLength(1);

    process.env = originalEnv;
    fs.rmSync(rootDir, { recursive: true, force: true });
  });
});
