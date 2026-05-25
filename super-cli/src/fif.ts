import * as fs from "fs";
import * as path from "path";
import { streamCompletion, loadConfig } from "./agent";

const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "__pycache__", "coverage",
]);
const CODE_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java",
  ".c", ".cpp", ".cs", ".rb", ".php", ".sql", ".sh",
]);

function collectFiles(target: string): string[] {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];
  const results: string[] = [];
  function walk(dir: string) {
    let entries: fs.Dirent[];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
    catch { return; }
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile() && CODE_EXTENSIONS.has(path.extname(entry.name))) {
        results.push(full);
      }
    }
  }
  walk(target);
  return results.slice(0, 25);
}

interface FifOptions {
  filePath: string;
  model?: string;
  apply: boolean;
}

export async function fif(opts: FifOptions): Promise<void> {
  const { filePath, apply } = opts;
  const cfg = loadConfig();
  const model = opts.model ?? cfg.model ?? "anthropic/claude-sonnet-4-6";
  const apiKey = cfg.apiKey ?? process.env.OPENROUTER_API_KEY ?? "";

  if (!apiKey) {
    console.error("No API key configured. Run `super config`.");
    process.exit(1);
  }

  const absPath = path.resolve(filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`Path not found: ${absPath}`);
    process.exit(1);
  }

  const files = collectFiles(absPath);
  console.log(`\n✦ Super FIF — auditing ${files.length} file(s)...\n`);

  const codeBlocks = files
    .map((f) => {
      try {
        const content = fs.readFileSync(f, "utf8");
        if (content.length > 50_000) return null;
        return `### ${path.relative(process.cwd(), f)}\n\`\`\`${path.extname(f).slice(1)}\n${content}\n\`\`\``;
      } catch { return null; }
    })
    .filter(Boolean)
    .join("\n\n");

  const systemPrompt = `You are an elite senior engineer. Your job is to find real bugs — not style issues, not preferences — BUGS.

${apply ? `For each bug found, provide the fix in a <file path="..."> block with the COMPLETE corrected file content.` : "Report bugs with severity, location, and the fix code snippet."}

Severities: CRITICAL (data loss / security / crash) | HIGH (wrong behavior) | MEDIUM (edge case) | LOW (minor)`;

  const userPrompt = `Find, Identify, and Fix all bugs in this code:\n\n${codeBlocks}`;

  console.log("─".repeat(60));
  let fullResponse = "";
  await streamCompletion({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    apiKey,
    onChunk: (text) => {
      process.stdout.write(text);
      fullResponse += text;
    },
  });
  console.log("\n" + "─".repeat(60));

  if (apply) {
    const fileRegex = /<file path="([^"]+)">([\s\S]*?)<\/file>/g;
    let match;
    let count = 0;
    const cwd = process.cwd();
    while ((match = fileRegex.exec(fullResponse)) !== null) {
      const [, filePath, content] = match;
      const abs = path.resolve(cwd, filePath);
      if (!abs.startsWith(cwd)) continue;
      fs.writeFileSync(abs, content.trim() + "\n");
      console.log(`\n✓ Fixed: ${filePath}`);
      count++;
    }
    if (count > 0) console.log(`\n✦ Applied ${count} fix(es).`);
  }
}
