import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { describe, expect, it, vi } from "vitest";

vi.mock("./cli.js", () => ({
  runCli: vi.fn(),
}));

import { runCli } from "./cli.js";

describe("index", () => {
  it("invokes CLI when run as entrypoint", async () => {
    const entry = fileURLToPath(new URL("./index.ts", import.meta.url));
    const previousArgv = [...process.argv];
    process.argv = [process.argv[0], path.resolve(entry), "init"];

    await import(pathToFileURL(entry).href);

    expect(runCli).toHaveBeenCalledWith(["init"]);
    process.argv = previousArgv;
  });
});
