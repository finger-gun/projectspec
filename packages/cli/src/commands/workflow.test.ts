import { describe, expect, it, vi } from "vitest";

vi.mock("../core/config.js", () => ({
  readConfig: vi.fn(),
}));
vi.mock("../core/workflows.js", () => ({
  runWorkflowByName: vi.fn(),
}));

import { readConfig } from "../core/config.js";
import { runWorkflowByName } from "../core/workflows.js";
import { runWorkflow } from "./workflow.js";

describe("workflow", () => {
  it("runs workflow by name", () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: [],
      integrations: { writeBackEnabled: false },
    });

    runWorkflow("/ps:intake");

    expect(runWorkflowByName).toHaveBeenCalledWith(expect.anything(), "/ps:intake");
  });
});
