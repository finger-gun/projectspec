import fs from "node:fs/promises";
import path from "node:path";

const rootDir = path.resolve(new URL("..", import.meta.url).pathname);
const srcDir = path.join(rootDir, "src", "assets");
const destDir = path.join(rootDir, "dist", "assets");

async function copyDir(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      await copyDir(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

try {
  await copyDir(srcDir, destDir);
} catch (error) {
  if (error?.code !== "ENOENT") {
    throw error;
  }
}
