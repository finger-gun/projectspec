import fs from "fs";
import path from "path";
import { ProjectSpecConfig } from "./config.js";
import { ensureProjectLayout } from "./layout.js";
import { ensureImportStructure, recordImportActivity } from "./imports.js";

const ALL_WORKFLOWS = [
  "/ps:intake",
  "/ps:design",
  "/ps:plan",
  "/ps:export",
  "/ps:verify",
  "/ps:archive",
];

const WORKFLOW_TEMPLATES: Record<string, string> = {
  "/ps:intake": [
    "# /ps:intake",
    "",
    "Capture raw inputs and curate requirements from connectors and files.",
    "",
    "Outputs:",
    "- projectspec/specs/domains/<domain>/requirements.md",
    "",
    "Steps:",
    "1. If no inputs, run a short wizard based on projectspec/workflows/intake-wizard.yaml.",
    "2. If inputs provided, treat the first source as primary and the rest as dependencies.",
    "3. Classify inputs (Jira keys, Confluence URLs, file paths).",
    "4. Use connectors to fetch Jira/Confluence and write snapshots into projectspec/sources/imported/.",
    "5. Review projectspec/sources/imported/index.yaml for available snapshots.",
    "6. Extract requirements, assign stable IDs (REQ-<DOMAIN>-####).",
    "7. Prefer snapshots under projectspec/sources/imported/jira/ and confluence/ when available.",
    "8. Write requirements.md with a concise summary and requirement list.",
    "",
    "Connector runner:",
    "- pnpm --filter @projectspec/cli build",
    "- node packages/cli/dist/scripts/intake-connectors.js <inputs...>",
  ].join("\n"),
  "/ps:design": [
    "# /ps:design",
    "",
    "Update architecture context and ADRs.",
    "",
    "Outputs:",
    "- projectspec/specs/architecture/context.md",
    "- projectspec/specs/architecture/decisions/ADR-####-<slug>.md",
    "",
    "Steps:",
    "1. Review current requirements and architecture context.",
    "2. Update context.md with key constraints and boundaries.",
    "3. Record new decisions as ADRs with rationale and consequences.",
  ].join("\n"),
  "/ps:plan": [
    "# /ps:plan",
    "",
    "Produce delivery plans and update traceability.",
    "",
    "Outputs:",
    "- projectspec/changes/<change>/delivery.md",
    "- projectspec/mapping/traceability.yaml",
    "",
    "Steps:",
    "1. Summarize scope and milestones in delivery.md.",
    "2. Map requirements and decisions to work items in traceability.yaml.",
  ].join("\n"),
  "/ps:export": [
    "# /ps:export",
    "",
    "Generate tool-ready bundles without modifying canonical specs.",
    "",
    "Outputs:",
    "- projectspec/exports/<target>/",
    "",
    "Steps:",
    "1. Collect relevant specs, plans, and traceability data.",
    "2. Write the bundle contents into the target directory.",
  ].join("\n"),
  "/ps:verify": [
    "# /ps:verify",
    "",
    "Detect drift and missing traceability links.",
    "",
    "Checks:",
    "- Missing links in projectspec/mapping/traceability.yaml",
    "- IDs present in specs but missing traceability entries",
    "- Traceability entries referencing missing IDs",
  ].join("\n"),
  "/ps:archive": [
    "# /ps:archive",
    "",
    "Snapshot and archive completed changes.",
    "",
    "Outputs:",
    "- projectspec/archive/<change>/",
    "",
    "Steps:",
    "1. Copy the change delivery artifacts and related specs.",
    "2. Include traceability.yaml in the snapshot.",
  ].join("\n"),
};

const PROFILE_WORKFLOWS: Record<string, string[]> = {
  core: ALL_WORKFLOWS,
};

export function updateWorkflows(config: ProjectSpecConfig, rootDir: string = process.cwd()): void {
  const enabled = resolveEnabledWorkflows(config);
  const workflowsDir = path.join(rootDir, "projectspec", "workflows");

  if (!fs.existsSync(workflowsDir)) {
    fs.mkdirSync(workflowsDir, { recursive: true });
  }

  for (const workflow of enabled) {
    const filename = workflow.replace("/ps:", "") + ".md";
    const workflowPath = path.join(workflowsDir, filename);
    const template = WORKFLOW_TEMPLATES[workflow] ?? "";
    fs.writeFileSync(workflowPath, template, "utf8");
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

  if (name === "/ps:intake") {
    ensureImportStructure("generic");
    recordImportActivity("generic", "intake", new Date().toISOString());
    process.stdout.write("Intake workflow ready. Place raw inputs under projectspec/sources/intake/ and imports under projectspec/sources/imported/.\n");
    return;
  }

  process.stdout.write(`Workflow ready: ${name}. This action is intended for agent-driven execution.\n`);
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
