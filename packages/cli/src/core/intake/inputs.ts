import fs from "fs";
import path from "path";

export interface IntakeInputClassification {
  jiraKeys: string[];
  confluenceUrls: string[];
  filePaths: string[];
  unknown: string[];
}

export interface IntakeInputOptions {
  cwd?: string;
  existsFn?: (filePath: string) => boolean;
}

const JIRA_KEY_REGEX = /[A-Z][A-Z0-9]+-\d+/g;

export function classifyIntakeInputs(
  inputs: string[],
  options: IntakeInputOptions = {},
): IntakeInputClassification {
  const jiraKeys = new Set<string>();
  const confluenceUrls = new Set<string>();
  const filePaths = new Set<string>();
  const unknown: string[] = [];
  const cwd = options.cwd ?? process.cwd();
  const existsFn = options.existsFn ?? fs.existsSync;

  for (const token of inputs) {
    const trimmed = token.trim();
    if (!trimmed) {
      continue;
    }
    const url = parseUrl(trimmed);
    if (url && isConfluenceUrl(url)) {
      confluenceUrls.add(url.toString());
      continue;
    }
    const jiraMatch = trimmed.match(JIRA_KEY_REGEX);
    if (jiraMatch) {
      for (const key of jiraMatch) {
        jiraKeys.add(key.toUpperCase());
      }
      continue;
    }
    const resolved = path.resolve(cwd, trimmed);
    if (existsFn(resolved)) {
      filePaths.add(resolved);
      continue;
    }
    unknown.push(trimmed);
  }

  return {
    jiraKeys: Array.from(jiraKeys),
    confluenceUrls: Array.from(confluenceUrls),
    filePaths: Array.from(filePaths),
    unknown,
  };
}

function parseUrl(value: string): URL | null {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function isConfluenceUrl(url: URL): boolean {
  return url.pathname.includes("/wiki/");
}
