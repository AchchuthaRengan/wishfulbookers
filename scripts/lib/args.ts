export type CommonArguments = {
  planId?: string;
  json: boolean;
  force: boolean;
  requireVerified: boolean;
  positionals: string[];
};

export function parseCommonArguments(argv: string[]): CommonArguments {
  const positionals: string[] = [];
  let planId: string | undefined;
  let json = false;
  let force = false;
  let requireVerified = false;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--json") {
      json = true;
    } else if (value === "--force") {
      force = true;
    } else if (value === "--require-verified") {
      requireVerified = true;
    } else if (value === "--plan") {
      const candidate = argv[index + 1];
      if (candidate === undefined) throw new Error("--plan requires a value");
      planId = candidate;
      index += 1;
    } else if (value?.startsWith("--plan=")) {
      planId = value.slice("--plan=".length);
    } else if (value !== undefined && value !== "--") {
      positionals.push(value);
    }
  }

  return {
    ...(planId === undefined ? {} : { planId }),
    json,
    force,
    requireVerified,
    positionals,
  };
}
