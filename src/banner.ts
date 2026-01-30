const BANNER = `
   _____ _____ _   _ 
  / ____/ ____| | | |
 | |   | (___ | |_| |
 | |    \\___ \\|  _  |
 | |___ ____) | | | |
  \\____|_____/|_| |_|
`;

export function showBanner(): void {
  process.stdout.write(BANNER);
  console.log("  Research & Prompt CLI\n");
}
