import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { canUseModel, hasReachedDailyLimit, getSystemPrompt } from "@/lib/tier";

function makeOpenRouter(apiKey: string) {
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "Spork",
    },
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, model, conversationId, agentId, codeContext, sporkCode } =
    await req.json();

  if (!model || !messages?.length) {
    return new Response("Missing required fields", { status: 400 });
  }

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  if (!canUseModel(user.tier, model)) {
    return new Response("Model requires Super Spork upgrade", { status: 403 });
  }

  if (hasReachedDailyLimit(user.tier, user.dailyMessages, user.lastReset)) {
    return new Response("Daily message limit reached", { status: 429 });
  }

  // Reset daily counter if it's a new day
  const now = new Date();
  const today = now.toDateString();
  const lastResetDay = new Date(user.lastReset).toDateString();
  const isNewDay = today !== lastResetDay;

  await db.user.update({
    where: { id: user.id },
    data: {
      dailyMessages: isNewDay ? 1 : user.dailyMessages + 1,
      lastReset: isNewDay ? now : user.lastReset,
    },
  });

  // Build system prompt based on tier + agent + context
  const systemContent = getSystemPrompt(user.tier, {
    agentId,
    customInstructions: user.customInstructions,
    codeContext,
    sporkCode,
  });

  // Prepend system message if we have one
  const allMessages = systemContent
    ? [{ role: "system" as const, content: systemContent }, ...messages]
    : messages;

  // Use user's own OpenRouter key if they provided one (BYOK — removes all limits)
  const apiKey = user.openrouterKey ?? process.env.OPENROUTER_API_KEY ?? "";
  const openrouter = makeOpenRouter(apiKey);

  // Find last user message for title generation and DB logging
  const lastUserMessage = [...messages]
    .reverse()
    .find((m: { role: string; content: string }) => m.role === "user")
    ?.content as string | undefined;

  if (conversationId && lastUserMessage) {
    await db.message.create({
      data: { conversationId, role: "user", content: lastUserMessage },
    });
  }

  const result = streamText({
    model: openrouter(model),
    messages: allMessages,
    onFinish: async ({ text }) => {
      if (conversationId && text) {
        await db.message.create({
          data: { conversationId, role: "assistant", content: text },
        });

        // Title from first user message only (no assistant messages yet means first exchange)
        const existingMessages = await db.message.count({
          where: { conversationId, role: "assistant" },
        });
        if (existingMessages === 1 && lastUserMessage) {
          await db.conversation.update({
            where: { id: conversationId },
            data: { title: lastUserMessage.slice(0, 60) },
          });
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
