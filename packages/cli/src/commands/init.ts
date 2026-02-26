import { ensureProjectLayout } from "../core/layout.js";
import { readConfig, writeDefaultConfig } from "../core/config.js";
import { updateWorkflows } from "../core/workflows.js";
import { installTools, parseTools, persistToolsConfig, promptForTools } from "../core/tools.js";
import { renderLogo } from "../core/ui.js";
import chalk from "chalk";
import gradient from "gradient-string";

export async function initProject(): Promise<void> {
  await renderLogo();
  const title = gradient(["#6f42c1", "#9b6bff"])("ProjectSpecs Setup");
  process.stdout.write(title + "\n");
  process.stdout.write(chalk.dim("Configure agent tools and initialize your project."));
  process.stdout.write("\n\n");
  ensureProjectLayout();
  writeDefaultConfig();
  const config = readConfig();
  const tools = config.tools.length > 0 ? config.tools : await promptForTools();
  const parsedTools = parseTools(tools);
  config.tools = parsedTools;
  persistToolsConfig(config);
  updateWorkflows(config);
  installTools(parsedTools);
  process.stdout.write("Initialized ProjectSpecs workspace.\n");
}
