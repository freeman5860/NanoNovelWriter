import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface Params {
  params: Promise<{ novelId: string; chapterId: string }>;
}

async function verifyNovelOwner(novelId: string, userId: string) {
  const novel = await prisma.novel.findFirst({ where: { id: novelId, userId }, select: { id: true } });
  return novel !== null;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId, novelId } = await params;
  if (!(await verifyNovelOwner(novelId, session.user.id))) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, novelId },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  return NextResponse.json(chapter);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId, novelId } = await params;
  if (!(await verifyNovelOwner(novelId, session.user.id))) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const body = await request.json();
  const { title, content, wordCount } = body;

  const chapter = await prisma.chapter.update({
    where: { id: chapterId, novelId },
    data: { title, content, wordCount },
  });
  return NextResponse.json(chapter);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { chapterId, novelId } = await params;
  if (!(await verifyNovelOwner(novelId, session.user.id))) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  await prisma.chapter.delete({ where: { id: chapterId, novelId } });
  return new NextResponse(null, { status: 204 });
}
