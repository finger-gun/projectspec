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

export interface JiraImportOptions {
  instanceUrl?: string;
  projectKey?: string;
  query?: string;
  payloadPath?: string;
  payload?: JiraSnapshotPayload;
  userEmail?: string;
  pat?: string;
  oauthToken?: string;
  issueKeys?: string[];
  fetchFn?: Fetcher;
}

export interface JiraSnapshotIssue {
  id: string;
  key: string;
  summary: string;
  status: string;
  issueType: string;
  assignee?: string;
  parentKey?: string;
  labels?: string[];
  updated?: string;
}

export interface JiraSnapshotPayload {
  epics: JiraSnapshotIssue[];
  stories: JiraSnapshotIssue[];
  metadata?: Record<string, string>;
}

export function createJiraAdapter(options: JiraImportOptions): ImportAdapter {
  return {
    source: "jira",
    run: async () => runJiraImport(options),
  };
}

export async function runJiraImport(
  options: JiraImportOptions,
  rootDir: string = process.cwd(),
): Promise<ImportAdapterResult> {
  const timestamp = new Date().toISOString();
  const snapshotDir = createSnapshotDirectory("jira", timestamp, rootDir);
  const snapshotPath = path.join(snapshotDir, "jira.json");
  const resolved = resolveJiraOptions(options, rootDir);
  const payload = await resolvePayload(resolved);
  const metadata = buildJiraMetadata(resolved);
  const snapshot: JiraSnapshotPayload = {
    epics: payload.epics ?? [],
    stories: payload.stories ?? [],
    metadata,
  };
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), "utf8");

  recordImportActivity("jira", "import", timestamp);
  updateImportRegistry(
    {
      source: "jira",
      snapshotPath: snapshotDir,
      timestamp,
      metadata,
    },
    rootDir,
  );

  return {
    source: "jira",
    snapshotPath: snapshotDir,
    timestamp,
    metadata,
  };
}

interface ResolvedJiraOptions {
  instanceUrl: string;
  projectKey: string;
  query: string;
  userEmail: string;
  pat: string;
  oauthToken?: string;
  issueKeys: string[];
  payloadPath?: string;
  payload?: JiraSnapshotPayload;
  fetchFn: Fetcher;
}

function resolveJiraOptions(
  options: JiraImportOptions,
  rootDir: string,
): ResolvedJiraOptions {
  const projectId = getProjectId(rootDir);
  const stored = projectId ? getProjectConnectorConfig(projectId, "jira") : null;
  const instanceUrl = options.instanceUrl ?? process.env.JIRA_API_URL ?? "";
  const issueKeys = options.issueKeys ?? [];
  const inferredProjectKey = issueKeys[0]?.split("-")[0];
  const projectKey =
    options.projectKey ??
    process.env.JIRA_PROJECT_KEY ??
    stored?.JIRA_PROJECT_KEY ??
    inferredProjectKey ??
    "";
  const query =
    options.query ??
    process.env.JIRA_QUERY ??
    stored?.JIRA_QUERY ??
    buildDefaultQuery(projectKey, issueKeys);
  const userEmail = options.userEmail ?? process.env.JIRA_USER ?? stored?.JIRA_USER ?? "";
  const pat = options.pat ?? process.env.JIRA_PAT ?? stored?.JIRA_PAT ?? "";
  const oauthToken =
    options.oauthToken ?? process.env.JIRA_OAUTH_TOKEN ?? stored?.JIRA_OAUTH_TOKEN;
  const resolvedInstance =
    instanceUrl || stored?.JIRA_API_URL ? instanceUrl || stored?.JIRA_API_URL || "" : "";
  const resolvedUser = userEmail;
  const resolvedPat = pat;
  const fetchFn = options.fetchFn ?? fetch;
  if (!resolvedInstance || !projectKey || (!oauthToken && (!resolvedUser || !resolvedPat))) {
    throw new Error("Jira import requires instanceUrl, projectKey, userEmail, and PAT.");
  }
  return {
    instanceUrl: resolvedInstance,
    projectKey,
    query,
    userEmail: resolvedUser,
    pat: resolvedPat,
    oauthToken,
    issueKeys,
    payloadPath: options.payloadPath,
    payload: options.payload,
    fetchFn,
  };
}

async function resolvePayload(options: ResolvedJiraOptions): Promise<JiraSnapshotPayload> {
  if (options.payload) {
    return options.payload;
  }
  if (options.payloadPath) {
    const raw = fs.readFileSync(options.payloadPath, "utf8");
    return JSON.parse(raw) as JiraSnapshotPayload;
  }
  return fetchJiraSnapshot(options);
}

async function fetchJiraSnapshot(options: ResolvedJiraOptions): Promise<JiraSnapshotPayload> {
  const issues: JiraSnapshotIssue[] = [];
  const fields = [
    "summary",
    "status",
    "issuetype",
    "assignee",
    "labels",
    "parent",
    "updated",
  ];
  let startAt = 0;
  const maxResults = 50;
  let total = Infinity;

  while (startAt < total) {
    const url = new URL("/rest/api/3/search/jql", options.instanceUrl);
    url.searchParams.set("jql", options.query);
    url.searchParams.set("startAt", String(startAt));
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("fields", fields.join(","));
    const response = await options.fetchFn(url.toString(), {
      headers: {
        Authorization: buildJiraAuth(options.userEmail, options.pat, options.oauthToken),
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Jira import failed: ${response.status} ${response.statusText}`);
    }
    const data = (await response.json()) as JiraSearchResponse;
    total = data.total ?? 0;
    for (const issue of data.issues ?? []) {
      issues.push(mapIssue(issue));
    }
    startAt += data.maxResults ?? maxResults;
    if ((data.issues ?? []).length === 0) {
      break;
    }
  }

  const epics = issues.filter((issue) => issue.issueType === "Epic");
  const stories = issues.filter((issue) => issue.issueType !== "Epic");
  return { epics, stories };
}

function buildJiraMetadata(options: ResolvedJiraOptions): Record<string, string> {
  const metadata: Record<string, string> = {
    jiraInstanceUrl: options.instanceUrl,
    jiraProjectKey: options.projectKey,
  };
  if (options.query) {
    metadata.jiraQuery = options.query;
  }
  return metadata;
}

function buildDefaultQuery(projectKey: string, issueKeys: string[]): string {
  if (issueKeys.length > 0) {
    return `key in (${issueKeys.join(",")})`;
  }
  if (!projectKey) {
    return "";
  }
  return `project = ${projectKey} AND issuetype in (Epic, Story)`;
}

function buildJiraAuth(userEmail: string, pat: string, oauthToken?: string): string {
  if (oauthToken) {
    return `Bearer ${oauthToken}`;
  }
  const token = Buffer.from(`${userEmail}:${pat}`).toString("base64");
  return `Basic ${token}`;
}

interface JiraSearchResponse {
  issues?: JiraIssue[];
  total?: number;
  maxResults?: number;
}

interface JiraIssue {
  id: string;
  key: string;
  fields?: {
    summary?: string;
    status?: { name?: string };
    issuetype?: { name?: string };
    assignee?: { displayName?: string } | null;
    labels?: string[];
    parent?: { key?: string };
    updated?: string;
  };
}

function mapIssue(issue: JiraIssue): JiraSnapshotIssue {
  return {
    id: issue.id,
    key: issue.key,
    summary: issue.fields?.summary ?? "",
    status: issue.fields?.status?.name ?? "",
    issueType: issue.fields?.issuetype?.name ?? "",
    assignee: issue.fields?.assignee?.displayName ?? undefined,
    labels: issue.fields?.labels ?? [],
    parentKey: issue.fields?.parent?.key ?? undefined,
    updated: issue.fields?.updated,
  };
}
