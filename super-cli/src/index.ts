#!/usr/bin/env node
/**
 * Super CLI — Agentic coding agent for Super Spork subscribers.
 * Unlike Spork CLI (Q&A/chat), Super operates on your entire project:
 * reads files, edits code, runs git, tracks budget, persists memory.
 */
import { program } from "commander";
import { run } from "./run";
import { fif } from "./fif";
import { memory } from "./memory";
import { review } from "./review";
import { scan } from "./scan";
import { config } from "./config";

program
  .name("super")
  .description("Super CLI — agentic AI coding agent. Requires Super Spork subscription.")
  .version("0.1.0");

program
  .command("run <task>")
  .description("Execute an agentic coding task across your project files")
  .option("-b, --budget <dollars>", "Max spend in USD (e.g. --budget 2)", "5")
  .option("-m, --model <id>", "Model to use", "anthropic/claude-opus-4:thinking")
  .option("--dry-run", "Preview the plan without making changes")
  .action(async (task: string, opts: { budget: string; model: string; dryRun: boolean }) => {
    await run({ task, budgetUsd: parseFloat(opts.budget), model: opts.model, dryRun: opts.dryRun });
  });

program
  .command("fif [path]")
  .description("Full project bug audit — Find, Identify + Fix")
  .option("-m, --model <id>", "Model to use")
  .option("--apply", "Automatically apply suggested fixes")
  .action(async (filePath: string | undefined, opts: { model?: string; apply: boolean }) => {
    await fif({ filePath: filePath ?? ".", model: opts.model, apply: opts.apply });
  });

program
  .command("review")
  .description("Full code review of staged/unstaged changes vs main branch")
  .option("-m, --model <id>", "Model to use")
  .action(async (opts: { model?: string }) => {
    await review({ model: opts.model });
  });

program
  .command("scan [path]")
  .description("Security scan (SAST) on your codebase")
  .action(async (filePath: string | undefined) => {
    await scan({ filePath: filePath ?? "." });
  });

program
  .command("memory")
  .description("Manage Super's project memory")
  .addCommand(
    program
      .createCommand("show")
      .description("Show all project memories")
      .action(() => memory.show())
  )
  .addCommand(
    program
      .createCommand("add")
      .argument("<fact>", "Fact to remember about this project")
      .action((fact: string) => memory.add(fact))
  )
  .addCommand(
    program
      .createCommand("clear")
      .description("Clear all project memories")
      .action(() => memory.clear())
  );

program
  .command("explain <file>")
  .description("Explain what a file does")
  .action(async (file: string) => {
    const { explain } = await import("./explain");
    await explain({ file });
  });

program
  .command("config")
  .description("Show or set configuration")
  .action(config);

program.parse();
