import { loadConfig, saveConfig } from "./agent";
import * as readline from "readline";

export function config(): void {
  const cfg = loadConfig();

  console.log("\n✦ Super CLI Configuration\n");
  console.log("Current config:");
  console.log(JSON.stringify({
    ...cfg,
    apiKey: cfg.apiKey ? `${cfg.apiKey.slice(0, 8)}...` : "(not set)",
  }, null, 2));

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  rl.question("\nEnter OpenRouter API key (press Enter to skip): ", (key) => {
    if (key.trim()) {
      saveConfig({ apiKey: key.trim() });
      console.log("✓ API key saved.");
    }

    rl.question("Default model (press Enter for claude-sonnet-4-6): ", (model) => {
      if (model.trim()) {
        saveConfig({ model: model.trim() });
        console.log(`✓ Default model set to: ${model.trim()}`);
      }
      rl.close();
    });
  });
}
