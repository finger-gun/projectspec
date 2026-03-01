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
  attachments?: ConfluenceAttachment[];
}

export interface ConfluenceAttachment {
  id: string;
  title: string;
  mediaType?: string;
  size?: number;
  downloadUrl?: string;
  snapshotPath?: string;
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
  const { pages, linkedPageIds } = await fetchConfluencePages(resolved, snapshotDir);
  const metadata = buildConfluenceMetadata(resolved, linkedPageIds);
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

interface ConfluencePageFetchResult {
  page: ConfluenceSnapshotPage;
  linkedPageIds: string[];
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
  snapshotDir: string,
): Promise<{ pages: ConfluenceSnapshotPage[]; linkedPageIds: string[] }> {
  const pages: ConfluenceSnapshotPage[] = [];
  const fetched = new Set<string>();
  const discovered = new Set<string>();
  const attachmentsRoot = path.join(snapshotDir, "attachments");
  for (const pageId of options.pageIds) {
    const result = await fetchConfluencePage(options, pageId, attachmentsRoot, true);
    if (result) {
      pages.push(result.page);
      fetched.add(pageId);
      for (const linkedId of result.linkedPageIds) {
        if (linkedId && !fetched.has(linkedId)) {
          discovered.add(linkedId);
        }
      }
    }
  }
  const linkedPageIds = Array.from(discovered).filter((id) => !fetched.has(id));
  const maxLinked = 10;
  const limited = linkedPageIds.slice(0, maxLinked);
  for (const pageId of limited) {
    const result = await fetchConfluencePage(options, pageId, attachmentsRoot, false, true);
    if (result) {
      pages.push(result.page);
    }
  }
  return { pages, linkedPageIds: limited };
}

async function fetchConfluencePage(
  options: ResolvedConfluenceOptions,
  pageId: string,
  attachmentsRoot: string,
  collectLinks: boolean,
  allowMissing: boolean = false,
): Promise<ConfluencePageFetchResult | null> {
  const url = new URL(`/wiki/rest/api/content/${pageId}`, options.instanceUrl);
  url.searchParams.set("expand", "body.storage,version,space");
  const response = await options.fetchFn(url.toString(), {
    headers: {
      Authorization: buildConfluenceAuth(options.userEmail, options.pat, options.oauthToken),
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    if (allowMissing && response.status === 404) {
      return null;
    }
    throw new Error(`Confluence import failed: ${response.status} ${response.statusText}`);
  }
  const data = (await response.json()) as ConfluencePageResponse;
  const attachments = await fetchConfluenceAttachments(options, pageId, attachmentsRoot);
  const body = data.body?.storage?.value;
  const linkedPageIds = collectLinks && body ? extractLinkedPageIds(body) : [];
  return {
    page: {
      id: data.id,
      title: data.title ?? "",
      url: buildConfluencePageUrl(options.instanceUrl, data),
      body,
      updated: data.version?.when,
      attachments,
    },
    linkedPageIds,
  };
}

async function fetchConfluenceAttachments(
  options: ResolvedConfluenceOptions,
  pageId: string,
  attachmentsRoot: string,
): Promise<ConfluenceAttachment[]> {
  const url = new URL(`/wiki/rest/api/content/${pageId}/child/attachment`, options.instanceUrl);
  url.searchParams.set("limit", "200");
  const response = await options.fetchFn(url.toString(), {
    headers: {
      Authorization: buildConfluenceAuth(options.userEmail, options.pat, options.oauthToken),
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as ConfluenceAttachmentResponse;
  if (!data.results || data.results.length === 0) {
    return [];
  }
  const pageDir = path.join(attachmentsRoot, pageId);
  fs.mkdirSync(pageDir, { recursive: true });
  const attachments: ConfluenceAttachment[] = [];
  for (const item of data.results) {
    const downloadUrl = item._links?.download
      ? new URL(item._links.download, options.instanceUrl).toString()
      : undefined;
    let snapshotPath: string | undefined;
    if (downloadUrl) {
      snapshotPath = await attemptAttachmentDownload(
        downloadUrl,
        item.title ?? item.id ?? "attachment",
        pageDir,
        options,
      );
    }
    attachments.push({
      id: item.id ?? "",
      title: item.title ?? "",
      mediaType: item.mediaType,
      size: item.extensions?.fileSize,
      downloadUrl,
      snapshotPath,
    });
  }
  return attachments;
}

async function attemptAttachmentDownload(
  downloadUrl: string,
  title: string,
  pageDir: string,
  options: ResolvedConfluenceOptions,
): Promise<string | undefined> {
  const fileName = sanitizeFilename(title);
  const primary = await fetchAttachmentBinary(downloadUrl, options);
  if (primary) {
    const snapshotPath = path.join(pageDir, fileName);
    fs.writeFileSync(snapshotPath, primary);
    return snapshotPath;
  }
  const fileNameEncoded = encodeURIComponent(title);
  const fallbackUrl = new URL(
    `/wiki/download/attachments/${path.basename(pageDir)}/${fileNameEncoded}`,
    options.instanceUrl,
  ).toString();
  const fallback = await fetchAttachmentBinary(fallbackUrl, options);
  if (fallback) {
    const snapshotPath = path.join(pageDir, fileName);
    fs.writeFileSync(snapshotPath, fallback);
    return snapshotPath;
  }
  return undefined;
}

async function fetchAttachmentBinary(
  url: string,
  options: ResolvedConfluenceOptions,
): Promise<Buffer | undefined> {
  try {
    const response = await options.fetchFn(url, {
      headers: {
        Authorization: buildConfluenceAuth(options.userEmail, options.pat, options.oauthToken),
        Accept: "application/octet-stream",
      },
    });
    if (!response.ok) {
      return undefined;
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.length > 0 ? buffer : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeFilename(value: string): string {
  const trimmed = value.trim() || "attachment";
  return trimmed.replace(/[\\/\0]/g, "-");
}

function buildConfluenceMetadata(
  options: ResolvedConfluenceOptions,
  linkedPageIds: string[],
): Record<string, string> {
  const metadata: Record<string, string> = {
    confluenceInstanceUrl: options.instanceUrl,
    confluencePageIds: options.pageIds.join(","),
  };
  if (options.spaceKey) {
    metadata.confluenceSpaceKey = options.spaceKey;
  }
  if (linkedPageIds.length > 0) {
    metadata.confluenceLinkedPageIds = linkedPageIds.join(",");
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

function extractLinkedPageIds(html: string): string[] {
  const ids = new Set<string>();
  const pageIdRegex = /pageId=(\d+)/g;
  const pathRegex = /\/pages\/(\d+)/g;
  let match: RegExpExecArray | null;
  while ((match = pageIdRegex.exec(html))) {
    ids.add(match[1]);
  }
  while ((match = pathRegex.exec(html))) {
    ids.add(match[1]);
  }
  return Array.from(ids);
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

interface ConfluenceAttachmentResponse {
  results?: Array<{
    id?: string;
    title?: string;
    mediaType?: string;
    extensions?: { fileSize?: number };
    _links?: { download?: string };
  }>;
}

function buildConfluencePageUrl(instanceUrl: string, page: ConfluencePageResponse): string {
  const webui = page._links?.webui;
  if (webui) {
    return new URL(webui, instanceUrl).toString();
  }
  return instanceUrl;
}
