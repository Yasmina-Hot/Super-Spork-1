#!/usr/bin/env node
import { program } from "commander";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { chat } from "./chat";
import { fif } from "./fif";

const CONFIG_PATH = path.join(os.homedir(), ".spork", "config.json");

interface Config {
  apiKey?: string;
  model?: string;
  agent?: string;
}

function loadConfig(): Config {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    }
  } catch {}
  return {};
}

function saveConfig(config: Config): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

program
  .name("spork")
  .description("Spork CLI — fast, minimal AI in your terminal")
  .version("0.1.0");

program
  .argument("[prompt]", "Message to send to Spork")
  .option("-m, --model <id>", "Model to use (default: openai/gpt-oss-120b:free)")
  .option("-a, --agent <id>", "Agent persona to use")
  .option("--no-stream", "Disable streaming output")
  .action(async (prompt: string | undefined, opts: { model?: string; agent?: string; stream: boolean }) => {
    const config = loadConfig();

    // Read from stdin if no prompt given
    let finalPrompt = prompt;
    if (!finalPrompt) {
      if (process.stdin.isTTY) {
        console.error("Usage: spork <prompt>  or  cat file.txt | spork <prompt>");
        process.exit(1);
      }
      const stdin = fs.readFileSync("/dev/stdin", "utf8").trim();
      if (!stdin) {
        console.error("No input provided.");
        process.exit(1);
      }
      finalPrompt = stdin;
    }

    await chat({
      prompt: finalPrompt,
      model: opts.model ?? config.model ?? "openai/gpt-oss-120b:free",
      agentId: opts.agent ?? config.agent,
      apiKey: config.apiKey,
      stream: opts.stream,
    });
  });

program
  .command("fif [path]")
  .description("Find, Identify + Fix — audit a file or directory for bugs")
  .option("-m, --model <id>", "Model to use")
  .action(async (filePath: string | undefined, opts: { model?: string }) => {
    const config = loadConfig();
    await fif({
      filePath: filePath ?? ".",
      model: opts.model ?? config.model ?? "openai/gpt-oss-120b:free",
      apiKey: config.apiKey,
    });
  });

program
  .command("code <prompt>")
  .description("Code mode — generate code with syntax highlighting")
  .option("-m, --model <id>", "Model to use")
  .action(async (prompt: string, opts: { model?: string }) => {
    const config = loadConfig();
    await chat({
      prompt: `You are an expert coding assistant. Respond with clean, working code and brief explanations.\n\n${prompt}`,
      model: opts.model ?? config.model ?? "openai/gpt-oss-120b:free",
      apiKey: config.apiKey,
      stream: true,
    });
  });

program
  .command("login <api-key>")
  .description("Save your OpenRouter API key for higher rate limits")
  .action((apiKey: string) => {
    const config = loadConfig();
    config.apiKey = apiKey;
    saveConfig(config);
    console.log("✓ API key saved to ~/.spork/config.json");
  });

program
  .command("config")
  .description("Show current configuration")
  .action(() => {
    const config = loadConfig();
    if (Object.keys(config).length === 0) {
      console.log("No config found. Using defaults.");
    } else {
      console.log(JSON.stringify({
        ...config,
        apiKey: config.apiKey ? `${config.apiKey.slice(0, 8)}...` : undefined,
      }, null, 2));
    }
  });

program.parse();
