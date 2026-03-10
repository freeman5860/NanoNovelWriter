import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChapterSidebar } from "@/components/chapters/chapter-sidebar";

interface Props {
  params: Promise<{ novelId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { novelId } = await params;
  const novel = await prisma.novel.findUnique({ where: { id: novelId } });
  return { title: novel ? `${novel.title} | NanoNovelWriter` : "小说详情" };
}

export default async function NovelDetailPage({ params }: Props) {
  const { novelId } = await params;
  const novel = await prisma.novel.findUnique({
    where: { id: novelId },
    include: { chapters: { orderBy: { order: "asc" } } },
  });

  if (!novel) notFound();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 border-r flex flex-col shrink-0">
        <ChapterSidebar novelId={novel.id} novelTitle={novel.title} />
      </aside>
      <main className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
        <p className="text-lg font-medium">{novel.title}</p>
        {novel.description && (
          <p className="text-sm mt-2 max-w-md text-center">{novel.description}</p>
        )}
        <p className="text-sm mt-4">从左侧选择章节开始编辑，或新建章节</p>
      </main>
    </div>
  );
}
