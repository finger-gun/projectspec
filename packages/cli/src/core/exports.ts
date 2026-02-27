import fs from "fs";
import path from "path";
import { ProjectSpecConfig } from "./config.js";
import { parseTools, ToolId } from "./tools.js";
import { getToolExportDefinition } from "./tool-exports.js";

export interface ToolExportManifest {
  version: 1;
  toolId: ToolId;
  exportDir: string;
  inputs: {
    workflows: string[];
  };
  outputs: {
    exportDir: string;
    files: string[];
  };
  harness: Array<{
    targetDir: string;
    files: string[];
  }>;
}

interface WorkflowSpec {
  id: string;
  slug: string;
  content: string;
  sourcePath: string;
}

interface ExportFile {
  relativePath: string;
  content: string;
}

interface UpdateExportOptions {
  skipExports?: boolean;
}

const MANIFEST_FILENAME = "manifest.json";

export function updateToolExports(
  config: ProjectSpecConfig,
  rootDir: string = process.cwd(),
  options: UpdateExportOptions = {},
): void {
  if (options.skipExports) {
    return;
  }

  const tools = parseTools(config.tools);
  if (tools.length === 0) {
    return;
  }

  const workflows = loadCanonicalWorkflows(rootDir);
  for (const toolId of tools) {
    const definition = getToolExportDefinition(toolId);
    if (!definition) {
      continue;
    }

    const exportDir = path.join(rootDir, "projectspec", "exports", definition.exportDirName);
    const previousManifest = readManifest(exportDir);
    const exportFiles = buildExportFiles(toolId, workflows);
    const exportFilePaths = exportFiles.map((file) => file.relativePath).sort();
    const harness = definition.harnessMappings.map((mapping) => {
      const prefix = `${mapping.exportSubdir}/`;
      const files = exportFiles
        .filter((file) => file.relativePath.startsWith(prefix))
        .map((file) => ({
          relativePath: file.relativePath.slice(prefix.length),
          content: file.content,
        }));
      return {
        targetDir: mapping.targetDir,
        files,
      };
    });

    writeExportFiles(exportDir, exportFiles);
    pruneFiles(exportDir, previousManifest?.outputs.files ?? [], exportFilePaths);

    for (const mapping of harness) {
      const targetDir = path.join(rootDir, mapping.targetDir);
      const targetFiles = mapping.files.map((file) => file.relativePath);
      writeExportFiles(targetDir, mapping.files.map((file) => ({
        relativePath: file.relativePath,
        content: file.content,
      })));
      const previousHarnessFiles = previousManifest?.harness.find(
        (entry) => entry.targetDir === mapping.targetDir,
      )?.files ?? [];
      pruneFiles(targetDir, previousHarnessFiles, targetFiles);
    }

    const manifest: ToolExportManifest = {
      version: 1,
      toolId,
      exportDir: path.join("projectspec", "exports", definition.exportDirName),
      inputs: {
        workflows: workflows.map((workflow) => workflow.sourcePath),
      },
      outputs: {
        exportDir: path.join("projectspec", "exports", definition.exportDirName),
        files: exportFilePaths,
      },
      harness: harness.map((mapping) => ({
        targetDir: mapping.targetDir,
        files: mapping.files.map((file) => file.relativePath).sort(),
      })),
    };

    writeManifest(exportDir, manifest);
  }
}

export function stringifyManifest(manifest: ToolExportManifest): string {
  const normalized = normalizeManifest(manifest);
  return JSON.stringify(normalized, null, 2) + "\n";
}

function normalizeManifest(manifest: ToolExportManifest): ToolExportManifest {
  return {
    version: 1,
    toolId: manifest.toolId,
    exportDir: manifest.exportDir,
    inputs: {
      workflows: [...manifest.inputs.workflows].sort(),
    },
    outputs: {
      exportDir: manifest.outputs.exportDir,
      files: [...manifest.outputs.files].sort(),
    },
    harness: [...manifest.harness]
      .map((entry) => ({
        targetDir: entry.targetDir,
        files: [...entry.files].sort(),
      }))
      .sort((a, b) => a.targetDir.localeCompare(b.targetDir)),
  };
}

function readManifest(exportDir: string): ToolExportManifest | null {
  const manifestPath = path.join(exportDir, MANIFEST_FILENAME);
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  const raw = fs.readFileSync(manifestPath, "utf8");
  try {
    const data = JSON.parse(raw) as ToolExportManifest;
    if (!data || data.version !== 1) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeManifest(exportDir: string, manifest: ToolExportManifest): void {
  fs.mkdirSync(exportDir, { recursive: true });
  const manifestPath = path.join(exportDir, MANIFEST_FILENAME);
  fs.writeFileSync(manifestPath, stringifyManifest(manifest), "utf8");
}

function loadCanonicalWorkflows(rootDir: string): WorkflowSpec[] {
  const workflowsDir = path.join(rootDir, "projectspec", "workflows");
  if (!fs.existsSync(workflowsDir)) {
    return [];
  }

  const entries = fs.readdirSync(workflowsDir).filter((entry) => entry.endsWith(".md"));
  entries.sort();

  return entries.map((entry) => {
    const slug = entry.replace(/\.md$/u, "");
    const sourcePath = path.join("projectspec", "workflows", entry);
    const raw = fs.readFileSync(path.join(workflowsDir, entry), "utf8");
    return {
      id: `/ps:${slug}`,
      slug,
      content: normalizeContent(raw),
      sourcePath,
    };
  });
}

function normalizeContent(content: string): string {
  const normalized = content.replace(/\r\n/g, "\n");
  return normalized.endsWith("\n") ? normalized : `${normalized}\n`;
}

function buildExportFiles(toolId: ToolId, workflows: WorkflowSpec[]): ExportFile[] {
  if (workflows.length === 0) {
    return [];
  }

  switch (toolId) {
    case "kilocode":
      return buildKiloCodeFiles(workflows);
    case "github-copilot":
      return buildCopilotFiles(workflows);
    case "codex":
      return buildCodexFiles(workflows);
    default:
      return [];
  }
}

function buildKiloCodeFiles(workflows: WorkflowSpec[]): ExportFile[] {
  const files: ExportFile[] = workflows.map((workflow) => ({
    relativePath: `workflows/ps-${workflow.slug}.md`,
    content: workflow.content,
  }));

  files.push({
    relativePath: "skills/projectspec-workflows/SKILL.md",
    content: renderWorkflowSkill(workflows),
  });

  return files;
}

function buildCopilotFiles(workflows: WorkflowSpec[]): ExportFile[] {
  return workflows.map((workflow) => ({
    relativePath: `prompts/ps-${workflow.slug}.prompt.md`,
    content: renderCopilotPrompt(workflow),
  }));
}

function buildCodexFiles(workflows: WorkflowSpec[]): ExportFile[] {
  return [
    {
      relativePath: "skills/projectspec-workflows/SKILL.md",
      content: renderWorkflowSkill(workflows),
    },
  ];
}

function renderCopilotPrompt(workflow: WorkflowSpec): string {
  const description = `ProjectSpecs ${workflow.id} workflow`;
  return ["---", `description: ${description}`, "---", "", workflow.content].join("\n");
}

function renderWorkflowSkill(workflows: WorkflowSpec[]): string {
  const sections = workflows.map((workflow) => workflow.content.trimEnd()).join("\n\n");
  const body = [
    "---",
    "name: projectspec-workflows",
    "description: Agent workflows for ProjectSpecs.",
    "---",
    "",
    "Use these workflows to guide ProjectSpecs actions and produce canonical artifacts.",
    "",
    sections,
    "",
  ].join("\n");
  return normalizeContent(body);
}

function writeExportFiles(baseDir: string, files: ExportFile[]): void {
  for (const file of files) {
    const outputPath = path.join(baseDir, file.relativePath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, file.content, "utf8");
  }
}

function pruneFiles(baseDir: string, previousFiles: string[], currentFiles: string[]): void {
  if (previousFiles.length === 0) {
    return;
  }

  const keep = new Set(currentFiles);
  for (const relativePath of previousFiles) {
    if (keep.has(relativePath)) {
      continue;
    }
    const fullPath = path.join(baseDir, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { force: true });
    }
  }
}
