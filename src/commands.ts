import select from "@inquirer/select";

export type Command = {
  name: string;
  description: string;
};

export const commands: Command[] = [
  { name: "/clear", description: "Clear session history" },
  { name: "/help", description: "Show available commands" },
  { name: "/exit", description: "Save session and exit" },
];

export async function pickCommand(): Promise<string | null> {
  try {
    const choice = await select({
      message: "Select a command",
      choices: commands.map((cmd) => ({
        name: `${cmd.name}  ${cmd.description}`,
        value: cmd.name,
      })),
    });
    return choice;
  } catch {
    return null;
  }
}

export function showCommands(): void {
  console.log("\nAvailable commands:");
  for (const cmd of commands) {
    console.log(`  ${cmd.name.padEnd(10)} ${cmd.description}`);
  }
  console.log("");
}

export function isCommandPrefix(input: string): boolean {
  return input === "/";
}
