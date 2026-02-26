import fs from "fs";
import path from "path";
import YAML from "yaml";

export interface ProjectSpecConfig {
  profile: string;
  workflows: string[];
  tools: string[];
  integrations: {
    writeBackEnabled: boolean;
  };
}

const DEFAULT_CONFIG: ProjectSpecConfig = {
  profile: "core",
  workflows: ["/ps:intake", "/ps:design", "/ps:plan", "/ps:export", "/ps:verify", "/ps:archive"],
  tools: [],
  integrations: {
    writeBackEnabled: false,
  },
};

export function readConfig(rootDir: string = process.cwd()): ProjectSpecConfig {
  const configPath = path.join(rootDir, "projectspec", "config.yaml");
  if (!fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  const raw = fs.readFileSync(configPath, "utf8");
  const data = YAML.parse(raw) as Partial<ProjectSpecConfig> | null;
  if (!data || typeof data !== "object") {
    return DEFAULT_CONFIG;
  }

  return {
    profile: data.profile ?? DEFAULT_CONFIG.profile,
    workflows: data.workflows ?? DEFAULT_CONFIG.workflows,
    tools: data.tools ?? DEFAULT_CONFIG.tools,
    integrations: {
      writeBackEnabled:
        data.integrations?.writeBackEnabled ?? DEFAULT_CONFIG.integrations.writeBackEnabled,
    },
  };
}

export function writeDefaultConfig(rootDir: string = process.cwd()): void {
  const configPath = path.join(rootDir, "projectspec", "config.yaml");
  if (fs.existsSync(configPath)) {
    return;
  }

  const yaml = YAML.stringify(DEFAULT_CONFIG);
  fs.writeFileSync(configPath, yaml, "utf8");
}
