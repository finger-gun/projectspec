import fs from "fs";
import path from "path";
import enquirer from "enquirer";
import { getToolDefinitions, parseTools, removeTools } from "../core/tools.js";
import { readConfig } from "../core/config.js";

interface ConfirmPrompt {
  run: () => Promise<boolean>;
}

export function uninstallProject(args: string[]): void {
  const yes = args.includes("--yes") || args.includes("-y");
  if (!process.stdin.isTTY && !yes) {
    process.stderr.write("Uninstall requires confirmation. Re-run with --yes.\n");
    process.exitCode = 1;
    return;
  }

  const proceed = async (): Promise<boolean> => {
    if (yes) {
      return true;
    }
    const prompt = new (enquirer as unknown as { Confirm: new (options: object) => ConfirmPrompt }).Confirm({
      name: "confirm",
      message: "Remove projectspec/ and installed agent assets?",
      initial: false,
    });
    try {
      return await prompt.run();
    } catch {
      return false;
    }
  };

  void proceed().then((confirmed) => {
    if (!confirmed) {
      process.stdout.write("Uninstall cancelled.\n");
      return;
    }

    const config = readConfig();
    const tools = parseTools(config.tools);
    if (tools.length === 0) {
      const allToolIds = getToolDefinitions().map((tool) => tool.id);
      removeTools(allToolIds);
    } else {
      removeTools(tools);
    }

    const projectspecDir = path.join(process.cwd(), "projectspec");
    if (fs.existsSync(projectspecDir)) {
      fs.rmSync(projectspecDir, { recursive: true, force: true });
    }

    process.stdout.write("ProjectSpecs removed from this workspace.\n");
  });
}
