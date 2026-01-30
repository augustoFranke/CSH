import type { ChatSession } from "@google/generative-ai";
import { createChat, sendMessage } from "./gemini.ts";
import {
  createSession,
  saveSession,
  clearSession,
  addMessage,
} from "./session.ts";
import { renderMarkdown } from "./markdown.ts";
import { showCommands } from "./commands.ts";
import { readInput } from "./input.ts";
import { showBanner } from "./banner.ts";
import type { Session } from "./types.ts";

function showHelp(): void {
  showBanner();
  console.log("Type / to see available commands\n");
}

function handleCommand(
  command: string,
  session: Session,
  chat: ChatSession
): { session: Session; chat: ChatSession; shouldExit: boolean } {
  const cmd = command.trim().toLowerCase();

  switch (cmd) {
    case "/clear":
      const clearedSession = clearSession(session);
      const newChat = createChat([]);
      process.stdout.write("\x1b[2J\x1b[H");
      showHelp();
      return { session: clearedSession, chat: newChat, shouldExit: false };

    case "/exit":
    case "/quit":
      return { session, chat, shouldExit: true };

    default:
      console.log(`Unknown command: ${cmd}`);
      showCommands();
      return { session, chat, shouldExit: false };
  }
}

export async function startChat(initialSession?: Session): Promise<void> {
  let session = initialSession ?? createSession();
  let chat = createChat(session.messages);

  showHelp();

  const cleanup = async () => {
    await saveSession(session);
    console.log("\nSession saved.");
    process.exit(0);
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  while (true) {
    const { value: input, cancelled } = await readInput();

    if (cancelled) {
      await cleanup();
      return;
    }

    if (!input.trim()) {
      continue;
    }

    if (input.startsWith("/")) {
      const result = handleCommand(input, session, chat);
      session = result.session;
      chat = result.chat;

      if (result.shouldExit) {
        await cleanup();
        return;
      }
      continue;
    }

    try {
      session = addMessage(session, "user", input);
      const response = await sendMessage(chat, input);
      session = addMessage(session, "model", response);

      console.log("");
      process.stdout.write(renderMarkdown(response));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}\n`);
    }
  }
}
