import fs from "fs";
import path from "path";
import enquirer from "enquirer";

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
      message: "Remove projectspec/ and ProjectSpecs agent assets?",
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

    removeProjectspecAgentAssets();

    const projectspecDir = path.join(process.cwd(), "projectspec");
    if (fs.existsSync(projectspecDir)) {
      fs.rmSync(projectspecDir, { recursive: true, force: true });
    }

    process.stdout.write("ProjectSpecs removed from this workspace.\n");
  });
}

function removeProjectspecAgentAssets(rootDir: string = process.cwd()): void {
  removeProjectspecKiloCodeAssets(rootDir);
  removeProjectspecCopilotAssets(rootDir);
  removeProjectspecCodexAssets(rootDir);
}

function removeProjectspecKiloCodeAssets(rootDir: string): void {
  const workflowsDir = path.join(rootDir, ".kilocode", "workflows");
  removeMatchingFiles(workflowsDir, (name) => name.startsWith("ps-") && name.endsWith(".md"));
  const skillDir = path.join(rootDir, ".kilocode", "skills", "projectspec-workflows");
  removePathIfExists(skillDir);
}

function removeProjectspecCopilotAssets(rootDir: string): void {
  const promptsDir = path.join(rootDir, ".copilot", "prompts");
  removeMatchingFiles(promptsDir, (name) => name.startsWith("ps-") && name.endsWith(".prompt.md"));
  const githubPromptsDir = path.join(rootDir, ".github", "prompts");
  removeMatchingFiles(
    githubPromptsDir,
    (name) => name.startsWith("ps-") && name.endsWith(".prompt.md"),
  );
}

function removeProjectspecCodexAssets(rootDir: string): void {
  const promptsDir = path.join(rootDir, ".codex", "prompts");
  removeMatchingFiles(promptsDir, (name) => name.startsWith("ps-") && name.endsWith(".prompt.md"));
  const skillDir = path.join(rootDir, ".codex", "skills", "projectspec-workflows");
  removePathIfExists(skillDir);
}

function removeMatchingFiles(dirPath: string, predicate: (name: string) => boolean): void {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!predicate(entry.name)) {
      continue;
    }
    fs.rmSync(path.join(dirPath, entry.name), { force: true });
  }
}

function removePathIfExists(targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }
  fs.rmSync(targetPath, { recursive: true, force: true });
}
