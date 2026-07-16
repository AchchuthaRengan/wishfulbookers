export async function readHookPayload() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  if (input.trim() === "") return {};
  const parsed = JSON.parse(input);
  return typeof parsed === "object" && parsed !== null ? parsed : {};
}

export function emitHookOutput(output) {
  process.stdout.write(`${JSON.stringify(output)}\n`);
}

export function emitStopHookOutput(output) {
  const supported = new Set(["continue", "stopReason", "systemMessage"]);
  if (
    typeof output.continue !== "boolean" ||
    Object.keys(output).some((field) => !supported.has(field)) ||
    (output.stopReason !== undefined &&
      typeof output.stopReason !== "string") ||
    (output.systemMessage !== undefined &&
      typeof output.systemMessage !== "string")
  ) {
    throw new Error("Unsupported Stop hook output.");
  }
  emitHookOutput(output);
}

export function safeHookFailure(message) {
  emitHookOutput({
    continue: true,
    systemMessage: `Navlands hook warning: ${message}`,
  });
}
