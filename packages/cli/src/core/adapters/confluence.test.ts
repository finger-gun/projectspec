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
    const fetchFn = vi.fn(async () =>
      new Response(
        JSON.stringify({
          id: "123",
          title: "Page A",
          body: { storage: { value: "<p>Body</p>" } },
          version: { when: "2024-01-01" },
          _links: { webui: "/wiki/spaces/ABC/pages/123" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

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
      pages: Array<{ title: string }>;
      metadata: Record<string, string>;
    };
    expect(snapshot.pages[0].title).toBe("Page A");
    expect(snapshot.metadata.confluenceInstanceUrl).toBe("https://confluence.example.com");
    expect(snapshot.metadata.confluenceSpaceKey).toBe("ABC");

    const registry = readImportRegistry(rootDir);
    expect(registry.sources.confluence.metadata?.confluencePageIds).toBe("123");
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("uses bearer auth when user email is missing", async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-confluence-"));
    const fetchFn = vi.fn(async (_input, init) => {
      const auth = init?.headers && "Authorization" in init.headers
        ? String((init.headers as Record<string, string>).Authorization)
        : "";
      expect(auth).toBe("Bearer token");
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
});
