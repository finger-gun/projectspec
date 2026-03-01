import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";
import YAML from "yaml";

export interface AttachmentSummary {
  snapshotPath: string;
  attachmentsDir: string;
  generatedAt: string;
  files: Array<{
    path: string;
    type: string;
    summary?: string;
    error?: string;
  }>;
  errors: string[];
}

export async function main(): Promise<void> {
  const rootDir = process.cwd();
  const snapshotDir = resolveSnapshotDir(rootDir, process.argv[2]);
  if (!snapshotDir) {
    process.stderr.write("No confluence snapshot found.\n");
    process.exitCode = 1;
    return;
  }
  const attachmentsDir = path.join(snapshotDir, "attachments");
  if (!fs.existsSync(attachmentsDir)) {
    process.stdout.write("No attachments directory found.\n");
    return;
  }
  const summaryPath = path.join(snapshotDir, "attachments-summary.json");
  const summary = buildSummary(snapshotDir, attachmentsDir);
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf8");
  process.stdout.write(
    `Attachment summary: ${summary.files.length} files analyzed. Output: ${summaryPath}\n`,
  );
  if (summary.errors.length > 0) {
    process.stdout.write(`Attachment summary warnings: ${summary.errors.join(" | ")}\n`);
  }
}

export function resolveSnapshotDir(rootDir: string, input?: string): string | null {
  if (input) {
    const resolved = path.resolve(rootDir, input);
    return fs.existsSync(resolved) ? resolved : null;
  }
  const indexPath = path.join(rootDir, "projectspec", "sources", "imported", "index.yaml");
  if (!fs.existsSync(indexPath)) {
    return null;
  }
  const raw = fs.readFileSync(indexPath, "utf8");
  const data = YAML.parse(raw) as { sources?: Record<string, { latestSnapshot?: string }> };
  const latest = data?.sources?.confluence?.latestSnapshot;
  if (!latest) {
    return null;
  }
  return latest;
}

export function buildSummary(snapshotDir: string, attachmentsDir: string): AttachmentSummary {
  const files = listAttachmentFiles(attachmentsDir);
  const result: AttachmentSummary = {
    snapshotPath: snapshotDir,
    attachmentsDir,
    generatedAt: new Date().toISOString(),
    files: [],
    errors: [],
  };

  if (files.length === 0) {
    return result;
  }

  const python = findPython();
  if (!python) {
    result.errors.push("python3 not available; attachment parsing skipped");
    for (const file of files) {
      result.files.push({ path: file, type: detectType(file), error: "python3 missing" });
    }
    return result;
  }

  const pythonScript = buildPythonScript();
  const proc = spawnSync(python, ["-c", pythonScript, attachmentsDir], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (proc.error) {
    result.errors.push(`python error: ${proc.error.message}`);
    return result;
  }
  if (proc.status !== 0) {
    result.errors.push(`python exit ${proc.status}: ${proc.stderr.trim()}`);
    return result;
  }
  try {
    const parsed = JSON.parse(proc.stdout) as { files?: AttachmentSummary["files"]; errors?: string[] };
    result.files = parsed.files ?? [];
    result.errors = parsed.errors ?? [];
  } catch (error) {
    result.errors.push(`failed to parse python output: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

export function listAttachmentFiles(attachmentsDir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(attachmentsDir, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(attachmentsDir, entry.name);
    if (entry.isDirectory()) {
      const nested = listAttachmentFiles(entryPath);
      files.push(...nested);
      continue;
    }
    files.push(entryPath);
  }
  return files;
}

export function detectType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if ([".xlsx", ".xlsm"].includes(ext)) return "xlsx";
  if (ext === ".csv") return "csv";
  if (ext === ".drawio" || ext === ".xml") return "drawio";
  if ([".png", ".jpg", ".jpeg"].includes(ext)) return "image";
  return ext.replace(".", "") || "file";
}

export function findPython(): string | null {
  if (process.env.PROJECTSPEC_PYTHON_DISABLED) {
    return null;
  }
  const candidates = ["python3", "python"];
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["--version"], { encoding: "utf8" });
    if (result.status === 0) {
      return candidate;
    }
  }
  return null;
}

export function buildPythonScript(): string {
  return `
import json
import os
import sys
import re
import csv
import zipfile
import xml.etree.ElementTree as ET

attachments_dir = sys.argv[1]

def detect_type(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in ('.xlsx', '.xlsm'):
        return 'xlsx'
    if ext == '.csv':
        return 'csv'
    if ext in ('.drawio', '.xml'):
        return 'drawio'
    if ext in ('.png', '.jpg', '.jpeg'):
        return 'image'
    return ext.replace('.', '') or 'file'

def list_files(root):
    result = []
    for base, _dirs, files in os.walk(root):
        for f in files:
            result.append(os.path.join(base, f))
    return result

def read_csv(path):
    rows = []
    with open(path, newline='', encoding='utf-8', errors='ignore') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            rows.append(row)
            if i >= 25:
                break
    if not rows:
        return 'empty csv'
    headers = rows[0]
    sample = rows[1:6]
    return f"headers={headers}; sample_rows={sample}"

def parse_shared_strings(zf):
    try:
        data = zf.read('xl/sharedStrings.xml')
    except KeyError:
        return []
    root = ET.fromstring(data)
    strings = []
    for si in root.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si'):
        text = ''.join([t.text or '' for t in si.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t')])
        strings.append(text)
    return strings

def parse_workbook(zf):
    workbook = ET.fromstring(zf.read('xl/workbook.xml'))
    ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    sheets = []
    for sheet in workbook.findall('ns:sheets/ns:sheet', ns):
        sheets.append({'name': sheet.attrib.get('name'), 'rid': sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')})
    rels = ET.fromstring(zf.read('xl/_rels/workbook.xml.rels'))
    rel_map = {}
    for rel in rels.findall('.//{http://schemas.openxmlformats.org/package/2006/relationships}Relationship'):
        rel_map[rel.attrib['Id']] = rel.attrib['Target']
    for sheet in sheets:
        target = rel_map.get(sheet['rid'])
        if target and not target.startswith('xl/'):
            target = 'xl/' + target
        sheet['path'] = target
    return sheets

def col_index(cell_ref):
    match = re.match(r'([A-Z]+)', cell_ref)
    if not match:
        return 0
    col = match.group(1)
    idx = 0
    for ch in col:
        idx = idx * 26 + (ord(ch) - 64)
    return idx - 1

def read_xlsx(path):
    with zipfile.ZipFile(path) as zf:
        shared = parse_shared_strings(zf)
        sheets = parse_workbook(zf)
        summaries = []
        for sheet in sheets:
            if not sheet.get('path'):
                continue
            data = ET.fromstring(zf.read(sheet['path']))
            ns = {'ns': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            rows = []
            for row in data.findall('ns:sheetData/ns:row', ns):
                cells = {}
                for cell in row.findall('ns:c', ns):
                    ref = cell.attrib.get('r', '')
                    value = ''
                    if cell.attrib.get('t') == 's':
                        v = cell.find('ns:v', ns)
                        if v is not None:
                            idx = int(v.text)
                            value = shared[idx] if idx < len(shared) else ''
                    else:
                        v = cell.find('ns:v', ns)
                        if v is not None:
                            value = v.text or ''
                    cells[col_index(ref)] = value
                if cells:
                    max_col = max(cells.keys())
                    row_values = [cells.get(i, '') for i in range(max_col + 1)]
                    rows.append(row_values)
                if len(rows) >= 25:
                    break
            if not rows:
                continue
            headers = rows[0]
            sample = rows[1:6]
            summaries.append({'name': sheet.get('name'), 'headers': headers, 'sample_rows': sample})
        return summaries

def read_drawio(path):
    try:
        tree = ET.parse(path)
    except Exception:
        return 'invalid drawio'
    root = tree.getroot()
    values = []
    for cell in root.findall('.//mxCell'):
        value = cell.attrib.get('value')
        if value:
            text = re.sub('<[^>]+>', ' ', value)
            text = re.sub('\\s+', ' ', text).strip()
            if text and text not in values:
                values.append(text)
        if len(values) >= 40:
            break
    return f"labels={values}"

def read_image(path):
    try:
        from PIL import Image
    except Exception:
        return 'PIL not available'
    try:
        image = Image.open(path)
        summary = f"size={image.size}"
    except Exception as e:
        return f"image error: {e}"
    text = None
    try:
        import pytesseract
        text = pytesseract.image_to_string(image)
    except Exception:
        text = None
    if text:
        cleaned = re.sub('\\s+', ' ', text).strip()
        if cleaned:
            summary += f"; ocr={cleaned[:500]}"
    return summary

files = list_files(attachments_dir)
output = {"files": [], "errors": []}
for path in files:
    kind = detect_type(path)
    item = {"path": path, "type": kind}
    try:
        if kind == 'csv':
            item['summary'] = read_csv(path)
        elif kind == 'xlsx':
            item['summary'] = read_xlsx(path)
        elif kind == 'drawio':
            item['summary'] = read_drawio(path)
        elif kind == 'image':
            item['summary'] = read_image(path)
    except Exception as e:
        item['error'] = str(e)
    output['files'].append(item)
print(json.dumps(output))
`;
}

if (process.argv[1]?.includes("intake-attachments")) {
  main().catch((error) => {
    process.stderr.write(`Attachment summary failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
