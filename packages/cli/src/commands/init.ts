import { ensureProjectLayout } from "../core/layout.js";
import { writeDefaultConfig } from "../core/config.js";

export function initProject(): void {
  ensureProjectLayout();
  writeDefaultConfig();
  process.stdout.write("Initialized ProjectSpecs workspace.\n");
}
