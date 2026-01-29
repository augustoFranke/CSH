#!/usr/bin/env bun
import { parseArgs } from "./src/cli.ts";
import { startChat } from "./src/chat.ts";
import { loadSession, ensureSessionDir } from "./src/session.ts";

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  await ensureSessionDir();

  let session = undefined;
  if (args.sessionId) {
    session = await loadSession(args.sessionId);
    if (!session) {
      console.error(`Error: Session '${args.sessionId}' not found.`);
      process.exit(1);
    }
  }

  await startChat(session ?? undefined);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
