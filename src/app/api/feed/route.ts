import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("filter") ?? "new";
  const cursor = searchParams.get("cursor");
  const take = 20;

  const orderBy =
    filter === "top"
      ? [{ likes: "desc" as const }, { views: "desc" as const }]
      : [{ updatedAt: "desc" as const }];

  let conversations;
  try {
    conversations = await db.conversation.findMany({
      where: { isPublic: true },
      orderBy,
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        title: true,
        model: true,
        agentId: true,
        likes: true,
        views: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
          select: { content: true, role: true },
        },
        user: { select: { email: true, username: true } },
      },
    });
  } catch {
    return NextResponse.json({ conversations: [], nextCursor: null });
  }

  const nextCursor =
    conversations.length === take
      ? conversations[conversations.length - 1].id
      : null;

  return NextResponse.json({ conversations, nextCursor });
}
