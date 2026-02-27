import { describe, expect, it, vi } from "vitest";

vi.mock("./commands/init.js", () => ({
  initProject: vi.fn(),
}));
vi.mock("./commands/update.js", () => ({
  updateProject: vi.fn(),
}));
vi.mock("./commands/verify.js", () => ({
  verifyProject: vi.fn(),
}));
vi.mock("./commands/uninstall.js", () => ({
  uninstallProject: vi.fn(),
}));

import { initProject } from "./commands/init.js";
import { updateProject } from "./commands/update.js";
import { verifyProject } from "./commands/verify.js";
import { uninstallProject } from "./commands/uninstall.js";
import { runCli } from "./cli.js";

describe("cli", () => {
  it("routes init", () => {
    runCli(["init"]);
    expect(initProject).toHaveBeenCalled();
  });

  it("routes update with skip flag", () => {
    runCli(["update", "--skip-exports"]);
    expect(updateProject).toHaveBeenCalledWith({ skipExports: true });
  });

  it("routes verify", () => {
    runCli(["verify"]);
    expect(verifyProject).toHaveBeenCalled();
  });

  it("routes uninstall", () => {
    runCli(["uninstall", "--yes"]);
    expect(uninstallProject).toHaveBeenCalledWith(["--yes"]);
  });

  it("rejects /ps commands", () => {
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    runCli(["/ps:plan"]);
    expect(stderr).toHaveBeenCalled();
    stderr.mockRestore();
  });
});
