import fs from "fs";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ProjectSpecConfig } from "./config.js";
import { stringifyManifest, ToolExportManifest, updateToolExports } from "./exports.js";

function writeWorkflow(rootDir: string, slug: string, content: string): void {
  const workflowsDir = path.join(rootDir, "projectspec", "workflows");
  fs.mkdirSync(workflowsDir, { recursive: true });
  fs.writeFileSync(path.join(workflowsDir, `${slug}.md`), content, "utf8");
}

describe("tool exports", () => {
  it("serializes manifests deterministically", () => {
    const manifest: ToolExportManifest = {
      version: 1,
      toolId: "kilocode",
      exportDir: "projectspec/exports/kilocode",
      inputs: {
        workflows: [
          "projectspec/workflows/plan.md",
          "projectspec/workflows/intake.md",
        ],
      },
      outputs: {
        exportDir: "projectspec/exports/kilocode",
        files: ["workflows/ps-plan.md", "workflows/ps-intake.md"],
      },
      harness: [
        {
          targetDir: ".kilocode/skills",
          files: ["projectspec-workflows/SKILL.md"],
        },
        {
          targetDir: ".kilocode/workflows",
          files: ["ps-plan.md", "ps-intake.md"],
        },
      ],
    };

    const output = stringifyManifest(manifest);
    const expected = [
      "{",
      "  \"version\": 1,",
      "  \"toolId\": \"kilocode\",",
      "  \"exportDir\": \"projectspec/exports/kilocode\",",
      "  \"inputs\": {",
      "    \"workflows\": [",
      "      \"projectspec/workflows/intake.md\",",
      "      \"projectspec/workflows/plan.md\"",
      "    ]",
      "  },",
      "  \"outputs\": {",
      "    \"exportDir\": \"projectspec/exports/kilocode\",",
      "    \"files\": [",
      "      \"workflows/ps-intake.md\",",
      "      \"workflows/ps-plan.md\"",
      "    ]",
      "  },",
      "  \"harness\": [",
      "    {",
      "      \"targetDir\": \".kilocode/skills\",",
      "      \"files\": [",
      "        \"projectspec-workflows/SKILL.md\"",
      "      ]",
      "    },",
      "    {",
      "      \"targetDir\": \".kilocode/workflows\",",
      "      \"files\": [",
      "        \"ps-intake.md\",",
      "        \"ps-plan.md\"",
      "      ]",
      "    }",
      "  ]",
      "}",
      "",
    ].join("\n");

    expect(output).toBe(expected);
    expect(stringifyManifest(manifest)).toBe(output);
  });

  it("generates deterministic outputs for identical inputs", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-export-"));
    writeWorkflow(rootDir, "intake", "# /ps:intake\n\nTest.\n");

    const config: ProjectSpecConfig = {
      profile: "core",
      workflows: ["/ps:intake"],
      tools: ["kilocode"],
      integrations: {
        writeBackEnabled: false,
      },
    };

    updateToolExports(config, rootDir);
    const firstManifest = fs.readFileSync(
      path.join(rootDir, "projectspec", "exports", "kilocode", "manifest.json"),
      "utf8",
    );
    const firstPrompt = fs.readFileSync(
      path.join(rootDir, "projectspec", "exports", "kilocode", "workflows", "ps-intake.md"),
      "utf8",
    );

    updateToolExports(config, rootDir);
    const secondManifest = fs.readFileSync(
      path.join(rootDir, "projectspec", "exports", "kilocode", "manifest.json"),
      "utf8",
    );
    const secondPrompt = fs.readFileSync(
      path.join(rootDir, "projectspec", "exports", "kilocode", "workflows", "ps-intake.md"),
      "utf8",
    );

    expect(secondManifest).toBe(firstManifest);
    expect(secondPrompt).toBe(firstPrompt);
  });

  it("prunes obsolete exports without removing unrelated harness files", () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "projectspec-export-"));
    writeWorkflow(rootDir, "intake", "# /ps:intake\n\nTest.\n");
    writeWorkflow(rootDir, "plan", "# /ps:plan\n\nTest.\n");

    const config: ProjectSpecConfig = {
      profile: "core",
      workflows: ["/ps:intake", "/ps:plan"],
      tools: ["github-copilot"],
      integrations: {
        writeBackEnabled: false,
      },
    };

    updateToolExports(config, rootDir);
    const harnessDir = path.join(rootDir, ".github", "prompts");
    fs.mkdirSync(harnessDir, { recursive: true });
    fs.writeFileSync(path.join(harnessDir, "unrelated.prompt.md"), "keep\n", "utf8");

    fs.rmSync(path.join(rootDir, "projectspec", "workflows", "plan.md"));
    updateToolExports(config, rootDir);

    const exportPlan = path.join(
      rootDir,
      "projectspec",
      "exports",
      "github-copilot",
      "prompts",
      "ps-plan.prompt.md",
    );
    const harnessPlan = path.join(harnessDir, "ps-plan.prompt.md");

    expect(fs.existsSync(exportPlan)).toBe(false);
    expect(fs.existsSync(harnessPlan)).toBe(false);
    expect(fs.existsSync(path.join(harnessDir, "unrelated.prompt.md"))).toBe(true);
  });
});
