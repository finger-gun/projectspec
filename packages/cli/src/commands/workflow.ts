import { readConfig } from "../core/config.js";
import { runWorkflowByName } from "../core/workflows.js";

export function runWorkflow(name: string): void {
  const config = readConfig();
  runWorkflowByName(config, name);
}
