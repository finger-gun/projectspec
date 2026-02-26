import { initProject } from "./commands/init.js";
import { updateProject } from "./commands/update.js";
import { runWorkflow } from "./commands/workflow.js";

const workflowAliases = new Set([
  "/ps:intake",
  "/ps:design",
  "/ps:plan",
  "/ps:export",
  "/ps:verify",
  "/ps:archive",
]);

export function runCli(args: string[]): void {
  const [command] = args;

  if (!command) {
    printHelp();
    return;
  }

  if (command === "init") {
    initProject();
    return;
  }

  if (command === "update") {
    updateProject();
    return;
  }

  if (workflowAliases.has(command)) {
    runWorkflow(command);
    return;
  }

  printHelp();
}

function printHelp(): void {
  const help = [
    "ProjectSpecs CLI",
    "",
    "Usage:",
    "  projectspec init",
    "  projectspec update",
    "  projectspec /ps:intake",
    "  projectspec /ps:design",
    "  projectspec /ps:plan",
    "  projectspec /ps:export",
    "  projectspec /ps:verify",
    "  projectspec /ps:archive",
  ];

  process.stdout.write(help.join("\n") + "\n");
}
