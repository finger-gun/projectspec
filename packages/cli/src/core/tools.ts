import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import enquirer from "enquirer";

const MultiSelect = (enquirer as unknown as { MultiSelect: new (options: object) => { run: () => Promise<string[]> } }).MultiSelect;
import YAML from "yaml";
import { ProjectSpecConfig } from "./config.js";

export type ToolId = "kilocode" | "github-copilot" | "codex";

interface ToolDefinition {
  id: ToolId;
  name: string;
  description: string;
  assets: Array<{ sourceDir: string; targetDir: string }>;
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    id: "kilocode",
    name: "KiloCode",
    description: "Install workflows and skills for KiloCode",
    assets: [
      {
        sourceDir: "kilocode/workflows",
        targetDir: ".kilocode/workflows",
      },
      {
        sourceDir: "kilocode/skills",
        targetDir: ".kilocode/skills",
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    description: "Install prompt files for Copilot",
    assets: [
      {
        sourceDir: "copilot/prompts",
        targetDir: ".github/prompts",
      },
    ],
  },
  {
    id: "codex",
    name: "Codex",
    description: "Install skills for Codex",
    assets: [
      {
        sourceDir: "codex/skills",
        targetDir: ".codex/skills",
      },
    ],
  },
];

export function getToolDefinitions(): ToolDefinition[] {
  return TOOL_DEFINITIONS;
}

export async function promptForTools(): Promise<ToolId[]> {
  if (!process.stdin.isTTY) {
    return [];
  }

  const prompt = new MultiSelect({
    name: "tools",
    message: "Select tools to set up",
    hint: "Use space to toggle, enter to confirm",
    choices: TOOL_DEFINITIONS.map((tool) => ({
      name: tool.id,
      message: tool.name,
      hint: tool.description,
    })),
  });

  try {
    const result = (await prompt.run()) as ToolId[];
    return result;
  } catch {
    return [];
  }
}

export function parseTools(tools: string[]): ToolId[] {
  const valid = new Set(TOOL_DEFINITIONS.map((tool) => tool.id));
  return tools.filter((tool): tool is ToolId => valid.has(tool as ToolId));
}

export function installTools(tools: ToolId[], rootDir: string = process.cwd()): void {
  const assetsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../assets");
  for (const toolId of tools) {
    const tool = TOOL_DEFINITIONS.find((entry) => entry.id === toolId);
    if (!tool) {
      continue;
    }

    for (const asset of tool.assets) {
      const sourceDir = path.join(assetsRoot, asset.sourceDir);
      const targetDir = path.join(rootDir, asset.targetDir);
      copyDirectory(sourceDir, targetDir);
    }
  }
}

export function removeTools(tools: ToolId[], rootDir: string = process.cwd()): void {
  for (const toolId of tools) {
    const tool = TOOL_DEFINITIONS.find((entry) => entry.id === toolId);
    if (!tool) {
      continue;
    }

    for (const asset of tool.assets) {
      const targetDir = path.join(rootDir, asset.targetDir);
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
    }
  }
}

export function persistToolsConfig(config: ProjectSpecConfig, rootDir: string = process.cwd()): void {
  const configPath = path.join(rootDir, "projectspec", "config.yaml");
  const yaml = YAML.stringify(config);
  fs.writeFileSync(configPath, yaml, "utf8");
}

function copyDirectory(sourceDir: string, targetDir: string): void {
  if (!fs.existsSync(sourceDir)) {
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
      continue;
    }
    fs.copyFileSync(sourcePath, targetPath);
  }
}
