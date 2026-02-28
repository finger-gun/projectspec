import { runIntakeConnectors } from "../core/intake/connectors.js";

async function main(): Promise<void> {
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

main().catch((error) => {
  process.stderr.write(`Intake connector failed: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
