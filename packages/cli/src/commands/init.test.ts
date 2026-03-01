import fs from "fs";
import path from "path";
import { describe, expect, it, vi } from "vitest";

vi.mock("../core/layout.js", () => ({
  ensureProjectLayout: vi.fn(),
}));
vi.mock("../core/config.js", () => ({
  readConfig: vi.fn(),
  writeDefaultConfig: vi.fn(),
  ensureProjectId: vi.fn(),
  writeConfig: vi.fn(),
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
vi.mock("../core/connectors.js", () => ({
  promptForConnectors: vi.fn(),
  resolveConnectorValues: vi.fn(),
  resolveConnectorValuesFromEnv: vi.fn(),
}));
vi.mock("../core/home-config.js", () => ({
  setProjectConnectors: vi.fn(),
}));
vi.mock("../core/ui.js", () => ({
  renderLogo: vi.fn().mockResolvedValue(undefined),
}));

import { initProject } from "./init.js";
import { ensureProjectId, readConfig } from "../core/config.js";
import { parseTools, promptForTools } from "../core/tools.js";
import { installTools, persistToolsConfig } from "../core/tools.js";
import { updateToolExports } from "../core/exports.js";
import {
  promptForConnectors,
  resolveConnectorValues,
  resolveConnectorValuesFromEnv,
} from "../core/connectors.js";
import { setProjectConnectors } from "../core/home-config.js";

describe("init", () => {
  it("uses tools from config", async () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: ["github-copilot"],
      integrations: { writeBackEnabled: false },
    });
    (ensureProjectId as ReturnType<typeof vi.fn>).mockReturnValue("project-1");
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue(["github-copilot"]);
    (promptForConnectors as ReturnType<typeof vi.fn>).mockResolvedValue([]);

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
    (ensureProjectId as ReturnType<typeof vi.fn>).mockReturnValue("project-2");
    (promptForTools as ReturnType<typeof vi.fn>).mockResolvedValue(["codex"]);
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue(["codex"]);
    (promptForConnectors as ReturnType<typeof vi.fn>).mockResolvedValue(["jira"]);
    (resolveConnectorValues as ReturnType<typeof vi.fn>).mockResolvedValue({
      jira: { JIRA_API_URL: "https://jira.example.com" },
    });

    await initProject();

    expect(promptForTools).toHaveBeenCalled();
    expect(installTools).toHaveBeenCalledWith(["codex"]);
    expect(setProjectConnectors).toHaveBeenCalledWith("project-2", {
      jira: { JIRA_API_URL: "https://jira.example.com" },
    });
  });

  it("uses provided tools and connectors", async () => {
    (readConfig as ReturnType<typeof vi.fn>).mockReturnValue({
      profile: "core",
      workflows: ["/ps:intake"],
      tools: [],
      integrations: { writeBackEnabled: false },
    });
    (ensureProjectId as ReturnType<typeof vi.fn>).mockReturnValue("project-3");
    (parseTools as ReturnType<typeof vi.fn>).mockReturnValue(["kilocode"]);
    (resolveConnectorValuesFromEnv as ReturnType<typeof vi.fn>).mockReturnValue({
      jira: { JIRA_API_URL: "https://jira.example.com" },
    });
    const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(true);
    const readSpy = vi.spyOn(fs, "readFileSync").mockReturnValue("JIRA_API_URL=https://jira.example.com");

    const outputSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    await initProject({ tools: ["kilocode"], connectors: ["jira"] });

    expect(promptForTools).toHaveBeenCalled();
    expect(promptForConnectors).toHaveBeenCalled();
    expect(resolveConnectorValuesFromEnv).toHaveBeenCalledWith(["jira"]);
    expect(setProjectConnectors).toHaveBeenCalledWith("project-3", {
      jira: { JIRA_API_URL: "https://jira.example.com" },
    });
    expect(outputSpy).toHaveBeenCalledWith(
      "Loaded .env from " + path.resolve(process.cwd(), ".env") + "\n",
    );
    expect(outputSpy).toHaveBeenCalledWith(
      "Non-interactive init used env values for connectors: jira: JIRA_API_URL\n",
    );
    existsSpy.mockRestore();
    readSpy.mockRestore();
    outputSpy.mockRestore();
  });
});
