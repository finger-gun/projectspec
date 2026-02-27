import { ToolId } from "./tools.js";

export interface ToolExportMapping {
  exportSubdir: string;
  targetDir: string;
}

export interface ToolExportDefinition {
  id: ToolId;
  name: string;
  exportDirName: string;
  harnessMappings: ToolExportMapping[];
}

const TOOL_EXPORT_DEFINITIONS: ToolExportDefinition[] = [
  {
    id: "kilocode",
    name: "KiloCode",
    exportDirName: "kilocode",
    harnessMappings: [
      {
        exportSubdir: "workflows",
        targetDir: ".kilocode/workflows",
      },
      {
        exportSubdir: "skills",
        targetDir: ".kilocode/skills",
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    exportDirName: "github-copilot",
    harnessMappings: [
      {
        exportSubdir: "prompts",
        targetDir: ".github/prompts",
      },
    ],
  },
  {
    id: "codex",
    name: "Codex",
    exportDirName: "codex",
    harnessMappings: [
      {
        exportSubdir: "skills",
        targetDir: ".codex/skills",
      },
    ],
  },
];

export function getToolExportDefinitions(): ToolExportDefinition[] {
  return TOOL_EXPORT_DEFINITIONS;
}

export function getToolExportDefinition(toolId: ToolId): ToolExportDefinition | undefined {
  return TOOL_EXPORT_DEFINITIONS.find((tool) => tool.id === toolId);
}
