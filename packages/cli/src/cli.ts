import { initProject } from "./commands/init.js";
import { ConnectorId, getConnectorDefinitions } from "./core/connectors.js";
import { updateProject } from "./commands/update.js";
import { verifyProject } from "./commands/verify.js";
import { uninstallProject } from "./commands/uninstall.js";

export function runCli(args: string[]): void {
  const [command, ...rest] = args;

  if (!command) {
    printHelp();
    return;
  }

  if (command === "init") {
    const tools = readFlagList(rest, "--tools");
    const connectors = readConnectorFlags(rest);
    void initProject({ tools, connectors });
    return;
  }

  if (command === "update") {
    const skipExports = rest.includes("--skip-exports");
    updateProject({ skipExports });
    return;
  }

  if (command === "verify") {
    verifyProject();
    return;
  }

  if (command === "uninstall") {
    uninstallProject(rest);
    return;
  }

  if (command?.startsWith("/ps:")) {
    process.stderr.write("/ps:* workflows are agent prompts, not CLI commands. Use an AI tool to run workflows.\n");
    process.exitCode = 1;
    return;
  }

  printHelp();
}

function printHelp(): void {
  const help = [
    "ProjectSpecs CLI",
    "",
    "Usage:",
    "  projectspec init [--tools=kilocode,github-copilot,codex] [--connectors=jira,confluence]",
    "  projectspec update",
    "  projectspec verify",
    "  projectspec uninstall",
  ];

  process.stdout.write(help.join("\n") + "\n");
}

function readFlagList(args: string[], name: string): string[] | undefined {
  const index = args.findIndex((arg) => arg === name || arg.startsWith(`${name}=`));
  if (index === -1) {
    return undefined;
  }
  const value = args[index].includes("=") ? args[index].slice(name.length + 1) : args[index + 1];
  if (!value) {
    return undefined;
  }
  return value.split(",").map((entry) => entry.trim()).filter(Boolean);
}

function readConnectorFlags(args: string[]): ConnectorId[] | undefined {
  const raw = readFlagList(args, "--connectors");
  if (!raw) {
    return undefined;
  }
  const allowed = new Set(getConnectorDefinitions().map((connector) => connector.id));
  const filtered = raw.filter((value) => allowed.has(value as ConnectorId));
  return filtered.length > 0 ? (filtered as ConnectorId[]) : undefined;
}
