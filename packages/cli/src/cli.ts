import { initProject } from "./commands/init.js";
import { updateProject } from "./commands/update.js";
import { verifyProject } from "./commands/verify.js";

export function runCli(args: string[]): void {
  const [command] = args;

  if (!command) {
    printHelp();
    return;
  }

  if (command === "init") {
    void initProject();
    return;
  }

  if (command === "update") {
    updateProject();
    return;
  }

  if (command === "verify") {
    verifyProject();
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
    "  projectspec init",
    "  projectspec update",
    "  projectspec verify",
  ];

  process.stdout.write(help.join("\n") + "\n");
}
