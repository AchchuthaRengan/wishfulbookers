import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SKIP_DIRECTORIES = new Set([
  ".git",
  "node_modules",
  "dist-harness",
  "coverage",
  ".cache",
]);

export function listFilesRecursively(root: string, current = root): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(current, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) continue;
    const absolute = join(current, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRECTORIES.has(entry.name))
        files.push(...listFilesRecursively(root, absolute));
    } else if (entry.isFile()) {
      files.push(relative(root, absolute).replaceAll("\\", "/"));
    }
  }
  return files.sort();
}

export function isTextFile(path: string): boolean {
  const extension = path.toLowerCase().split(".").pop() ?? "";
  return (
    new Set([
      "cjs",
      "css",
      "gitignore",
      "html",
      "js",
      "json",
      "md",
      "mjs",
      "npmrc",
      "prettierignore",
      "toml",
      "ts",
      "tsx",
      "txt",
      "yaml",
      "yml",
    ]).has(extension) || !path.includes(".")
  );
}

export function readText(path: string): string {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink())
    throw new Error(`Not a regular file: ${path}`);
  return readFileSync(path, "utf8");
}
