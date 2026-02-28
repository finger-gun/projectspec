import fs from "fs";
import path from "path";
import { runIntakeConnectors } from "../core/intake/connectors.js";

async function main(): Promise<void> {
  loadEnv();
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

function loadEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

main().catch((error) => {
  process.stderr.write(`Intake connector failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
