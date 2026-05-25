import * as fs from "fs";
import * as path from "path";
import { chat } from "./chat";

const SUPPORTED_EXTENSIONS = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".java", ".c", ".cpp",
  ".h", ".cs", ".rb", ".php", ".swift", ".kt", ".scala", ".sql", ".sh",
]);

const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", "__pycache__",
  ".cache", "coverage", ".turbo", "out",
]);

interface FifOptions {
  filePath: string;
  model: string;
  apiKey?: string;
}

function readFileSafe(filePath: string): string | null {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 100_000) return null; // skip files > 100KB
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function collectFiles(target: string): string[] {
  const stat = fs.statSync(target);
  if (stat.isFile()) return [target];

  const results: string[] = [];
  function walk(dir: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (IGNORE_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile() && SUPPORTED_EXTENSIONS.has(path.extname(entry.name))) {
        results.push(full);
      }
    }
  }
  walk(target);
  return results.slice(0, 20); // cap at 20 files to avoid token limits
}

export async function fif(opts: FifOptions): Promise<void> {
  const { filePath, model, apiKey } = opts;
  const absPath = path.resolve(filePath);

  if (!fs.existsSync(absPath)) {
    console.error(`Path not found: ${absPath}`);
    process.exit(1);
  }

  const files = collectFiles(absPath);
  if (files.length === 0) {
    console.error("No supported source files found.");
    process.exit(1);
  }

  console.log(`\n🔍 Spork FIF — scanning ${files.length} file(s)...\n`);

  const codeBlocks = files
    .map((f) => {
      const content = readFileSafe(f);
      if (!content) return null;
      const rel = path.relative(process.cwd(), f);
      return `### ${rel}\n\`\`\`${path.extname(f).slice(1)}\n${content}\n\`\`\``;
    })
    .filter(Boolean)
    .join("\n\n");

  const prompt = `You are a senior software engineer doing a code review. Your task is to Find, Identify, and Fix bugs.

Analyze the following code and produce a structured bug report:

1. List each bug found with:
   - File and approximate line number
   - Severity: CRITICAL / HIGH / MEDIUM / LOW
   - What the bug is
   - The fix (show the corrected code snippet)

2. If no bugs found, say so clearly.

Be precise. Focus on real bugs: race conditions, null pointer risks, missing error handling, type errors, security issues, logic errors. Do NOT flag style preferences.

---

${codeBlocks}`;

  await chat({ prompt, model, apiKey, stream: true });
}
