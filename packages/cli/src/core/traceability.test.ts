/// <reference types="vitest" />
import { describe, expect, it } from "vitest";
import { findDrift } from "./traceability.js";

describe("traceability", () => {
  it("reports missing links", () => {
    const issues = findDrift({
      requirements: {
        "REQ-APP-0001": [],
      },
      decisions: {
        "ADR-0001": [],
      },
    });

    expect(issues).toHaveLength(2);
  });
});
