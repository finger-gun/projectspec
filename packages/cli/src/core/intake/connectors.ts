import fs from "fs";
import path from "path";
import { runConfluenceImport } from "../adapters/confluence.js";
import { runJiraImport } from "../adapters/jira.js";
import { classifyIntakeInputs } from "./inputs.js";

export interface IntakeConnectorResult {
  jiraSnapshots: string[];
  confluenceSnapshots: string[];
  intakeFiles: string[];
  unknown: string[];
}

export interface IntakeConnectorOptions {
  rootDir?: string;
  jiraFetchFn?: (input: string, init?: RequestInit) => Promise<Response>;
  confluenceFetchFn?: (input: string, init?: RequestInit) => Promise<Response>;
}

export async function runIntakeConnectors(
  inputs: string[],
  options: IntakeConnectorOptions = {},
): Promise<IntakeConnectorResult> {
  const rootDir = options.rootDir ?? process.cwd();
  const classification = classifyIntakeInputs(inputs, { cwd: rootDir });
  const jiraSnapshots: string[] = [];
  const confluenceSnapshots: string[] = [];
  const intakeFiles: string[] = [];

  if (classification.jiraKeys.length > 0) {
    const result = await runJiraImport(
      {
        issueKeys: classification.jiraKeys,
        fetchFn: options.jiraFetchFn,
      },
      rootDir,
    );
    jiraSnapshots.push(result.snapshotPath);
  }

  if (classification.confluenceUrls.length > 0) {
    const result = await runConfluenceImport(
      {
        urls: classification.confluenceUrls,
        fetchFn: options.confluenceFetchFn,
      },
      rootDir,
    );
    confluenceSnapshots.push(result.snapshotPath);
  }

  if (classification.filePaths.length > 0) {
    const intakeDir = path.join(rootDir, "projectspec", "sources", "intake");
    fs.mkdirSync(intakeDir, { recursive: true });
    for (const filePath of classification.filePaths) {
      const targetPath = path.join(intakeDir, path.basename(filePath));
      fs.copyFileSync(filePath, targetPath);
      intakeFiles.push(targetPath);
    }
  }

  return {
    jiraSnapshots,
    confluenceSnapshots,
    intakeFiles,
    unknown: classification.unknown,
  };
}
