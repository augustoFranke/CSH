import { Marked } from "marked";
import { markedTerminal } from "marked-terminal";

// @ts-expect-error - types are outdated for marked-terminal v7
const marked = new Marked(markedTerminal());

export function renderMarkdown(text: string): string {
  return marked.parse(text) as string;
}
