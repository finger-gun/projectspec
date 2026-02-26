import fs from "fs";
import path from "path";
import { ProjectSpecConfig } from "./config.js";
import { ensureProjectLayout } from "./layout.js";
import { ensureImportStructure, recordImportActivity } from "./imports.js";
import { runVerify } from "./verify.js";

const ALL_WORKFLOWS = [
  "/ps:intake",
  "/ps:design",
  "/ps:plan",
  "/ps:export",
  "/ps:verify",
  "/ps:archive",
];

const PROFILE_WORKFLOWS: Record<string, string[]> = {
  core: ALL_WORKFLOWS,
};

export function updateWorkflows(config: ProjectSpecConfig): void {
  const enabled = resolveEnabledWorkflows(config);
  const workflowsDir = path.join(process.cwd(), "projectspec", "workflows");

  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  for (const workflow of enabled) {
    const filename = workflow.replace("/ps:", "") + ".md";
    const workflowPath = path.join(workflowsDir, filename);
    if (!fs.existsSync(workflowPath)) {
      fs.writeFileSync(workflowPath, "", "utf8");
    }
  }

  pruneDisabledWorkflows(workflowsDir, enabled);
}

export function runWorkflowByName(config: ProjectSpecConfig, name: string): void {
  const enabled = resolveEnabledWorkflows(config);
  if (!enabled.includes(name)) {
    process.stderr.write(`Workflow not enabled: ${name}\n`);
    process.exitCode = 1;
    return;
  }

  ensureProjectLayout();

  switch (name) {
    case "/ps:intake":
      ensureImportStructure("generic");
      recordImportActivity("generic", "intake");
      process.stdout.write("Intake workflow ready. Place raw inputs under projectspec/sources/intake/ and imports under projectspec/sources/imported/.\n");
      return;
    case "/ps:verify": {
      const issues = runVerify();
      if (issues.length > 0) {
        process.stderr.write("Drift detected:\n" + issues.map((issue) => `- ${issue}`).join("\n") + "\n");
        process.exitCode = 1;
        return;
      }
      process.stdout.write("No drift detected.\n");
      return;
    }
    default:
      process.stdout.write(`Running workflow ${name}...\n`);
  }
}

export function resolveEnabledWorkflows(config: ProjectSpecConfig): string[] {
  const profileWorkflows = PROFILE_WORKFLOWS[config.profile] ?? ALL_WORKFLOWS;
  const selected = config.workflows ?? profileWorkflows;
  return selected.filter((workflow) => profileWorkflows.includes(workflow));
}

function pruneDisabledWorkflows(workflowsDir: string, enabled: string[]): void {
  if (!fs.existsSync(workflowsDir)) {
    return;
  }

  const keep = new Set(enabled.map((workflow) => workflow.replace("/ps:", "") + ".md"));
  const entries = fs.readdirSync(workflowsDir);
  for (const entry of entries) {
    if (!keep.has(entry)) {
      fs.unlinkSync(path.join(workflowsDir, entry));
    }
  }
}
