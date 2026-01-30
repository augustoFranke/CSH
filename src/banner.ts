import { HIGHLIGHT, RESET } from "./theme.ts";

const ART_LINES = [
  " ██████╗███████╗██╗  ██╗",
  "██╔════╝██╔════╝██║  ██║",
  "██║     ███████╗███████║",
  "██║     ╚════██║██╔══██║",
  "╚██████╗███████║██║  ██║",
  " ╚═════╝╚══════╝╚═╝  ╚═╝",
];

function buildFramedArt(lines: string[]): string {
  const maxLen = Math.max(...lines.map((line) => line.length));
  const top = `┌${"─".repeat(maxLen + 2)}┐`;
  const bottom = `└${"─".repeat(maxLen + 2)}┘`;
  const framed = lines.map((line) => `│ ${line.padEnd(maxLen)} │`);
  return [top, ...framed, bottom].join("\n");
}

const BANNER = buildFramedArt(ART_LINES);
const ART_WIDTH = Math.max(...ART_LINES.map((line) => line.length));
const SUBTITLE = "Chat - Research - Retrieval";

function buildSubtitleLine(text: string): string {
  const innerPad = Math.max(0, Math.floor((ART_WIDTH - text.length) / 2));
  return `${" ".repeat(2 + innerPad)}${text}`;
}

export function showBanner(): void {
  const subtitleLine = buildSubtitleLine(SUBTITLE);
  process.stdout.write(
    `${HIGHLIGHT}${BANNER}${RESET}\n${HIGHLIGHT}\x1b[1m${subtitleLine}${RESET}\n\n`
  );
}
