import chalk from "chalk";

const brave_search_api = process.env.BRAVE_SEARCH_API_KEY;

export type WebSearchArgs = {
  query: string;
};

export type ToolCall = {
  name: string;
  arguments: WebSearchArgs;
};

export function hasToolCall(output: string): boolean {
  return output.includes("<tool_call>");
}

export function selectToolCallString(output: string): string {
  let opening_tool_call_tag = "<tool_call>";
  let closing_tool_call_tag = "</tool_call>";
  let firstOccurrence = output.indexOf(opening_tool_call_tag);
  let secondOccurrence = output.indexOf(closing_tool_call_tag);
  let tool_call = output.substring(
    firstOccurrence + opening_tool_call_tag.length,
    secondOccurrence === -1 ? output.length : secondOccurrence,
  );
  return tool_call;
}

export async function webSearch(query: string): Promise<string> {
  const url = "https://api.search.brave.com/res/v1/web/search";
  const headers = {
    Accept: "application/json",
    "Accept-Encoding": "gzip",
    "X-Subscription-Token": brave_search_api,
  };

  const response = await fetch(url + "?q=" + encodeURIComponent(query), {
    headers: headers,
  });
  const parsed_response = await response.json();
  let results_string = "";
  for (const result of parsed_response.web.results) {
    results_string += result.title + " - " + result.description;
  }

  return results_string;
}

export async function executeTool(
  tool_name: string,
  args: WebSearchArgs,
): Promise<string> {
  let dots = 0;
  const frames = [".", "..", "..."];

  const interval = setInterval(() => {
    process.stdout.write(
      `\r${chalk.gray.italic("tool calling" + frames[dots % 3])}   `,
    );
    dots++;
  }, 300);

  try {
    switch (tool_name) {
      case "web_search":
        const result = await webSearch(args.query);
        clearInterval(interval);
        process.stdout.write("\r\x1b[K");
        return result;
      default:
        clearInterval(interval);
        process.stdout.write("\r\x1b[K");
        return "Unknown tool call.";
    }
  } catch (e) {
    clearInterval(interval);
    process.stdout.write("\r\x1b[K");
    throw e;
  }
}
