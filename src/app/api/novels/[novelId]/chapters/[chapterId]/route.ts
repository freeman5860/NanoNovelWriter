import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ novelId: string; chapterId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { chapterId, novelId } = await params;
  const chapter = await prisma.chapter.findFirst({
    where: { id: chapterId, novelId },
  });
  if (!chapter) return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  return NextResponse.json(chapter);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { chapterId, novelId } = await params;
  const body = await request.json();
  const { title, content, wordCount } = body;

  const chapter = await prisma.chapter.update({
    where: { id: chapterId, novelId },
    data: { title, content, wordCount },
  });
  return NextResponse.json(chapter);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { chapterId, novelId } = await params;
  await prisma.chapter.delete({ where: { id: chapterId, novelId } });
  return new NextResponse(null, { status: 204 });
}
