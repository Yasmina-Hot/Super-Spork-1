import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;

  const conversation = await db.conversation.findFirst({
    where: { id, isPublic: true },
  });
  if (!conversation) return new NextResponse("Not found", { status: 404 });

  const updated = await db.conversation.update({
    where: { id },
    data: { likes: { increment: 1 } },
    select: { likes: true },
  });

  return NextResponse.json(updated);
}
