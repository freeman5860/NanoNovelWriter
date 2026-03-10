import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ novelId: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { novelId } = await params;
  const chapters = await prisma.chapter.findMany({
    where: { novelId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(chapters);
}

export async function POST(request: NextRequest, { params }: Params) {
  const { novelId } = await params;
  const body = await request.json();
  const { title } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Compute next order
  const maxOrder = await prisma.chapter.aggregate({
    where: { novelId },
    _max: { order: true },
  });
  const order = (maxOrder._max.order ?? 0) + 1;

  const chapter = await prisma.chapter.create({
    data: { novelId, title: title.trim(), order },
  });
  return NextResponse.json(chapter, { status: 201 });
}

// PATCH /api/novels/[novelId]/chapters — reorder chapters
export async function PATCH(request: NextRequest, { params }: Params) {
  const { novelId } = await params;
  const body = await request.json();
  const { orderedIds } = body as { orderedIds: string[] };

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: "orderedIds is required" }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.chapter.update({
        where: { id, novelId },
        data: { order: index + 1 },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
