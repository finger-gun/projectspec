import { ensureProjectId, readConfig } from "../core/config.js";
import { updateToolExports } from "../core/exports.js";
import { installTools, parseTools } from "../core/tools.js";
import { ensureProjectLayout } from "../core/layout.js";
import { updateWorkflows } from "../core/workflows.js";

interface UpdateOptions {
  skipExports?: boolean;
}

export function updateProject(options: UpdateOptions = {}): void {
  const config = readConfig();
  ensureProjectLayout();
  ensureProjectId();
  updateWorkflows(config);
  const parsedTools = parseTools(config.tools);
  installTools(parsedTools);
  updateToolExports(config, process.cwd(), { skipExports: options.skipExports });
  process.stdout.write("Updated ProjectSpecs workflows.\n");
}
