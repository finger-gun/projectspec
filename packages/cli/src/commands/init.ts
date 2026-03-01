import { ensureProjectLayout } from "../core/layout.js";
import { ensureProjectId, readConfig, writeConfig, writeDefaultConfig } from "../core/config.js";
import {
  ConnectorId,
  promptForConnectors,
  resolveConnectorValues,
  resolveConnectorValuesFromEnv,
} from "../core/connectors.js";
import { setProjectConnectors } from "../core/home-config.js";
import { updateToolExports } from "../core/exports.js";
import { updateWorkflows } from "../core/workflows.js";
import { installTools, parseTools, persistToolsConfig, promptForTools } from "../core/tools.js";
import { renderLogo } from "../core/ui.js";
import chalk from "chalk";
import gradient from "gradient-string";

export interface InitOptions {
  tools?: string[];
  connectors?: ConnectorId[];
}

export async function initProject(options: InitOptions = {}): Promise<void> {
  await renderLogo();
  const title = gradient(["#6f42c1", "#9b6bff"])("ProjectSpecs Setup");
  process.stdout.write(title + "\n");
  process.stdout.write(chalk.dim("Configure agent tools and initialize your project."));
  process.stdout.write("\n\n");
  ensureProjectLayout();
  writeDefaultConfig();
  const config = readConfig();
  const projectId = ensureProjectId();
  const tools =
    options.tools && options.tools.length > 0
      ? options.tools
      : config.tools.length > 0
        ? config.tools
        : await promptForTools();
  const parsedTools = parseTools(tools);
  config.tools = parsedTools;
  config.projectId = projectId;
  persistToolsConfig(config);
  updateWorkflows(config);
  installTools(parsedTools);
  updateToolExports(config);

  const connectors =
    options.connectors && options.connectors.length > 0 ? options.connectors : await promptForConnectors();
  if (connectors.length > 0) {
    try {
      const values = options.connectors
        ? resolveConnectorValuesFromEnv(connectors)
        : await resolveConnectorValues(connectors);
      setProjectConnectors(projectId, values);
      if (options.connectors) {
        const configured = connectors
          .map((connectorId) => {
            const keys = Object.keys(values[connectorId] ?? {});
            return `${connectorId}: ${keys.length > 0 ? keys.join(", ") : "no values"}`;
          })
          .join(" | ");
        process.stdout.write(`Non-interactive init used env values for connectors: ${configured}\n`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      process.stderr.write(`${message}\n`);
      process.exitCode = 1;
      return;
    }
  }
  writeConfig(config);
  process.stdout.write("Initialized ProjectSpecs workspace.\n");
}
