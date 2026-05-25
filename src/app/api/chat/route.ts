import { auth } from "@clerk/nextjs/server";
import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { canUseModel, hasReachedDailyLimit } from "@/lib/tier";
import { Tier } from "@prisma/client";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
    "X-Title": "Spork",
  },
});

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, model, conversationId } = await req.json();

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

  const now = new Date();
  const lastReset = new Date(user.lastReset);
  const shouldReset =
    (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24) >= 1;

  await db.user.update({
    where: { id: user.id },
    data: {
      dailyMessages: shouldReset ? 1 : user.dailyMessages + 1,
      lastReset: shouldReset ? now : user.lastReset,
    },
  });

  const lastUserMessage = messages[messages.length - 1]?.content as string;

  if (conversationId && lastUserMessage) {
    await db.message.create({
      data: {
        conversationId,
        role: "user",
        content: lastUserMessage,
      },
    });
  }

  const result = streamText({
    model: openrouter(model),
    messages,
    onFinish: async ({ text }) => {
      if (conversationId && text) {
        await db.message.create({
          data: {
            conversationId,
            role: "assistant",
            content: text,
          },
        });

        const isFirstExchange =
          messages.length === 1 ||
          (messages.length === 2 && messages[0].role === "system");
        if (isFirstExchange) {
          const title = lastUserMessage.slice(0, 60);
          await db.conversation.update({
            where: { id: conversationId },
            data: { title },
          });
        }
      }
    },
  });

  return result.toDataStreamResponse();
}
