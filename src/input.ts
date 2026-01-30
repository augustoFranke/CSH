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
    let suggestionsVisible = false;
    let lastSuggestionCount = 0;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const getFilteredCommands = () => {
      if (!input.startsWith("/")) return [];
      return commands.filter((cmd) =>
        cmd.name.toLowerCase().startsWith(input.toLowerCase())
      );
    };

    const clearSuggestions = () => {
      if (lastSuggestionCount > 0) {
        process.stdout.write("\x1b[s");
        process.stdout.write("\n");
        for (let i = 0; i < lastSuggestionCount; i++) {
          process.stdout.write("\x1b[2K");
          if (i < lastSuggestionCount - 1) {
            process.stdout.write("\n");
          }
        }
        process.stdout.write("\x1b[u");
        lastSuggestionCount = 0;
      }
    };

    const render = () => {
      clearSuggestions();

      process.stdout.write(`\r\x1b[2K${PROMPT}${input}`);

      const filtered = getFilteredCommands();

      if (filtered.length > 0 && input.length > 0) {
        suggestionsVisible = true;
        lastSuggestionCount = filtered.length;

        if (selectedIndex >= filtered.length) {
          selectedIndex = filtered.length - 1;
        }

        process.stdout.write("\x1b[s");

        for (let i = 0; i < filtered.length; i++) {
          const cmd = filtered[i]!;
          process.stdout.write("\n\x1b[2K");
          if (i === selectedIndex) {
            process.stdout.write(`\x1b[7m> ${cmd.name}\x1b[0m  ${cmd.description}`);
          } else {
            process.stdout.write(`  ${cmd.name}  ${cmd.description}`);
          }
        }

        process.stdout.write("\x1b[u");
      } else {
        suggestionsVisible = false;
      }

      process.stdout.write(`\r\x1b[${PROMPT.length + cursorPos}C`);
    };

    const cleanup = () => {
      clearSuggestions();
      process.stdin.removeListener("data", onData);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
    };

    const onData = (key: string) => {
      if (key === "\x03") {
        cleanup();
        process.stdout.write("\n");
        resolve({ value: "", cancelled: true });
        return;
      }

      if (key === "\r" || key === "\n") {
        const filtered = getFilteredCommands();
        if (suggestionsVisible && filtered.length > 0) {
          input = filtered[selectedIndex]!.name;
          cursorPos = input.length;
          selectedIndex = 0;
          suggestionsVisible = false;
          render();
        } else {
          cleanup();
          process.stdout.write("\n");
          resolve({ value: input, cancelled: false });
        }
        return;
      }

      if (key === "\x1b[A") {
        if (suggestionsVisible) {
          const filtered = getFilteredCommands();
          if (filtered.length > 0) {
            selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
            render();
          }
        }
        return;
      }

      if (key === "\x1b[B") {
        if (suggestionsVisible) {
          const filtered = getFilteredCommands();
          if (filtered.length > 0) {
            selectedIndex = (selectedIndex + 1) % filtered.length;
            render();
          }
        }
        return;
      }

      if (key === "\x1b") {
        if (suggestionsVisible) {
          suggestionsVisible = false;
          selectedIndex = 0;
          render();
        }
        return;
      }

      if (key === "\x7f" || key === "\b") {
        if (cursorPos > 0) {
          input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
          cursorPos--;
          selectedIndex = 0;
          render();
        }
        return;
      }

      if (key === "\x1b[D") {
        if (cursorPos > 0) {
          cursorPos--;
          render();
        }
        return;
      }

      if (key === "\x1b[C") {
        if (cursorPos < input.length) {
          cursorPos++;
          render();
        }
        return;
      }

      if (key >= " " && key <= "~") {
        input = input.slice(0, cursorPos) + key + input.slice(cursorPos);
        cursorPos++;
        selectedIndex = 0;
        render();
        return;
      }
    };

    process.stdout.write(PROMPT);
    process.stdin.on("data", onData);
  });
}
