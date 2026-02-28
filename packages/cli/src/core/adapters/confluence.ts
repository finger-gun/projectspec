import fs from "fs";
import path from "path";
import {
  ImportAdapter,
  ImportAdapterResult,
  createSnapshotDirectory,
  recordImportActivity,
  updateImportRegistry,
} from "../imports.js";

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

export interface ConfluenceImportOptions {
  instanceUrl?: string;
  userEmail?: string;
  pat?: string;
  spaceKey?: string;
  pageIds?: string[];
  urls?: string[];
  fetchFn?: Fetcher;
}

export interface ConfluenceSnapshotPage {
  id: string;
  title: string;
  url: string;
  body?: string;
  updated?: string;
}

export interface ConfluenceSnapshotPayload {
  pages: ConfluenceSnapshotPage[];
  metadata?: Record<string, string>;
}

export function createConfluenceAdapter(options: ConfluenceImportOptions): ImportAdapter {
  return {
    source: "confluence",
    run: async () => runConfluenceImport(options),
  };
}

export async function runConfluenceImport(
  options: ConfluenceImportOptions,
  rootDir: string = process.cwd(),
): Promise<ImportAdapterResult> {
  const timestamp = new Date().toISOString();
  const snapshotDir = createSnapshotDirectory("confluence", timestamp, rootDir);
  const snapshotPath = path.join(snapshotDir, "confluence.json");
  const resolved = resolveConfluenceOptions(options);
  const pages = await fetchConfluencePages(resolved);
  const metadata = buildConfluenceMetadata(resolved);
  const payload: ConfluenceSnapshotPayload = {
    pages,
    metadata,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(payload, null, 2), "utf8");

  recordImportActivity("confluence", "import", timestamp);
  updateImportRegistry(
    {
      source: "confluence",
      snapshotPath: snapshotDir,
      timestamp,
      metadata,
    },
    rootDir,
  );

  return {
    source: "confluence",
    snapshotPath: snapshotDir,
    timestamp,
    metadata,
  };
}

interface ResolvedConfluenceOptions {
  instanceUrl: string;
  userEmail: string;
  pat: string;
  spaceKey?: string;
  pageIds: string[];
  fetchFn: Fetcher;
}

function resolveConfluenceOptions(options: ConfluenceImportOptions): ResolvedConfluenceOptions {
  const inferredInstance = inferInstanceUrl(options.urls);
  const instanceUrl = options.instanceUrl ?? process.env.CONFLUENCE_API_URL ?? inferredInstance ?? "";
  const userEmail = options.userEmail ?? process.env.CONFLUENCE_USER ?? "";
  const pat = options.pat ?? process.env.CONFLUENCE_PAT ?? process.env.JIRA_PAT ?? "";
  const spaceKey = options.spaceKey ?? process.env.CONFLUENCE_SPACE_KEY;
  const pageIdsFromEnv = process.env.CONFLUENCE_PAGE_IDS
    ? process.env.CONFLUENCE_PAGE_IDS.split(",").map((value) => value.trim()).filter(Boolean)
    : [];
  const pageIds = collectPageIds(options.pageIds, options.urls, pageIdsFromEnv);
  const fetchFn = options.fetchFn ?? fetch;
  if (!instanceUrl || !pat) {
    throw new Error("Confluence import requires instanceUrl and PAT.");
  }
  if (pageIds.length === 0) {
    throw new Error("Confluence import requires at least one page id or URL.");
  }
  return {
    instanceUrl,
    userEmail,
    pat,
    spaceKey,
    pageIds,
    fetchFn,
  };
}

async function fetchConfluencePages(
  options: ResolvedConfluenceOptions,
): Promise<ConfluenceSnapshotPage[]> {
  const pages: ConfluenceSnapshotPage[] = [];
  for (const pageId of options.pageIds) {
    const url = new URL(`/wiki/rest/api/content/${pageId}`, options.instanceUrl);
    url.searchParams.set("expand", "body.storage,version,space");
  const response = await options.fetchFn(url.toString(), {
    headers: {
      Authorization: buildConfluenceAuth(options.userEmail, options.pat),
      Accept: "application/json",
    },
  });
    if (!response.ok) {
      throw new Error(`Confluence import failed: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as ConfluencePageResponse;
    pages.push({
      id: data.id,
      title: data.title ?? "",
      url: buildConfluencePageUrl(options.instanceUrl, data),
      body: data.body?.storage?.value,
      updated: data.version?.when,
    });
  }
  return pages;
}

function buildConfluenceMetadata(options: ResolvedConfluenceOptions): Record<string, string> {
  const metadata: Record<string, string> = {
    confluenceInstanceUrl: options.instanceUrl,
    confluencePageIds: options.pageIds.join(","),
  };
  if (options.spaceKey) {
    metadata.confluenceSpaceKey = options.spaceKey;
  }
  return metadata;
}

function collectPageIds(
  pageIds?: string[],
  urls?: string[],
  fallback: string[] = [],
): string[] {
  const collected = new Set<string>();
  for (const id of pageIds ?? []) {
    if (id) {
      collected.add(id);
    }
  }
  for (const url of urls ?? []) {
    const id = extractPageId(url);
    if (id) {
      collected.add(id);
    }
  }
  for (const id of fallback) {
    if (id) {
      collected.add(id);
    }
  }
  return Array.from(collected);
}

function extractPageId(value: string): string | null {
  try {
    const url = new URL(value);
    const pageId = url.searchParams.get("pageId");
    if (pageId) {
      return pageId;
    }
    const match = url.pathname.match(/\/pages\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function inferInstanceUrl(urls?: string[]): string | null {
  if (!urls || urls.length === 0) {
    return null;
  }
  for (const value of urls) {
    try {
      const url = new URL(value);
      return `${url.protocol}//${url.host}`;
    } catch {
      continue;
    }
  }
  return null;
}

function buildConfluenceAuth(userEmail: string, pat: string): string {
  if (userEmail) {
    const token = Buffer.from(`${userEmail}:${pat}`).toString("base64");
    return `Basic ${token}`;
  }
  return `Bearer ${pat}`;
}

interface ConfluencePageResponse {
  id: string;
  title?: string;
  body?: { storage?: { value?: string } };
  version?: { when?: string };
  space?: { key?: string };
  _links?: { webui?: string };
}

function buildConfluencePageUrl(instanceUrl: string, page: ConfluencePageResponse): string {
  const webui = page._links?.webui;
  if (webui) {
    return new URL(webui, instanceUrl).toString();
  }
  return instanceUrl;
}
