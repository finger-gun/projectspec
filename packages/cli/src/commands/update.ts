import { readConfig } from "../core/config.js";
import { updateWorkflows } from "../core/workflows.js";
import { installTools } from "../core/tools.js";

export function updateProject(): void {
  const config = readConfig();
  updateWorkflows(config);
  installTools(config.tools);
  process.stdout.write("Updated ProjectSpecs workflows.\n");
}
