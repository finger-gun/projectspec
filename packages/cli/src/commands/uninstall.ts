import fs from "fs";
import os from "os";
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

export function removeProjectspecAgentAssets(options: {
  rootDir?: string;
  homeDir?: string;
} = {}): void {
  const rootDir = options.rootDir ?? process.cwd();
  const homeDir = options.homeDir ?? os.homedir();
  removeProjectspecKiloCodeAssets(rootDir);
  removeProjectspecCopilotAssets(rootDir);
  removeProjectspecCodexAssets(rootDir, homeDir);
}

function removeProjectspecKiloCodeAssets(rootDir: string): void {
  const workflowsDir = path.join(rootDir, ".kilocode", "workflows");
  removeMatchingFiles(workflowsDir, (name) => name.startsWith("ps-") && name.endsWith(".md"));
  const skillsDir = path.join(rootDir, ".kilocode", "skills");
  removeMatchingDirectories(
    skillsDir,
    new Set(["ps-intake", "ps-design", "ps-plan", "ps-export", "ps-verify", "ps-archive", "ps-intake-wizard"]),
  );
  const workflowSkillDir = path.join(rootDir, ".kilocode", "skills", "projectspec-workflows");
  removePathIfExists(workflowSkillDir);
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

function removeProjectspecCodexAssets(rootDir: string, homeDir: string): void {
  const promptsDir = path.join(rootDir, ".codex", "prompts");
  removeMatchingFiles(promptsDir, (name) => name.startsWith("ps-") && name.endsWith(".prompt.md"));
  const userPromptsDir = path.join(homeDir, ".codex", "prompts");
  removeMatchingFiles(userPromptsDir, (name) => name.startsWith("ps-") && name.endsWith(".md"));
  const skillDir = path.join(rootDir, ".codex", "skills", "projectspec-workflows");
  removePathIfExists(skillDir);
  const intakeWizardSkillDir = path.join(rootDir, ".codex", "skills", "ps-intake-wizard");
  removePathIfExists(intakeWizardSkillDir);
  const skillsDir = path.join(rootDir, ".codex", "skills");
  removeMatchingDirectories(skillsDir, new Set(["ps-intake", "ps-design", "ps-plan", "ps-export", "ps-verify", "ps-archive"]));
  const agentsSkillsDir = path.join(rootDir, ".agents", "skills");
  removeMatchingDirectories(
    agentsSkillsDir,
    new Set([
      "projectspec-workflows",
      "ps-intake",
      "ps-design",
      "ps-plan",
      "ps-export",
      "ps-verify",
      "ps-archive",
      "ps-intake-wizard",
    ]),
  );
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

function removeMatchingDirectories(dirPath: string, names: Set<string>): void {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    if (!names.has(entry.name)) {
      continue;
    }
    fs.rmSync(path.join(dirPath, entry.name), { recursive: true, force: true });
  }
}

function removePathIfExists(targetPath: string): void {
  if (!fs.existsSync(targetPath)) {
    return;
  }
  fs.rmSync(targetPath, { recursive: true, force: true });
}
