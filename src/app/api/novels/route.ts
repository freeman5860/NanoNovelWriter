import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const novels = await prisma.novel.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { chapters: true } } },
  });
  return NextResponse.json(novels);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description, genre, aiProvider, aiModel } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const novel = await prisma.novel.create({
    data: { title: title.trim(), description, genre, aiProvider, aiModel },
  });
  return NextResponse.json(novel, { status: 201 });
}
