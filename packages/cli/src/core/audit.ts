import fs from "fs";
import path from "path";
import YAML from "yaml";

interface ChangeActivity {
  type: string;
  source?: string;
  action: string;
  timestamp: string;
}

export function recordChangeActivity(
  activity: ChangeActivity,
  rootDir: string = process.cwd(),
): void {
  const historyPath = path.join(rootDir, "projectspec", "changes", "audit.yaml");
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  const existing = readAudit(historyPath);
  existing.push(activity);
  fs.writeFileSync(historyPath, YAML.stringify(existing), "utf8");
}

function readAudit(historyPath: string): ChangeActivity[] {
  if (!fs.existsSync(historyPath)) {
    return [];
  }

  const raw = fs.readFileSync(historyPath, "utf8");
  const data = YAML.parse(raw) as ChangeActivity[] | null;
  return data ?? [];
}
