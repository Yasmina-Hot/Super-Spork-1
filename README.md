# SPORK

> The AI platform that doesn't take itself too seriously — but takes your work seriously.

Spork is a tiered AI chat and tools platform built on the Grok-inspired dark aesthetic. Free users get generous access to powerful open models. Paid Super Spork users unlock the full product family.

---

## Product Family

| Product | Tier | What it does |
|---|---|---|
| **Spork** | Free | AI chat with 3 open-weight models, 4,000 msg/day |
| **Super Spork** | Paid ($20/mo) | Unlimited chat with all frontier models + all features |
| **Spork Code** | Super | Monaco editor + AI coding assistant in browser |
| **Spork Canvas** | Super | AI-generated live artifacts — HTML, docs, code previewed in real time |
| **Spork Voice** | Free+ | Push-to-talk AI, hands-free, reads responses aloud |
| **Spork Agents** | Free+Super | 15 AI personas: Hacker, Cockroach, Seducia, Oracle and more |
| **Spork Hub** | Free+ | Community prompt library — discover, save, share prompts |
| **Spork Memory** | Super | Persistent facts Spork remembers across every conversation |
| **Spork CLI** | Free | Terminal chat tool — pipe-friendly, zero config required |
| **Super CLI** | Super | Agentic coding agent — reads your codebase, edits files, tracks budget |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon or Supabase recommended — both have free tiers)
- [Clerk](https://clerk.com) account (auth)
- [OpenRouter](https://openrouter.ai) API key (AI models)
- [Stripe](https://stripe.com) account (payments — optional for local dev)

### 1. Clone and install

```bash
git clone https://github.com/your-username/super-spork
cd super-spork
npm install
```

### 2. Environment variables

Create `.env` from the example and fill in your keys:

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk (get from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# OpenRouter (get from openrouter.ai/keys)
OPENROUTER_API_KEY=sk-or-...

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database setup

```bash
# Create tables
npx prisma migrate dev --name init

# (Optional) view your data in a browser GUI
npx prisma studio
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Configure webhooks (for auth + payments)

**Clerk webhook** — handles user creation/deletion:
- Go to Clerk Dashboard → Webhooks → Add endpoint
- URL: `https://your-domain/api/webhooks/clerk`
- Events: `user.created`, `user.deleted`

**Stripe webhook** — handles subscription upgrades:
- Go to Stripe Dashboard → Webhooks → Add endpoint
- URL: `https://your-domain/api/webhooks/stripe`
- Events: `checkout.session.completed`, `customer.subscription.deleted`

---

## Product Guide

### Spork (Free Chat)

**Use cases:** General Q&A, writing, coding help, research, brainstorming.

Free users get:
- 4,000 messages/day (resets at midnight)
- 3 powerful open-weight models (see below)
- 8 free AI agent personas
- Public feed, conversation sharing, prompt Hub

**Free models:**

| Model | Context | Best for |
|---|---|---|
| GPT-OSS 120B | 128K | Complex reasoning, coding |
| GPT-OSS 20B | 64K | Fast everyday tasks |
| Nemotron 3 Super | 1M | Long documents, 1M context |

**Getting started:**
1. Sign up at `/sign-up`
2. Start a conversation from the home screen
3. Choose your model in the top bar
4. Pick an agent persona (optional) — Hacker is great for dev tasks

---

### Super Spork (Paid)

**Use cases:** Power users who need frontier models, unlimited messages, and advanced features.

Super Spork unlocks:
- Unlimited messages
- All frontier models (Claude Opus 4.7, GPT-4o, Gemini 2.5 Pro, Grok 3, and more)
- Spork Code, Spork Canvas, Spork Memory
- All 15 agent personas
- BYOK (Bring Your Own OpenRouter Key) — bypass all limits

**Paid models:**

| Model | Context | Best for |
|---|---|---|
| Claude Opus 4.7 | 200K | Deep reasoning, long tasks |
| Claude Sonnet 4.6 | 200K | Balanced speed + intelligence |
| GPT-4o | 128K | Multimodal, general flagship |
| GPT-4.1 | 1M | Latest OpenAI, 1M context |
| Gemini 2.5 Pro | 1M | Google's best, long context |
| Grok 3 | 131K | xAI frontier reasoning |

**Getting started:**
1. Go to `/settings` → click **Upgrade to Super Spork**
2. Complete Stripe checkout ($20/month)
3. Your tier upgrades instantly — refresh if needed

---

### Spork Agents

**Use cases:** Getting a different communication style, specialized personas, fun.

15 built-in personas, each with a distinct system prompt and personality:

**Free agents (all users):**
| Agent | Personality | Best for |
|---|---|---|
| 🧠 The Hacker | Blunt, terminal-native, no fluff | Dev tasks, debugging |
| 👨‍💻 The Dev | Practical, code-first | General coding |
| 👴 Senior Dev | Opinionated, battle-hardened | Code review, architecture |
| 🤓 The Nerd | Enthusiastic deep-diver | Explanations, learning |
| 🪳 Cockroach | Indestructible, scrappy | Adversarial thinking |
| 💑 I Need My Wife | Relatable, human, frustrated dev | Debugging frustration |
| 🔮 The Oracle | Wise, speaks in principles | Strategy, design patterns |
| 🦆 Rubber Duck | Patient, just listens and nudges | Problem articulation |

**Super Spork agents:**
| Agent | Personality | Best for |
|---|---|---|
| ⚡ Speed Demon | Fastest possible answer, no padding | Quick lookups |
| 🎓 The Professor | Academic depth, cites reasoning | Learning complex topics |
| 🪖 Drill Sergeant | Tough love, no excuses | Accountability, focus |
| 🏗️ The Architect | System design first, always | Architecture decisions |
| 🤨 The Skeptic | Questions everything | Assumptions, peer review |
| ✍️ Shakespeare | Eloquent, poetic | Writing, storytelling |
| 🌹 Seducia | Playful, curious (experimental) | Creative writing |

**Getting started:**
1. Open any conversation
2. Click the agent selector in the top bar
3. Pick a persona — the system prompt changes immediately

---

### Spork Fork (FIF — Fork In Fork)

**Use cases:** Continue a conversation with a different model mid-way through. Test how different models handle the same context. Explore alternative responses.

FIF = Fork In Fork. Branch any conversation to a new model, carrying the full message history.

**Getting started:**
1. Open any conversation
2. Click the **FIF** button in the top bar (fork icon)
3. Select the model you want to fork to
4. A new conversation opens with all previous messages, running on the new model

---

### Spork Code

**Use cases:** Code review, debugging, writing boilerplate, explaining unfamiliar codebases, pair programming in the browser.

Three modes:
- **Chat** — pure AI coding assistant
- **Editor** — Monaco editor (left) + AI chat (right), paste or write code
- **Inline** — code editor on top, AI on bottom

**Getting started (Super Spork):**
1. Navigate to `/code` in the sidebar
2. Choose your mode with the tabs at the top
3. In Editor mode: paste your code in the editor, ask questions in the chat panel
4. The AI automatically sees your code as context

---

### Spork Canvas

**Use cases:** Build interactive HTML demos, generate formatted reports, produce syntax-highlighted code artifacts, create live data visualizations.

Canvas creates AI-generated *artifacts* — rendered live in a preview pane. The AI always outputs a `<artifact type="html|markdown|code">` that you see rendered instantly.

**Artifact types:**
- `html` — rendered live in an iframe sandbox (can run JavaScript)
- `markdown` — formatted document with full GFM support
- `code` — syntax-highlighted code block

**Getting started (Super Spork):**
1. Navigate to `/canvas` in the sidebar
2. Describe what you want: *"Build me a landing page for a SaaS startup"* or *"Create an interactive CSS gradient explorer"*
3. The artifact appears in the right pane as it streams
4. Continue chatting to refine — every response replaces the canvas with the updated artifact
5. Use the copy button to grab the content, or refresh the iframe preview

**Starter prompts:**
```
Build me a beautiful landing page for a startup that sells dog food
Create an interactive todo app with local storage
Write a markdown report: history of programming languages
Generate a CSS animation playground
```

---

### Spork Voice

**Use cases:** Hands-free AI when you're coding, cooking, driving, working out. Accessibility. Testing prompts while away from keyboard.

Push-to-talk interface with live speech recognition and text-to-speech responses. Works in Chrome and Edge.

**Getting started:**
1. Navigate to `/voice` in the sidebar
2. Hold the microphone button while speaking
3. Release when done — Spork responds and reads it aloud
4. Click the speaker button to stop playback
5. Toggle **Mute responses** if you only want text, not audio

**Browser support:** Chrome, Edge (Web Speech API required). Firefox not currently supported.

---

### Spork Hub

**Use cases:** Discovering high-quality prompts from the community, saving your own reusable prompts, sharing what works.

Two sections:
- **Trending Prompts** — community prompts sorted by use count. One-click to try any prompt.
- **My Prompts** — save, organize, and optionally publish your own prompts.

**Getting started:**
1. Navigate to `/hub` in the sidebar
2. Browse trending prompts — click **Try this** to launch a conversation with that prompt
3. Switch to **My Prompts** → **Save a prompt** to create your own
4. Check **Share publicly to Hub** to contribute to the community
5. Your prompt gets a use counter as others try it

---

### Spork Feed

**Use cases:** Discovering interesting AI conversations from the community, sharing your own conversations publicly, getting inspiration.

**Getting started:**
1. Navigate to `/feed` in the sidebar
2. Browse public conversations — filter by **New** or **🔥 Top**
3. Click any conversation to read the full thread on its share page
4. Heart a conversation to like it
5. To share your own: open a conversation → click the **Private** button in the header to toggle it to **Public**

---

### Spork Memory (Super Spork)

**Use cases:** Teach Spork about your project, your preferences, your tech stack — once, and it remembers forever across all conversations.

Memory facts are injected into every system prompt automatically. No need to re-explain your context on every chat.

**Getting started:**
1. Go to `/settings` → scroll to **Spork Memory** section
2. Type a fact and press Enter or **Add**: `I use Next.js with the App Router, always TypeScript, Prisma for DB`
3. Add as many facts as you need — they're injected into every conversation
4. Hover a memory to delete it with the trash icon

**Example memories:**
```
My primary stack is Next.js + TypeScript + Prisma + PostgreSQL
I prefer functional React patterns, never class components
Always use named exports, never default exports
We use Tailwind CSS v3 — no CSS modules
Our API routes follow REST conventions with NextResponse
```

---

### Custom Instructions

**Use cases:** Permanently change how Spork responds — tone, format, focus area.

Works for all tiers. Unlike Memory (facts about you), Custom Instructions is a directive about how Spork should behave.

**Getting started:**
1. Go to `/settings` → **Custom Instructions** section
2. Write your instructions and click **Save**
3. All conversations from now on will follow these instructions

**Examples:**
```
Always respond in bullet points. Be extremely concise. Never use em dashes.
I'm a senior engineer. Skip beginner explanations. Go straight to the solution.
Always end code examples with a brief "gotchas" section.
```

---

## CLI Products

### Spork CLI (`@spork/cli`) — Free

**Use cases:** Quick AI queries in the terminal, scripting AI into workflows, piping file contents to get explanations, running FIF audits from CI.

**Install:**
```bash
npm install -g @spork/cli
# or
npx @spork/cli
```

**Basic usage:**
```bash
# Ask anything
spork "explain this regex: ^\d{3}-\d{4}$"

# Pipe input
cat error.log | spork "what caused this error?"
cat README.md | spork "summarize this in 3 bullets"

# Code mode
spork code "write a debounce function in TypeScript"

# Choose a model
spork --model openai/gpt-oss-20b:free "quick question: what is a monad?"

# Use an agent persona
spork --agent hacker "review this auth middleware"
spork --agent cockroach "find every way this could break"

# FIF — audit a file or directory for bugs
spork fif src/
spork fif src/app/api/chat/route.ts
```

**Save your API key** (higher rate limits):
```bash
spork login sk-or-your-openrouter-key
```

**Config file:** `~/.spork/config.json`

```json
{
  "apiKey": "sk-or-...",
  "model": "openai/gpt-oss-120b:free",
  "agent": "hacker"
}
```

**Available agents:** `hacker`, `dev`, `cockroach`, `nerd`, `oracle`

---

### Super CLI (`@spork/super`) — Super Spork Required

**Use cases:** Automated multi-file refactoring, full project bug audits, pre-commit code review, security scanning in CI, explaining unfamiliar codebases.

Super CLI is fundamentally different from Spork CLI. It's not a chat tool — it's an **agentic coding agent** that reads your entire project, plans changes, and executes them with budget controls.

**Install:**
```bash
npm install -g @spork/super
```

**First-time setup:**
```bash
super config
# Follow the prompts to set your OpenRouter API key and default model
```

**Core usage:**

```bash
# Run an agentic task on your entire project
super run "add error boundaries to all React page components"
super run "migrate all fetch() calls to use our new apiClient helper"
super run "add JSDoc comments to all exported functions in src/lib/"

# Preview the plan before applying changes
super run --dry-run "refactor the auth module to use the repository pattern"

# Set a spending cap (default: $5)
super run --budget 2 "implement dark mode toggle"

# Use a specific model
super run --model anthropic/claude-sonnet-4-6 "clean up unused imports"
```

**FIF — full project audit with auto-fix:**
```bash
super fif                    # audit entire project
super fif src/app/api/       # audit specific directory
super fif --apply            # audit + automatically apply fixes
```

**Review staged changes before committing:**
```bash
git add -p                   # stage what you want reviewed
super review                 # get severity-rated review + APPROVE/REJECT verdict
```

**Security scan:**
```bash
super scan                   # OWASP SAST scan of entire project
super scan src/app/api/      # scan specific directory
```

**Project memory — teach Super about your codebase once:**
```bash
super memory add "we use Prisma 5 — never write raw SQL"
super memory add "all API routes must use db.$transaction() for writes"
super memory add "the UserData interface lives in src/types/user.ts"
super memory show            # see all memories
super memory clear           # reset
```

**Explain any file:**
```bash
super explain src/lib/tier.ts
super explain src/app/api/chat/route.ts
```

**Budget system:**
- Default budget: `$5` per `super run` invocation
- Cost is estimated from token count before execution
- If estimated cost exceeds budget, Super refuses and suggests a higher limit
- Mid-stream: if output tokens push over budget, response is truncated with a notice
- Cost map: Opus 4.7 = $0.015/1K in, $0.075/1K out | Sonnet 4.6 = $0.003/1K in, $0.015/1K out

**Config file:** `~/.spork/super-config.json`
**Memory files:** `~/.spork/memory/<project-hash>.json` (unique per project directory)

---

## Sharing & Community

### Share a conversation
Any conversation can be made public via the **Private / Public** toggle in the chat header. Public conversations:
- Appear in the `/feed`
- Get their own shareable URL at `/share/<id>`
- Show view + like counts
- Display your username (or email prefix if no username set)

### Fork a conversation
From any public share page, click **Fork this chat** to create your own copy.

---

## Development

### Project structure

```
super-spork/
├── src/
│   ├── app/
│   │   ├── (auth)/              # Clerk sign-in / sign-up pages
│   │   ├── (dashboard)/         # Main app — requires auth
│   │   │   ├── page.tsx         # Home chat screen
│   │   │   ├── chat/[id]/       # Conversation view
│   │   │   ├── agents/          # Agent selection gallery
│   │   │   ├── canvas/          # Spork Canvas (artifact workspace)
│   │   │   ├── code/            # Spork Code (Monaco IDE)
│   │   │   ├── feed/            # Public conversation feed
│   │   │   ├── hub/             # Community prompt hub
│   │   │   ├── settings/        # Tier, memory, custom instructions
│   │   │   └── voice/           # Voice interface
│   │   ├── api/
│   │   │   ├── chat/            # Streaming AI endpoint (OpenRouter)
│   │   │   ├── conversations/   # CRUD + fork + public toggle + like
│   │   │   ├── feed/            # Public feed with cursor pagination
│   │   │   ├── memory/          # User memory CRUD
│   │   │   ├── prompts/         # Hub prompts CRUD + use counter
│   │   │   ├── user/            # User data + custom instructions
│   │   │   ├── upgrade/         # Stripe checkout session
│   │   │   └── webhooks/        # Clerk user sync, Stripe tier update
│   │   └── share/[id]/          # Public conversation share page
│   ├── components/
│   │   ├── agents/              # AgentCard, AgentSelector
│   │   ├── chat/                # MessageList, MessageInput, ModelSelector, ForkButton
│   │   ├── code/                # CodeChat, CodeEditor (Monaco)
│   │   └── sidebar/             # Collapsible sidebar with search
│   └── lib/
│       ├── agents.ts            # 15 agent persona definitions
│       ├── db.ts                # Prisma client singleton
│       ├── models.ts            # Model registry (free + paid) + FREE_DAILY_LIMIT
│       ├── tier.ts              # canUseModel(), getSystemPrompt(), hasReachedDailyLimit()
│       └── utils.ts             # cn(), formatDate(), truncate()
├── prisma/
│   └── schema.prisma            # User, Conversation, Message, UserMemory, SavedPrompt
├── cli/                         # @spork/cli — free terminal tool
│   └── src/
│       ├── index.ts             # CLI entry point (commander)
│       ├── chat.ts              # OpenRouter streaming over raw https
│       └── fif.ts               # File/directory bug auditor
└── super-cli/                   # @spork/super — agentic coding agent
    └── src/
        ├── index.ts             # CLI entry (commander)
        ├── agent.ts             # streamCompletion() + budget tracking
        ├── run.ts               # Agentic task runner (reads files, applies edits)
        ├── fif.ts               # Full project audit with --apply
        ├── review.ts            # Git diff code reviewer
        ├── scan.ts              # SAST security scanner
        ├── memory.ts            # Per-project memory (~/.spork/memory/)
        ├── explain.ts           # Single-file explainer
        └── config.ts            # Interactive config setup
```

### Key architectural decisions

**Atomic daily limit** — `api/chat` uses `db.$transaction()` to check and increment the message counter atomically, preventing race conditions under concurrent requests.

**System prompt injection** — All system prompts are injected server-side in `api/chat`. The client only sends `{ model, agentId, canvas, sporkCode }` flags. `tier.ts#getSystemPrompt()` composes the final prompt from tier + agent + memory + custom instructions.

**FIF (Fork In Fork)** — Creates a new `Conversation` with `forkedFromId` set, then copies all `Message` rows. The forked conversation runs independently on the new model.

**Canvas artifacts** — The canvas system prompt instructs the AI to always wrap output in `<artifact type="html|markdown|code">` tags. The client parses the latest assistant message with a regex and renders the extracted content.

**Super CLI budget** — Token count is estimated at ~4 chars/token before each call. Cost is calculated from the `MODEL_COSTS` map. If `estimatedCost > budget`, the run is rejected. During streaming, the cumulative output token count is tracked and the connection is destroyed if the budget ceiling is hit.

### Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Auth | Clerk + svix webhook verification |
| Database | Prisma 5 + PostgreSQL |
| AI | OpenRouter via Vercel AI SDK v4 |
| Streaming | `streamText()` + `toDataStreamResponse()` + `useChat()` |
| Payments | Stripe Checkout + webhooks |
| Editor | Monaco via `@monaco-editor/react` |
| Markdown | `react-markdown` + `rehype-highlight` + `remark-gfm` |
| Styling | Tailwind CSS v3, Geist font |
| Voice | Web Speech API (SpeechRecognition + speechSynthesis) |

### Running database migrations

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name describe-the-change

# Apply migrations in production
npx prisma migrate deploy

# Reset + reseed (dev only — destroys all data)
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

### Building for production

```bash
npm run build
npm start
```

---

## What makes Spork different

| Feature | Spork | ChatGPT | Claude | Grok | Gemini |
|---|:---:|:---:|:---:|:---:|:---:|
| 4,000 msg/day free | ✓ | ✗ | ✗ | ✗ | ✗ |
| 15 branded agent personas | ✓ | ✗ | ✗ | ✗ | ✗ |
| Model fork mid-conversation | ✓ | ✗ | ✗ | ✗ | ✗ |
| Public feed with likes | ✓ | ✗ | ✗ | ✗ | ✗ |
| BYOK removes all limits | ✓ | ✗ | ✗ | ✗ | ✗ |
| Monaco IDE in browser | ✓ | ✗ | ✗ | ✗ | ✗ |
| Agentic CLI with budget cap | ✓ | ✗ | ✗ | ✗ | ✗ |
| Open source / self-hostable | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## License

MIT
