# csh

A minimalist CLI for research, web search, information gathering, task planning, and prompt generation.

## Installation

```bash
bun install
```

## Usage

```bash
bun run index.ts
```

### Commands

- `/clear` - Clear session history
- `/help` - Show available commands
- `/exit` - Save session and exit

## Configuration

Set your Gemini API key as an environment variable:

```bash
export GEMINI_API_KEY="your-api-key"
```

Sessions are saved to `~/.csh/sessions/`.
