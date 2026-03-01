import fs from "fs";
import path from "path";
import {
  ImportAdapter,
  ImportAdapterResult,
  createSnapshotDirectory,
  recordImportActivity,
  updateImportRegistry,
} from "../imports.js";
import { getProjectId } from "../config.js";
import { getProjectConnectorConfig } from "../home-config.js";

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

export interface ConfluenceImportOptions {
  instanceUrl?: string;
  userEmail?: string;
  pat?: string;
  oauthToken?: string;
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
  const resolved = resolveConfluenceOptions(options, rootDir);
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
  oauthToken?: string;
  spaceKey?: string;
  pageIds: string[];
  fetchFn: Fetcher;
}

function resolveConfluenceOptions(
  options: ConfluenceImportOptions,
  rootDir: string,
): ResolvedConfluenceOptions {
  const projectId = getProjectId(rootDir);
  const stored = projectId ? getProjectConnectorConfig(projectId, "confluence") : null;
  const inferredInstance = inferInstanceUrl(options.urls);
  const instanceUrl =
    options.instanceUrl ??
    process.env.CONFLUENCE_API_URL ??
    stored?.CONFLUENCE_API_URL ??
    inferredInstance ??
    "";
  const userEmail =
    options.userEmail ?? process.env.CONFLUENCE_USER ?? stored?.CONFLUENCE_USER ?? "";
  const pat =
    options.pat ??
    process.env.CONFLUENCE_PAT ??
    stored?.CONFLUENCE_PAT ??
    process.env.JIRA_PAT ??
    "";
  const oauthToken =
    options.oauthToken ?? process.env.CONFLUENCE_OAUTH_TOKEN ?? stored?.CONFLUENCE_OAUTH_TOKEN;
  const spaceKey = options.spaceKey ?? process.env.CONFLUENCE_SPACE_KEY ?? stored?.CONFLUENCE_SPACE_KEY;
  const pageIdsFromEnv = process.env.CONFLUENCE_PAGE_IDS
    ? process.env.CONFLUENCE_PAGE_IDS.split(",").map((value) => value.trim()).filter(Boolean)
    : [];
  const storedPageIds = stored?.CONFLUENCE_PAGE_IDS;
  const pageIdsFromConfig = storedPageIds
    ? String(storedPageIds).split(",").map((value) => value.trim()).filter(Boolean)
    : [];
  const pageIds = collectPageIds(options.pageIds, options.urls, pageIdsFromEnv);
  const pageIdsFinal = pageIds.length > 0 ? pageIds : pageIdsFromConfig;
  const fetchFn = options.fetchFn ?? fetch;
  if (isConnectorDebugEnabled()) {
    console.log("[confluence] resolved config", {
      instanceUrl,
      instanceUrlSource: resolveValueSource(
        options.instanceUrl,
        process.env.CONFLUENCE_API_URL,
        stored?.CONFLUENCE_API_URL,
        inferredInstance,
      ),
      userEmailPresent: Boolean(userEmail),
      userEmailSource: resolveValueSource(
        options.userEmail,
        process.env.CONFLUENCE_USER,
        stored?.CONFLUENCE_USER,
      ),
      patPresent: Boolean(pat),
      patSource: resolveValueSource(
        options.pat,
        process.env.CONFLUENCE_PAT,
        stored?.CONFLUENCE_PAT,
        process.env.JIRA_PAT,
      ),
      oauthTokenPresent: Boolean(oauthToken),
      oauthTokenSource: resolveValueSource(
        options.oauthToken,
        process.env.CONFLUENCE_OAUTH_TOKEN,
        stored?.CONFLUENCE_OAUTH_TOKEN,
      ),
      spaceKeyPresent: Boolean(spaceKey),
      spaceKeySource: resolveValueSource(
        options.spaceKey,
        process.env.CONFLUENCE_SPACE_KEY,
        stored?.CONFLUENCE_SPACE_KEY,
      ),
      pageIds: pageIdsFinal,
      pageIdsSource: resolvePageIdsSource(
        options.pageIds,
        options.urls,
        pageIdsFromEnv,
        pageIdsFromConfig,
      ),
    });
  }
  if (!instanceUrl || (!oauthToken && !pat)) {
    throw new Error("Confluence import requires instanceUrl and PAT.");
  }
  if (pageIdsFinal.length === 0) {
    throw new Error("Confluence import requires at least one page id or URL.");
  }
  return {
    instanceUrl,
    userEmail,
    pat,
    oauthToken,
    spaceKey,
    pageIds: pageIdsFinal,
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
      Authorization: buildConfluenceAuth(options.userEmail, options.pat, options.oauthToken),
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

function resolvePageIdsSource(
  pageIds?: string[],
  urls?: string[],
  pageIdsFromEnv: string[] = [],
  pageIdsFromConfig: string[] = [],
): string {
  if (pageIds && pageIds.length > 0) {
    return "options.pageIds";
  }
  if (urls && urls.length > 0) {
    return "options.urls";
  }
  if (pageIdsFromEnv.length > 0) {
    return "env.CONFLUENCE_PAGE_IDS";
  }
  if (pageIdsFromConfig.length > 0) {
    return "homeConfig.CONFLUENCE_PAGE_IDS";
  }
  return "missing";
}

function resolveValueSource(
  optionsValue?: string | null,
  envValue?: string | null,
  storedValue?: string | null,
  fallbackValue?: string | null,
): string {
  if (optionsValue) {
    return "options";
  }
  if (envValue) {
    return "env";
  }
  if (storedValue) {
    return "homeConfig";
  }
  if (fallbackValue) {
    return "fallback";
  }
  return "missing";
}

function isConnectorDebugEnabled(): boolean {
  const raw = process.env.CONNECTOR_DEBUG ?? "";
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function buildConfluenceAuth(userEmail: string, pat: string, oauthToken?: string): string {
  if (oauthToken) {
    return `Bearer ${oauthToken}`;
  }
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
