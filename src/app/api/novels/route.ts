import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const novels = await prisma.novel.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { chapters: true } },
      chapters: { select: { wordCount: true } },
    },
  });
  const result = novels.map(({ chapters, ...novel }) => ({
    ...novel,
    totalWordCount: chapters.reduce((sum, c) => sum + c.wordCount, 0),
  }));
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description, genre, aiProvider, aiModel } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const novel = await prisma.novel.create({
    data: { title: title.trim(), description, genre, aiProvider, aiModel, userId: session.user.id },
  });
  return NextResponse.json(novel, { status: 201 });
}
