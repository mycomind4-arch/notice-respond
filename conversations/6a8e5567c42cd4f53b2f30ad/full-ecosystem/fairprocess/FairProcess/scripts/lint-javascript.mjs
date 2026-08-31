import { readdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["apps/web", "packages", "scripts", "test"];
const extensions = new Set([".js", ".mjs", ".cjs"]);
const ignoredDirectories = new Set(["dist", "node_modules", ".git"]);
const files = [];

for (const root of roots) {
  await collect(path.resolve(root));
}

files.sort();
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`JavaScript syntax check passed for ${files.length} file(s).`);

async function collect(directory) {
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error?.code === "ENOENT") return;
    throw error;
  }

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collect(absolute);
    } else if (entry.isFile() && extensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
}
