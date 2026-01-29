import { GoogleGenerativeAI, type ChatSession, type Content } from "@google/generative-ai";
import { config, GEMINI_API_KEY } from "./config.ts";
import type { Message } from "./types.ts";

const systemInstruction = `You are a fast, concise CLI assistant for research, information gathering, and task planning. Think of yourself like a knowledgeable colleague—helpful, direct, and respectful of the user's time.

Guidelines:
- Be brief. Terminal users want answers, not essays.
- Lead with the answer, then add context only if needed.
- Use plain text formatting. Avoid markdown unless the user asks for it.
- When uncertain, say so plainly.
- Match the user's energy: terse questions get terse answers; detailed questions get fuller responses.`;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: config.model,
  systemInstruction,
  generationConfig: {
    maxOutputTokens: 4096,
    temperature: 0.1,
  },
});

function messagesToHistory(messages: Message[]): Content[] {
  return messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));
}

export function createChat(history: Message[] = []): ChatSession {
  return model.startChat({
    history: messagesToHistory(history),
  });
}

export async function sendMessage(
  chat: ChatSession,
  message: string
): Promise<string> {
  const result = await chat.sendMessage(message);
  return result.response.text();
}
