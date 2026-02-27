import { describe, expect, it, vi } from "vitest";

vi.mock("../core/config.js", () => ({
  readConfig: vi.fn(),
}));
vi.mock("../core/workflows.js", () => ({
  updateWorkflows: vi.fn(),
}));
vi.mock("../core/tools.js", () => ({
  installTools: vi.fn(),
  parseTools: vi.fn(),
}));
vi.mock("../core/exports.js", () => ({
  updateToolExports: vi.fn(),
}));

import { updateProject } from "./update.js";
import { readConfig } from "../core/config.js";
import { parseTools, installTools } from "../core/tools.js";
import { updateToolExports } from "../core/exports.js";

describe("update", () => {
  it("updates workflows and exports", () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: ["github-copilot"],
      integrations: { writeBackEnabled: false },
    });
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue(["github-copilot"]);

    updateProject();

    expect(installTools).toHaveBeenCalledWith(["github-copilot"]);
    expect(updateToolExports).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      skipExports: undefined,
    });
  });

  it("passes skipExports option", () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: [],
      integrations: { writeBackEnabled: false },
    });
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue([]);

    updateProject({ skipExports: true });

    expect(updateToolExports).toHaveBeenCalledWith(expect.anything(), expect.anything(), {
      skipExports: true,
    });
  });
});
