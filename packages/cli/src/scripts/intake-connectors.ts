import fs from "fs";
import path from "path";
import { runIntakeConnectors } from "../core/intake/connectors.js";

export async function main(): Promise<void> {
  const envPath = loadEnv();
  if (envPath) {
    process.stdout.write(`Loaded .env from ${envPath}\n`);
  } else {
    process.stdout.write("No .env found in current directory. Using existing environment and home config.\n");
  }
  const inputs = process.argv.slice(2);
  if (inputs.length === 0) {
    process.stderr.write("No intake inputs provided.\n");
    process.exitCode = 1;
    return;
  }
  const result = await runIntakeConnectors(inputs);
  process.stdout.write(
    `Jira snapshots: ${result.jiraSnapshots.length}\nConfluence snapshots: ${result.confluenceSnapshots.length}\nIntake files: ${result.intakeFiles.length}\n`,
  );
  if (result.unknown.length > 0) {
    process.stdout.write(`Unrecognized inputs: ${result.unknown.join(", ")}\n`);
  }
}

export function loadEnv(rootDir: string = process.cwd()): string | null {
  const envPath = path.resolve(rootDir, ".env");
  if (!fs.existsSync(envPath)) {
    return null;
  }
  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const index = trimmed.indexOf("=");
    if (index <= 0) {
      continue;
    }
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    process.env[key] = value;
  }
  return envPath;
}

if (process.argv[1]?.includes("intake-connectors")) {
  main().catch((error) => {
    process.stderr.write(`Intake connector failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
