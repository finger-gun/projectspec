import { runVerify } from "../core/verify.js";

export function verifyProject(): void {
  const issues = runVerify();
  if (issues.length > 0) {
    process.stderr.write("Drift detected:\n" + issues.map((issue) => `- ${issue}`).join("\n") + "\n");
    process.exitCode = 1;
    return;
  }

  process.stdout.write("No drift detected.\n");
}
