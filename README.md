# Spork / Super Spork

A tiered AI chat platform with Grok-inspired UI. Built on Next.js + TypeScript.

## Product Tiers

| | Spork (Free) | Super Spork (Paid) |
|---|---|---|
| Models | 3 free OpenRouter models | All models (Claude, GPT-4o, Gemini, Grok...) |
| Messages | 20/day | Unlimited |
| Spork Code | — | Monaco editor + AI coding assistant |
| File uploads | — | Images, PDFs, docs |

### Free Models (via OpenRouter)
- `openai/gpt-oss-120b:free` — 117B MoE
- `openai/gpt-oss-20b:free` — 21B MoE  
- `nvidia/nemotron-3-super-120b-a12b:free` — 120B hybrid MoE, 1M context

## Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Database**: Prisma 5 + PostgreSQL
- **AI**: OpenRouter via Vercel AI SDK
- **Payments**: Stripe
- **UI**: Tailwind CSS, Geist font

## Setup

1. Copy `.env.example` to `.env` and fill in your keys
2. Set up a PostgreSQL database (Neon or Supabase recommended)
3. Run migrations: `npx prisma migrate dev`
4. Set up a Clerk application and configure webhooks at `/api/webhooks/clerk`
5. Set up a Stripe product + price, configure webhooks at `/api/webhooks/stripe`
6. Get an OpenRouter API key at openrouter.ai

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Project Structure

```
src/
  app/
    (auth)/          # Clerk sign-in / sign-up
    (dashboard)/     # Main app layout with sidebar
      page.tsx       # Home chat
      chat/[id]/     # Conversation view
      code/          # Spork Code (paid)
      settings/      # Tier + account settings
    api/
      chat/          # OpenRouter streaming endpoint
      conversations/ # CRUD for conversations
      webhooks/      # Clerk + Stripe webhooks
  components/
    sidebar/         # Collapsible nav with conversation history
    chat/            # MessageList, MessageInput, ModelSelector
    code/            # CodeChat + Monaco CodeEditor
  lib/
    db.ts            # Prisma client singleton
    models.ts        # Model registry (free + paid)
    tier.ts          # Tier gate helpers
    utils.ts         # cn(), formatDate(), truncate()
```
