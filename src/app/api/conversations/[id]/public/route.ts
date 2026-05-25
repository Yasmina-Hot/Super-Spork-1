import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: { id, isPublic: true },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return new NextResponse("Not found", { status: 404 });

  // Increment view count (fire-and-forget)
  db.conversation.update({
    where: { id },
    data: { views: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.json(conversation);
}
