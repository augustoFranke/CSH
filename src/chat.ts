import type { ChatSession } from "@google/generative-ai";
import { createChat, sendMessage } from "./gemini.ts";
import {
  createSession,
  saveSession,
  clearSession,
  addMessage,
} from "./session.ts";
import type { Session } from "./types.ts";

const PROMPT = "> ";

function showHelp(): void {
  console.log("csh - Research & Prompt CLI");
  console.log("Commands: /clear, /help, /exit");
  console.log("");
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
      console.log("Session cleared.\n");
      return { session: clearedSession, chat: newChat, shouldExit: false };

    case "/help":
      showHelp();
      return { session, chat, shouldExit: false };

    case "/exit":
    case "/quit":
      return { session, chat, shouldExit: true };

    default:
      console.log(`Unknown command: ${cmd}\n`);
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

  process.stdout.write(PROMPT);

  for await (const line of console) {
    const input = line.trim();

    if (!input) {
      process.stdout.write(PROMPT);
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

      process.stdout.write(PROMPT);
      continue;
    }

    try {
      session = addMessage(session, "user", input);
      const response = await sendMessage(chat, input);
      session = addMessage(session, "model", response);

      console.log("");
      console.log(response);
      console.log("");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Error: ${message}\n`);
    }

    process.stdout.write(PROMPT);
  }

  await cleanup();
}
