function escapeRegex(character: string): string {
  return /[\\^$.*+?()[\]{}|]/u.test(character) ? `\\${character}` : character;
}

export function normalizeRepositoryPath(value: string): string {
  return value.replaceAll("\\", "/").replace(/^\.\//u, "");
}

export function isSafeRelativePath(value: string): boolean {
  const normalized = normalizeRepositoryPath(value);
  return (
    normalized.length > 0 &&
    !normalized.startsWith("/") &&
    !/^[A-Za-z]:\//u.test(normalized) &&
    !normalized.split("/").includes("..") &&
    !normalized.includes("\0")
  );
}

export function globToRegExp(pattern: string): RegExp {
  const normalized = normalizeRepositoryPath(pattern);
  let output = "^";
  for (let index = 0; index < normalized.length; index += 1) {
    const current = normalized[index] ?? "";
    const next = normalized[index + 1];
    if (current === "*" && next === "*") {
      output += ".*";
      index += 1;
    } else if (current === "*") {
      output += "[^/]*";
    } else if (current === "?") {
      output += "[^/]";
    } else {
      output += escapeRegex(current);
    }
  }
  return new RegExp(`${output}$`, "u");
}

export function matchesGlob(value: string, pattern: string): boolean {
  return globToRegExp(pattern).test(normalizeRepositoryPath(value));
}

export function matchesAnyGlob(value: string, patterns: string[]): boolean {
  return patterns.some((pattern) => matchesGlob(value, pattern));
}
