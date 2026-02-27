import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/assets/**"],
      lines: 80,
      statements: 80,
      functions: 80,
      branches: 80,
    },
  },
});
