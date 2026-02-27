import { describe, expect, it, vi } from "vitest";

vi.mock("../core/layout.js", () => ({
  ensureProjectLayout: vi.fn(),
}));
vi.mock("../core/config.js", () => ({
  readConfig: vi.fn(),
  writeDefaultConfig: vi.fn(),
}));
vi.mock("../core/exports.js", () => ({
  updateToolExports: vi.fn(),
}));
vi.mock("../core/workflows.js", () => ({
  updateWorkflows: vi.fn(),
}));
vi.mock("../core/tools.js", () => ({
  installTools: vi.fn(),
  parseTools: vi.fn(),
  persistToolsConfig: vi.fn(),
  promptForTools: vi.fn(),
}));
vi.mock("../core/ui.js", () => ({
  renderLogo: vi.fn().mockResolvedValue(undefined),
}));

import { initProject } from "./init.js";
import { readConfig } from "../core/config.js";
import { parseTools, promptForTools } from "../core/tools.js";
import { installTools, persistToolsConfig } from "../core/tools.js";
import { updateToolExports } from "../core/exports.js";

describe("init", () => {
  it("uses tools from config", async () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: ["github-copilot"],
      integrations: { writeBackEnabled: false },
    });
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue(["github-copilot"]);

    await initProject();

    expect(promptForTools).not.toHaveBeenCalled();
    expect(persistToolsConfig).toHaveBeenCalled();
    expect(installTools).toHaveBeenCalledWith(["github-copilot"]);
    expect(updateToolExports).toHaveBeenCalled();
  });

  it("prompts for tools when config is empty", async () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: [],
      integrations: { writeBackEnabled: false },
    });
    (promptForTools as ReturnType<typeof vi.fn>).mockResolvedValue(["codex"]);
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue(["codex"]);

    await initProject();

    expect(promptForTools).toHaveBeenCalled();
    expect(installTools).toHaveBeenCalledWith(["codex"]);
  });
});
