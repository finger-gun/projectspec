import enquirer from "enquirer";
import { ConnectorId } from "./home-config.js";

const MultiSelect = (enquirer as unknown as { MultiSelect: new (options: object) => { run: () => Promise<string[]> } }).MultiSelect;
const Input = (enquirer as unknown as { Input: new (options: object) => { run: () => Promise<string> } }).Input;

export interface ConnectorDefinition {
  id: ConnectorId;
  name: string;
  requiredFields: string[];
  optionalFields: string[];
}

const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  {
    id: "jira",
    name: "Jira Cloud",
    requiredFields: ["JIRA_API_URL", "JIRA_PROJECT_KEY"],
    optionalFields: ["JIRA_USER", "JIRA_PAT", "JIRA_OAUTH_TOKEN", "JIRA_QUERY"],
  },
  {
    id: "confluence",
    name: "Confluence Cloud",
    requiredFields: [],
    optionalFields: [
      "CONFLUENCE_API_URL",
      "CONFLUENCE_USER",
      "CONFLUENCE_SPACE_KEY",
      "CONFLUENCE_PAGE_IDS",
      "CONFLUENCE_PAT",
      "CONFLUENCE_OAUTH_TOKEN",
    ],
  },
];

export async function promptForConnectors(): Promise<ConnectorId[]> {
  if (!process.stdin.isTTY) {
    return [];
  }
  const prompt = new MultiSelect({
    name: "connectors",
    message: "Select connectors to configure",
    hint: "Use space to toggle, enter to confirm",
    choices: CONNECTOR_DEFINITIONS.map((connector) => ({
      name: connector.id,
      message: connector.name,
    })),
  });
  try {
    const result = (await prompt.run()) as ConnectorId[];
    return result;
  } catch {
    return [];
  }
}

export async function resolveConnectorValues(
  connectors: ConnectorId[],
): Promise<Record<ConnectorId, Record<string, string>>> {
  const result = {} as Record<ConnectorId, Record<string, string>>;
  for (const connectorId of connectors) {
    const definition = CONNECTOR_DEFINITIONS.find((entry) => entry.id === connectorId);
    if (!definition) {
      continue;
    }
    result[connectorId] = await promptConnectorFields(definition);
  }
  return result;
}

export function resolveConnectorValuesFromEnv(
  connectors: ConnectorId[],
): Record<ConnectorId, Record<string, string>> {
  const result = {} as Record<ConnectorId, Record<string, string>>;
  const missing: string[] = [];
  for (const connectorId of connectors) {
    const definition = CONNECTOR_DEFINITIONS.find((entry) => entry.id === connectorId);
    if (!definition) {
      continue;
    }
    const values: Record<string, string> = {};
    for (const field of definition.requiredFields) {
      const value = process.env[field];
      if (value) {
        values[field] = value;
      } else {
        missing.push(`${definition.name} ${field}`);
      }
    }
    for (const field of definition.optionalFields) {
      const value = process.env[field];
      if (value) {
        values[field] = value;
      }
    }
    result[connectorId] = values;
  }
  if (missing.length > 0) {
    throw new Error(`Missing required connector values: ${missing.join(", ")}`);
  }
  return result;
}

export function getConnectorDefinitions(): ConnectorDefinition[] {
  return CONNECTOR_DEFINITIONS;
}

export type { ConnectorId };

async function promptConnectorFields(
  definition: ConnectorDefinition,
): Promise<Record<string, string>> {
  const values: Record<string, string> = {};
  for (const field of definition.requiredFields) {
    const prompt = new Input({
      message: `${definition.name} ${field}:`,
      validate: (value: string): true | string => (value ? true : "Required"),
    });
    values[field] = (await prompt.run()) as string;
  }
  for (const field of definition.optionalFields) {
    const prompt = new Input({
      message: `${definition.name} ${field} (optional):`,
    });
    const value = (await prompt.run()) as string;
    if (value) {
      values[field] = value;
    }
  }
  return values;
}
