import { readConfig } from "../core/config.js";
import { updateWorkflows } from "../core/workflows.js";

export function updateProject(): void {
  const config = readConfig();
  updateWorkflows(config);
  process.stdout.write("Updated ProjectSpecs workflows.\n");
}
