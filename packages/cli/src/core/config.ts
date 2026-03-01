import crypto from "crypto";
import fs from "fs";
import path from "path";
import YAML from "yaml";

export interface ProjectSpecConfig {
  profile: string;
  workflows: string[];
  tools: string[];
  projectId?: string;
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
    projectId: data.projectId,
    integrations: {
      writeBackEnabled:
        data.integrations?.writeBackEnabled ?? DEFAULT_CONFIG.integrations.writeBackEnabled,
    },
  };
}

export function writeConfig(config: ProjectSpecConfig, rootDir: string = process.cwd()): void {
  const configPath = path.join(rootDir, "projectspec", "config.yaml");
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const yaml = YAML.stringify(config);
  fs.writeFileSync(configPath, yaml, "utf8");
}

export function writeDefaultConfig(rootDir: string = process.cwd()): void {
  const configPath = path.join(rootDir, "projectspec", "config.yaml");
  if (fs.existsSync(configPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  const yaml = YAML.stringify(DEFAULT_CONFIG);
  fs.writeFileSync(configPath, yaml, "utf8");
}

export function ensureProjectId(rootDir: string = process.cwd()): string {
  const config = readConfig(rootDir);
  if (config.projectId) {
    return config.projectId;
  }
  const projectId = crypto.randomUUID();
  writeConfig({ ...config, projectId }, rootDir);
  return projectId;
}

export function getProjectId(rootDir: string = process.cwd()): string | null {
  const config = readConfig(rootDir);
  return config.projectId ?? null;
}
