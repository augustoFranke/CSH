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
    let menuVisible = false;
    let lastMenuHeight = 0;

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

    const clearMenu = () => {
      if (lastMenuHeight > 0) {
        process.stdout.write("\x1b[s");
        for (let i = 0; i < lastMenuHeight; i++) {
          process.stdout.write("\n\x1b[2K");
        }
        process.stdout.write("\x1b[u");
        lastMenuHeight = 0;
      }
    };

    const renderMenu = () => {
      const filtered = getFilteredCommands();
      
      clearMenu();

      if (filtered.length === 0) {
        menuVisible = false;
        return;
      }

      menuVisible = true;
      lastMenuHeight = filtered.length;

      if (selectedIndex >= filtered.length) {
        selectedIndex = filtered.length - 1;
      }

      process.stdout.write("\x1b[s");

      for (let i = 0; i < filtered.length; i++) {
        const cmd = filtered[i]!;
        process.stdout.write("\n\x1b[2K");
        if (i === selectedIndex) {
          process.stdout.write(`\x1b[48;5;236m> ${cmd.name}  ${cmd.description}\x1b[0m`);
        } else {
          process.stdout.write(`\x1b[48;5;236m  ${cmd.name}  ${cmd.description}\x1b[0m`);
        }
      }

      process.stdout.write("\x1b[u");
    };

    const redrawInput = () => {
      process.stdout.write(`\r\x1b[2K${PROMPT}${input}`);
      process.stdout.write(`\r\x1b[${PROMPT.length + cursorPos}C`);
    };

    const cleanup = () => {
      clearMenu();
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
        if (menuVisible && filtered.length > 0 && filtered[selectedIndex]) {
          input = filtered[selectedIndex]!.name;
        }
        cleanup();
        process.stdout.write(`\r\x1b[2K${PROMPT}${input}\n`);
        resolve({ value: input, cancelled: false });
        return;
      }

      if (key === "\x1b[A") {
        if (menuVisible) {
          const filtered = getFilteredCommands();
          if (filtered.length > 0) {
            clearMenu();
            selectedIndex = (selectedIndex - 1 + filtered.length) % filtered.length;
            renderMenu();
          }
        }
        return;
      }

      if (key === "\x1b[B") {
        if (menuVisible) {
          const filtered = getFilteredCommands();
          if (filtered.length > 0) {
            clearMenu();
            selectedIndex = (selectedIndex + 1) % filtered.length;
            renderMenu();
          }
        }
        return;
      }

      if (key === "\x1b") {
        if (menuVisible) {
          clearMenu();
          menuVisible = false;
        }
        return;
      }

      if (key === "\x7f" || key === "\b") {
        if (cursorPos > 0) {
          input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
          cursorPos--;
          selectedIndex = 0;
          redrawInput();
          if (input.startsWith("/")) {
            renderMenu();
          } else {
            clearMenu();
            menuVisible = false;
          }
        }
        return;
      }

      if (key === "\x1b[D") {
        if (cursorPos > 0) {
          cursorPos--;
          process.stdout.write("\x1b[D");
        }
        return;
      }

      if (key === "\x1b[C") {
        if (cursorPos < input.length) {
          cursorPos++;
          process.stdout.write("\x1b[C");
        }
        return;
      }

      if (key >= " " && key <= "~") {
        input = input.slice(0, cursorPos) + key + input.slice(cursorPos);
        cursorPos++;
        selectedIndex = 0;
        redrawInput();

        if (input.startsWith("/")) {
          renderMenu();
        } else {
          clearMenu();
          menuVisible = false;
        }
        return;
      }
    };

    process.stdout.write(PROMPT);
    process.stdin.on("data", onData);
  });
}
