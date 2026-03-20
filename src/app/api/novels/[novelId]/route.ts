import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface Params {
  params: Promise<{ novelId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { novelId } = await params;
  const novel = await prisma.novel.findFirst({
    where: { id: novelId, userId: session.user.id },
    include: { chapters: { orderBy: { order: "asc" } } },
  });
  if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });
  return NextResponse.json(novel);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { novelId } = await params;
  const body = await request.json();
  const { title, description, genre, aiProvider, aiModel, characters, outline, wordGoal, background, plotSummary, highlights, targetChapters } = body;

  const novel = await prisma.novel.updateMany({
    where: { id: novelId, userId: session.user.id },
    data: { title, description, genre, aiProvider, aiModel, characters, outline, wordGoal, background, plotSummary, highlights, targetChapters },
  });
  if (novel.count === 0) return NextResponse.json({ error: "Novel not found" }, { status: 404 });

  const updated = await prisma.novel.findUnique({ where: { id: novelId } });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { novelId } = await params;
  await prisma.novel.deleteMany({ where: { id: novelId, userId: session.user.id } });
  return new NextResponse(null, { status: 204 });
}
