import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface SearchResult {
  type: "novel" | "chapter";
  novelId: string;
  novelTitle: string;
  chapterId?: string;
  chapterTitle?: string;
  excerpt?: string;
}

function extractExcerpt(content: string, query: string): string {
  let plainText = "";
  try {
    const walk = (node: Record<string, unknown>) => {
      if (node.type === "text") plainText += (node.text as string) ?? "";
      if (node.content) (node.content as Record<string, unknown>[]).forEach(walk);
    };
    walk(JSON.parse(content));
  } catch {
    plainText = content;
  }

  const idx = plainText.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return plainText.slice(0, 80).trim();
  const start = Math.max(0, idx - 40);
  const end = Math.min(plainText.length, idx + query.length + 60);
  return (start > 0 ? "..." : "") + plainText.slice(start, end).trim() + (end < plainText.length ? "..." : "");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) return NextResponse.json([]);

  const userId = session.user.id;

  const [novels, chapters] = await Promise.all([
    prisma.novel.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true },
      take: 5,
    }),
    prisma.chapter.findMany({
      where: {
        novel: { userId },
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { content: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, content: true, novel: { select: { id: true, title: true } } },
      take: 10,
    }),
  ]);

  const results: SearchResult[] = [
    ...novels.map((n) => ({
      type: "novel" as const,
      novelId: n.id,
      novelTitle: n.title,
    })),
    ...chapters.map((c) => ({
      type: "chapter" as const,
      novelId: c.novel.id,
      novelTitle: c.novel.title,
      chapterId: c.id,
      chapterTitle: c.title,
      excerpt: extractExcerpt(c.content, q),
    })),
  ];

  return NextResponse.json(results);
}
