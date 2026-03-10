import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ novelId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { novelId } = await params;
  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: { chapters: { orderBy: { order: "asc" } } },
  });
  if (!novel) return NextResponse.json({ error: "Novel not found" }, { status: 404 });
  return NextResponse.json(novel);
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { novelId } = await params;
  const body = await request.json();
  const { title, description, genre, aiProvider, aiModel, characters } = body;

  const novel = await prisma.novel.update({
    where: { id: novelId },
    data: { title, description, genre, aiProvider, aiModel, characters },
  });
  return NextResponse.json(novel);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { novelId } = await params;
  await prisma.novel.delete({ where: { id: novelId } });
  return new NextResponse(null, { status: 204 });
}
