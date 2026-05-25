/**
 * Core agent: sends requests to OpenRouter and streams back the response.
 * Handles budget tracking via token estimation.
 */
import * as https from "https";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

const CONFIG_PATH = path.join(os.homedir(), ".spork", "super-config.json");

interface AgentConfig {
  apiKey?: string;
  model?: string;
}

export function loadConfig(): AgentConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    }
  } catch {}
  return {};
}

export function saveConfig(cfg: Partial<AgentConfig>): void {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const existing = loadConfig();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...existing, ...cfg }, null, 2));
}

// Rough token estimation: ~4 chars per token
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Cost per 1k tokens (rough estimates)
const MODEL_COSTS: Record<string, { input: number; output: number }> = {
  "anthropic/claude-opus-4:thinking": { input: 0.015, output: 0.075 },
  "anthropic/claude-sonnet-4-6": { input: 0.003, output: 0.015 },
  "openai/gpt-4o": { input: 0.005, output: 0.015 },
  "openai/gpt-oss-120b:free": { input: 0, output: 0 },
};

export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model] ?? { input: 0.005, output: 0.015 };
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
}

interface StreamOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  apiKey: string;
  onChunk?: (text: string) => void;
  budgetUsd?: number;
  inputTokensEstimate?: number;
}

export async function streamCompletion(opts: StreamOptions): Promise<string> {
  const { model, messages, apiKey, onChunk, budgetUsd, inputTokensEstimate = 0 } = opts;

  const costs = MODEL_COSTS[model] ?? { input: 0.005, output: 0.015 };
  const inputCost = (inputTokensEstimate / 1000) * costs.input;
  const remainingBudget = (budgetUsd ?? Infinity) - inputCost;

  if (remainingBudget <= 0) {
    throw new Error(
      `Budget exhausted. Estimated input alone costs $${inputCost.toFixed(4)} but budget is $${budgetUsd}`
    );
  }

  const body = JSON.stringify({ model, messages, stream: true });

  return new Promise((resolve, reject) => {
    let fullText = "";

    const req = https.request(
      {
        hostname: "openrouter.ai",
        path: "/api/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://spork.ai",
          "X-Title": "Super CLI",
        },
      },
      (res) => {
        let buffer = "";
        res.on("data", (chunk: Buffer) => {
          buffer += chunk.toString();
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;
            if (trimmed.startsWith("data: ")) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                const delta = json.choices?.[0]?.delta?.content;
                if (delta) {
                  fullText += delta;
                  onChunk?.(delta);

                  // Budget check: stop if output cost exceeds remaining budget
                  if (budgetUsd !== undefined) {
                    const outputTokens = estimateTokens(fullText);
                    const outputCost = (outputTokens / 1000) * costs.output;
                    if (inputCost + outputCost > budgetUsd) {
                      process.stdout.write(
                        `\n\n[Budget limit of $${budgetUsd} reached. Response truncated.]\n`
                      );
                      req.destroy();
                      resolve(fullText);
                      return;
                    }
                  }
                }
              } catch {}
            }
          }
        });
        res.on("end", () => resolve(fullText));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
