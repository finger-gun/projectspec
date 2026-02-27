import { describe, expect, it, vi } from "vitest";

vi.mock("../core/verify.js", () => ({
  runVerify: vi.fn(),
}));

import { runVerify } from "../core/verify.js";
import { verifyProject } from "./verify.js";

describe("verify", () => {
  it("reports drift and sets exit code", () => {
    (runVerify as ReturnType<typeof vi.fn>).mockReturnValue(["Issue 1"]);
    const stderr = vi.spyOn(process.stderr, "write").mockImplementation(() => true);

    verifyProject();

    expect(stderr).toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
    stderr.mockRestore();
    process.exitCode = undefined;
  });

  it("reports no drift", () => {
    (runVerify as ReturnType<typeof vi.fn>).mockReturnValue([]);
    const stdout = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    verifyProject();

    expect(stdout).toHaveBeenCalled();
    stdout.mockRestore();
  });
});
