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
    let menuActive = false;

    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const shouldShowMenu = () => input === "/";

    const renderMenu = () => {
      process.stdout.write("\x1b[s");
      
      for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i]!;
        process.stdout.write("\n\x1b[2K");
        if (i === selectedIndex) {
          process.stdout.write(`\x1b[48;5;236m> ${cmd.name}  ${cmd.description}\x1b[0m`);
        } else {
          process.stdout.write(`\x1b[48;5;236m  ${cmd.name}  ${cmd.description}\x1b[0m`);
        }
      }
      
      process.stdout.write("\x1b[u");
    };

    const clearMenu = () => {
      process.stdout.write("\x1b[s");
      for (let i = 0; i < commands.length; i++) {
        process.stdout.write("\n\x1b[2K");
      }
      process.stdout.write("\x1b[u");
    };

    const redrawInput = () => {
      process.stdout.write(`\r\x1b[2K${PROMPT}${input}`);
    };

    const cleanup = () => {
      if (menuActive) {
        clearMenu();
        menuActive = false;
      }
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
        if (menuActive) {
          clearMenu();
          const selected = commands[selectedIndex]!;
          input = selected.name;
          menuActive = false;
          cleanup();
          process.stdout.write(`\r\x1b[2K${PROMPT}${input}\n`);
          resolve({ value: input, cancelled: false });
        } else {
          cleanup();
          process.stdout.write("\n");
          resolve({ value: input, cancelled: false });
        }
        return;
      }

      if (menuActive) {
        if (key === "\x1b[A") {
          clearMenu();
          selectedIndex = (selectedIndex - 1 + commands.length) % commands.length;
          renderMenu();
          return;
        }

        if (key === "\x1b[B") {
          clearMenu();
          selectedIndex = (selectedIndex + 1) % commands.length;
          renderMenu();
          return;
        }

        if (key === "\x1b" || key === "\x7f" || key === "\b") {
          clearMenu();
          menuActive = false;
          input = "";
          cursorPos = 0;
          selectedIndex = 0;
          redrawInput();
          return;
        }

        return;
      }

      if (key === "\x7f" || key === "\b") {
        if (cursorPos > 0) {
          input = input.slice(0, cursorPos - 1) + input.slice(cursorPos);
          cursorPos--;
          redrawInput();
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
        redrawInput();
        process.stdout.write(`\r\x1b[${PROMPT.length + cursorPos}C`);

        if (shouldShowMenu()) {
          menuActive = true;
          selectedIndex = 0;
          renderMenu();
        }
        return;
      }
    };

    process.stdout.write(PROMPT);
    process.stdin.on("data", onData);
  });
}
