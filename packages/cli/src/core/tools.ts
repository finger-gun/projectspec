import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import readline from "readline";
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
        targetDir: ".copilot/prompts",
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

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const options = TOOL_DEFINITIONS.map((tool, index) => {
    return `${index + 1}) ${tool.name} - ${tool.description}`;
  });

  process.stdout.write("Select tools to set up (comma-separated numbers, Enter for none):\n");
  process.stdout.write(options.join("\n") + "\n> ");

  const answer: string = await new Promise((resolve) => {
    rl.question("", (input) => resolve(input));
  });

  rl.close();

  if (!answer.trim()) {
    return [];
  }

  const selections = answer
    .split(",")
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isFinite(value) && value > 0 && value <= TOOL_DEFINITIONS.length);

  const unique = Array.from(new Set(selections));
  return unique.map((index) => TOOL_DEFINITIONS[index - 1].id);
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
