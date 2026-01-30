export const HIGHLIGHT = "\x1b[38;2;250;189;46m";
export const RESET = "\x1b[0m";

export function highlight(text: string): string {
  return `${HIGHLIGHT}${text}${RESET}`;
}
