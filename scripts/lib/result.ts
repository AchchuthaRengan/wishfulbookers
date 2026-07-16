export type ValidationIssue = {
  code: string;
  message: string;
  path?: string;
};

export type ValidationResult<T = undefined> = {
  ok: boolean;
  issues: ValidationIssue[];
  value?: T;
};

export function success<T>(value?: T): ValidationResult<T> {
  return value === undefined
    ? { ok: true, issues: [] }
    : { ok: true, issues: [], value };
}

export function failure<T>(issues: ValidationIssue[]): ValidationResult<T> {
  return { ok: false, issues };
}

export function printResult(
  label: string,
  result: ValidationResult<unknown>,
): number {
  if (result.ok) {
    process.stdout.write(`${label}: PASS\n`);
    return 0;
  }

  process.stderr.write(`${label}: FAIL\n`);
  for (const issue of result.issues) {
    const location = issue.path === undefined ? "" : ` (${issue.path})`;
    process.stderr.write(`- ${issue.code}${location}: ${issue.message}\n`);
  }
  return 1;
}
