import { readConfig } from "../core/config.js";
import { updateWorkflows } from "../core/workflows.js";
import { installTools, parseTools } from "../core/tools.js";

export function updateProject(): void {
  const config = readConfig();
  updateWorkflows(config);
  const parsedTools = parseTools(config.tools);
  installTools(parsedTools);
  process.stdout.write("Updated ProjectSpecs workflows.\n");
}
