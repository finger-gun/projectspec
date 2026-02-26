import { ensureProjectLayout } from "../core/layout.js";
import { readConfig, writeDefaultConfig } from "../core/config.js";
import { updateWorkflows } from "../core/workflows.js";
import { installTools, persistToolsConfig, promptForTools } from "../core/tools.js";

export async function initProject(): Promise<void> {
  ensureProjectLayout();
  writeDefaultConfig();
  const config = readConfig();
  const tools = config.tools.length > 0 ? config.tools : await promptForTools();
  config.tools = tools;
  persistToolsConfig(config);
  updateWorkflows(config);
  installTools(config.tools);
  process.stdout.write("Initialized ProjectSpecs workspace.\n");
}
