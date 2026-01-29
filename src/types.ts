export type Message = {
  role: "user" | "model";
  content: string;
  timestamp: number;
};

export type Session = {
  id: string;
  name?: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

export type Config = {
  sessionDir: string;
  model: string;
};

export type CLIArgs = {
  sessionId?: string;
  promptGen?: boolean;
  targetModel?: "claude" | "gpt";
  prompt?: string;
};
