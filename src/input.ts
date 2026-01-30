import * as readline from "readline";
import { commands } from "./commands.ts";

const PROMPT = "> ";

type InputResult = {
  value: string;
  cancelled: boolean;
};

export async function readInput(): Promise<InputResult> {
  return new Promise((resolve) => {
    let input = "";
    let cursorPos = 0;
    let selectedIndex = 0;
    let showingSuggestions = false;
    let filteredCommands: typeof commands = [];

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();

    const clearSuggestions = () => {
      if (showingSuggestions && filteredCommands.length > 0) {
        process.stdout.write(`\x1b[${filteredCommands.length}A`);
        for (let i = 0; i < filteredCommands.length; i++) {
          process.stdout.write("\x1b[2K\x1b[1B");
        }
        process.stdout.write(`\x1b[${filteredCommands.length}A`);
      }
    };

    const renderSuggestions = () => {
      filteredCommands = input.startsWith("/")
        ? commands.filter((cmd) =>
            cmd.name.toLowerCase().startsWith(input.toLowerCase())
          )
        : [];

      if (filteredCommands.length === 0) {
        showingSuggestions = false;
        return;
      }

      showingSuggestions = true;
      process.stdout.write("\n");

      for (let i = 0; i < filteredCommands.length; i++) {
        const cmd = filteredCommands[i]!;
        const prefix = i === selectedIndex ? "> " : "  ";
        const highlight = i === selectedIndex ? "\x1b[7m" : "";
        const reset = i === selectedIndex ? "\x1b[0m" : "";
        process.stdout.write(
          `\x1b[2K${prefix}${highlight}${cmd.name}${reset}  ${cmd.description}\n`
        );
      }

      process.stdout.write(`\x1b[${filteredCommands.length + 1}A`);
      process.stdout.write(`\x1b[${PROMPT.length + cursorPos}G`);
    };

    const redrawLine = () => {
      process.stdout.write(`\r\x1b[2K${PROMPT}${input}`);
      process.stdout.write(`\x1b[${PROMPT.length + cursorPos + 1}G`);
    };

    const cleanup = () => {
      clearSuggestions();
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      rl.close();
    };

    process.stdout.write(PROMPT);

    process.stdin.on("data", (key: Buffer) => {
      const char = key.toString();

      if (char === "\x03") {
        cleanup();
        process.stdout.write("\n");
        resolve({ value: "", cancelled: true });
        return;
      }

      if (char === "\r" || char === "\n") {
        if (showingSuggestions && filteredCommands.length > 0) {
          clearSuggestions();
          input = filteredCommands[selectedIndex]!.name;
          cursorPos = input.length;
          showingSuggestions = false;
          selectedIndex = 0;
          filteredCommands = [];
          redrawLine();
        } else {
          cleanup();
          process.stdout.write("\n");
          resolve({ value: input, cancelled: false });
        }
        return;
      }

      if (char === "\x1b[A") {
        if (showingSuggestions && filteredCommands.length > 0) {
          clearSuggestions();
          selectedIndex =
            (selectedIndex - 1 + filteredCommands.length) %
            filteredCommands.length;
          renderSuggestions();
        }
        return;
      }

      if (char === "\x1b[B") {
        if (showingSuggestions && filteredCommands.length > 0) {
          clearSuggestions();
          selectedIndex = (selectedIndex + 1) % filteredCommands.length;
          renderSuggestions();
        }
        return;
      }

      if (char === "\x1b") {
        if (showingSuggestions) {
          clearSuggestions();
          showingSuggestions = false;
          selectedIndex = 0;
          filteredCommands = [];
          redrawLine();
        }
        return;
      }

      if (char === "\x7f" || char === "\b") {
        if (cursorPos > 0) {
          clearSuggestions();
          input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
          cursorPos--;
          selectedIndex = 0;
          redrawLine();
          renderSuggestions();
        }
        return;
      }

      if (char >= " " && char <= "~") {
        clearSuggestions();
        input = input.slice(0, cursorPos) + char + input.slice(cursorPos);
        cursorPos++;
        selectedIndex = 0;
        redrawLine();
        renderSuggestions();
        return;
      }
    });
  });
}
