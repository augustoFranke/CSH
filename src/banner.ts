import figlet from "figlet";

export function showBanner(): void {
  const banner = figlet.textSync("CSH", {
    font: "ANSI Shadow",
  });
  console.log(`\x1b[97m${banner}\x1b[0m`);
  console.log("  Research & Prompt CLI\n");
}
