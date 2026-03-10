import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ChapterSidebar } from "@/components/chapters/chapter-sidebar";
import { OutlinePanel } from "@/components/novels/outline-panel";

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
      <aside className="w-56 border-r flex flex-col shrink-0">
        <ChapterSidebar novelId={novel.id} novelTitle={novel.title} />
      </aside>
      <main className="flex-1 overflow-hidden">
        <OutlinePanel
          novelId={novel.id}
          novelTitle={novel.title}
          novelDescription={novel.description}
          novelGenre={novel.genre}
          novelCharacters={novel.characters}
          initialOutline={novel.outline}
          chapters={novel.chapters}
          aiProvider={novel.aiProvider}
          wordGoal={novel.wordGoal}
        />
      </main>
    </div>
  );
}
