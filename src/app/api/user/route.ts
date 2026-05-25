import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FREE_DAILY_LIMIT } from "@/lib/models";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return new NextResponse("User not found", { status: 404 });

  const now = new Date();
  const isNewDay = now.toDateString() !== new Date(user.lastReset).toDateString();
  const effectiveDailyMessages = isNewDay ? 0 : user.dailyMessages;

  return NextResponse.json({
    tier: user.tier,
    dailyMessages: effectiveDailyMessages,
    dailyLimit: FREE_DAILY_LIMIT,
  });
}
