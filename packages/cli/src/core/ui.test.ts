import { describe, expect, it, vi } from "vitest";

vi.mock("gradient-string", () => ({
  default: (): ((text: string) => string) => (text: string) => text,
}));

import { renderLogo } from "./ui.js";

describe("ui", () => {
  it("renders the banner", async () => {
    const spy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    await renderLogo();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
