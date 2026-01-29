import type { CLIArgs } from "./types.ts";

export function parseArgs(args: string[]): CLIArgs {
  const result: CLIArgs = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--session":
      case "-s":
        result.sessionId = args[++i];
        break;

      case "--prompt-gen":
        result.promptGen = true;
        break;

      case "--claude":
        result.targetModel = "claude";
        break;

      case "--gpt":
        result.targetModel = "gpt";
        break;

      default:
        if (!arg?.startsWith("-") && !result.prompt) {
          result.prompt = arg;
        }
        break;
    }
  }

  return result;
}
