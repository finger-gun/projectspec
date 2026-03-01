import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it, vi } from "vitest";

vi.mock("../audit.js", () => ({
  recordChangeActivity: vi.fn(),
}));

import { readImportRegistry } from "../imports.js";
import { runConfluenceImport } from "./confluence.js";

describe("confluence adapter", () => {
  it("writes snapshot and registry metadata", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-confluence-"));
    const fetchFn = vi.fn(async (input) => {
      const url = String(input);
      if (url.includes("/child/attachment")) {
        return new Response(
          JSON.stringify({
            results: [
              {
                id: "att-1",
                title: "spec.xlsx",
                mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                extensions: { fileSize: 12 },
                _links: { download: "/wiki/download/attachments/123/spec.xlsx" },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("/wiki/download/attachments/")) {
        return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
      }
      return new Response(
        JSON.stringify({
          id: "123",
          title: "Page A",
          body: { storage: { value: "<p>Body</p><a href=\"/wiki/spaces/ABC/pages/456\">linked</a>" } },
          version: { when: "2024-01-01" },
          _links: { webui: "/wiki/spaces/ABC/pages/123" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const result = await runConfluenceImport(
      {
        instanceUrl: "https://confluence.example.com",
        userEmail: "user@example.com",
        pat: "token",
        spaceKey: "ABC",
        pageIds: ["123"],
        fetchFn,
      },
      rootDir,
    );

    const snapshotPath = path.join(result.snapshotPath, "confluence.json");
    expect(fs.existsSync(snapshotPath)).toBe(true);
    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, "utf8")) as {
      pages: Array<{ title: string; attachments?: Array<{ title?: string; snapshotPath?: string }> }>;
      metadata: Record<string, string>;
    };
    expect(snapshot.pages[0].title).toBe("Page A");
    expect(snapshot.pages[0].attachments?.[0]?.title).toBe("spec.xlsx");
    expect(snapshot.pages[0].attachments?.[0]?.snapshotPath).toContain(
      path.join("attachments", "123", "spec.xlsx"),
    );
    expect(snapshot.metadata.confluenceInstanceUrl).toBe("https://confluence.example.com");
    expect(snapshot.metadata.confluenceSpaceKey).toBe("ABC");

    const registry = readImportRegistry(rootDir);
    expect(registry.sources.confluence.metadata?.confluencePageIds).toBe("123");
    expect(registry.sources.confluence.metadata?.confluenceLinkedPageIds).toBe("456");
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("uses bearer auth when user email is missing", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-confluence-"));
    const fetchFn = vi.fn(async (input, init) => {
      const auth = init?.headers && "Authorization" in init.headers
        ? String((init.headers as Record<string, string>).Authorization)
        : "";
      expect(auth).toBe("Bearer token");
      if (String(input).includes("/child/attachment")) {
        return new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          id: "321",
          title: "Page B",
          body: { storage: { value: "<p>Body</p>" } },
          version: { when: "2024-01-02" },
          _links: { webui: "/wiki/spaces/ABC/pages/321" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    await runConfluenceImport(
      {
        instanceUrl: "https://confluence.example.com",
        pat: "token",
        pageIds: ["321"],
        fetchFn,
      },
      rootDir,
    );

    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("uses home config when env is missing", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-confluence-"));
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
      "version: 1\nprojects:\n  test-project:\n    connectors:\n      confluence:\n        CONFLUENCE_API_URL: https://confluence.example.com\n        CONFLUENCE_OAUTH_TOKEN: token\n        CONFLUENCE_PAGE_IDS: 321\n",
      "utf8",
    );

    const fetchFn = vi.fn(async (input) => {
      if (String(input).includes("/child/attachment")) {
        return new Response(JSON.stringify({ results: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({
          id: "321",
          title: "Page B",
          body: { storage: { value: "<p>Body</p>" } },
          version: { when: "2024-01-02" },
          _links: { webui: "/wiki/spaces/ABC/pages/321" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    });

    const originalHome = process.env.PROJECTSPEC_HOME;
    process.env.PROJECTSPEC_HOME = homeDir;
    const result = await runConfluenceImport({ fetchFn }, rootDir);
    expect(result.snapshotPath).toContain("confluence");
    process.env.PROJECTSPEC_HOME = originalHome;
    fs.rmSync(rootDir, { recursive: true, force: true });
    fs.rmSync(homeDir, { recursive: true, force: true });
  });
});
