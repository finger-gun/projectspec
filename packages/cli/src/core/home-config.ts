import fs from "fs";
import os from "os";
import path from "path";
import YAML from "yaml";

export type ConnectorId = "jira" | "confluence";

export interface HomeConfigProject {
  connectors: Record<ConnectorId, Record<string, string>>;
}

export interface HomeConfig {
  version: 1;
  projects: Record<string, HomeConfigProject>;
}

const DEFAULT_HOME_CONFIG: HomeConfig = {
  version: 1,
  projects: {},
};

function getHomeBase(homeDir?: string): string {
  if (homeDir) {
    return homeDir;
  }
  return process.env.PROJECTSPEC_HOME ?? os.homedir();
}

export function getHomeConfigPath(homeDir?: string): string {
  return path.join(getHomeBase(homeDir), ".projectspec", "config.yaml");
}

export function readHomeConfig(homeDir?: string): HomeConfig {
  const configPath = getHomeConfigPath(homeDir);
  if (!fs.existsSync(configPath)) {
    return DEFAULT_HOME_CONFIG;
  }
  const raw = fs.readFileSync(configPath, "utf8");
  const data = YAML.parse(raw) as HomeConfig | null;
  if (!data || typeof data !== "object") {
    return DEFAULT_HOME_CONFIG;
  }
  return {
    version: data.version ?? 1,
    projects: data.projects ?? {},
  };
}

export function writeHomeConfig(config: HomeConfig, homeDir?: string): void {
  const configPath = getHomeConfigPath(homeDir);
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, YAML.stringify(config), "utf8");
}

export function setProjectConnectors(
  projectId: string,
  connectors: Record<ConnectorId, Record<string, string>>,
  homeDir?: string,
): HomeConfig {
  const config = readHomeConfig(homeDir);
  config.projects[projectId] = {
    connectors,
  };
  writeHomeConfig(config, homeDir);
  return config;
}

export function getProjectConnectorConfig(
  projectId: string,
  connectorId: ConnectorId,
  homeDir?: string,
): Record<string, string> | null {
  const config = readHomeConfig(homeDir);
  return config.projects[projectId]?.connectors?.[connectorId] ?? null;
}
