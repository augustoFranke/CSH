import { join } from "path";
import { mkdir, readFile, writeFile, readdir } from "fs/promises";
import { existsSync } from "fs";
import { config } from "./config.ts";
import type { Session, Message } from "./types.ts";

export async function ensureSessionDir(): Promise<void> {
  if (!existsSync(config.sessionDir)) {
    await mkdir(config.sessionDir, { recursive: true });
  }
}

export function createSession(): Session {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function loadSession(id: string): Promise<Session | null> {
  const filePath = join(config.sessionDir, `${id}.json`);
  if (!existsSync(filePath)) {
    return null;
  }
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content) as Session;
}

export async function saveSession(session: Session): Promise<void> {
  await ensureSessionDir();
  session.updatedAt = Date.now();
  const filePath = join(config.sessionDir, `${session.id}.json`);
  await writeFile(filePath, JSON.stringify(session, null, 2), "utf-8");
}

export function clearSession(session: Session): Session {
  return {
    ...session,
    messages: [],
    updatedAt: Date.now(),
  };
}

export function addMessage(
  session: Session,
  role: Message["role"],
  content: string
): Session {
  return {
    ...session,
    messages: [
      ...session.messages,
      { role, content, timestamp: Date.now() },
    ],
    updatedAt: Date.now(),
  };
}

export async function listSessions(): Promise<string[]> {
  await ensureSessionDir();
  const files = await readdir(config.sessionDir);
  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}
