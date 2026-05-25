import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "public";

  if (scope === "mine") {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse("User not found", { status: 404 });

    const prompts = await db.savedPrompt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(prompts);
  }

  // Public prompts
  const prompts = await db.savedPrompt.findMany({
    where: { isPublic: true },
    orderBy: [{ uses: "desc" }, { createdAt: "desc" }],
    take: 50,
    include: { user: { select: { username: true, email: true } } },
  });

  return NextResponse.json(prompts);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const { title, content, isPublic } = await req.json();
  if (
    typeof title !== "string" || !title.trim() ||
    typeof content !== "string" || !content.trim()
  ) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  const prompt = await db.savedPrompt.create({
    data: {
      userId: user.id,
      title: title.trim(),
      content: content.trim(),
      isPublic: Boolean(isPublic),
    },
  });

  return NextResponse.json(prompt, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await req.json();
  if (typeof id !== "string") return new NextResponse("Missing id", { status: 400 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  await db.savedPrompt.deleteMany({ where: { id, userId: user.id } });

  return new NextResponse(null, { status: 204 });
}
