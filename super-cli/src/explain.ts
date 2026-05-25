import * as fs from "fs";
import * as path from "path";
import { streamCompletion, loadConfig } from "./agent";

interface ExplainOptions {
  file: string;
}

export async function explain(opts: ExplainOptions): Promise<void> {
  const cfg = loadConfig();
  const model = cfg.model ?? "anthropic/claude-sonnet-4-6";
  const apiKey = cfg.apiKey ?? process.env.OPENROUTER_API_KEY ?? "";

  if (!apiKey) {
    console.error("No API key configured.");
    process.exit(1);
  }

  const absPath = path.resolve(opts.file);
  if (!fs.existsSync(absPath)) {
    console.error(`File not found: ${absPath}`);
    process.exit(1);
  }

  let content: string;
  try {
    content = fs.readFileSync(absPath, "utf8");
  } catch (e) {
    console.error(`Cannot read file: ${e}`);
    process.exit(1);
  }

  console.log(`\n✦ Super Explain: ${opts.file}\n`);
  console.log("─".repeat(60));

  await streamCompletion({
    model,
    messages: [
      {
        role: "system",
        content: `You are an expert at explaining code clearly. Your explanation should cover:
1. What this file/module does (1-2 sentences)
2. Key functions/classes and what they do
3. Important patterns or architectural decisions
4. Any non-obvious behaviors or gotchas
Keep it practical and concise — this is for a developer who needs to work with this code.`,
      },
      {
        role: "user",
        content: `Explain this file (${path.basename(absPath)}):\n\n\`\`\`${path.extname(absPath).slice(1)}\n${content}\n\`\`\``,
      },
    ],
    apiKey,
    onChunk: (text) => process.stdout.write(text),
  });

  console.log("\n" + "─".repeat(60));
}
