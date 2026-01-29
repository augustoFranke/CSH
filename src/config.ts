import { join } from "path";
import { homedir } from "os";
import type { Config } from "./types.ts";

const HOME = homedir();

export const config: Config = {
  sessionDir: join(HOME, ".csh", "sessions"),
  model: "gemini-3-flash-preview",
};

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  process.exit(1);
}
