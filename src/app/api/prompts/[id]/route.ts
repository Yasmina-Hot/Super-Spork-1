import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await db.savedPrompt.update({
    where: { id },
    data: { uses: { increment: 1 } },
  }).catch(() => {});

  return new NextResponse(null, { status: 204 });
}
