import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditorPage } from "@/components/editor/editor-page";

interface Props {
  params: Promise<{ novelId: string; chapterId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { chapterId, novelId } = await params;
  const chapter = await prisma.chapter.findFirst({ where: { id: chapterId, novelId } });
  return { title: chapter ? `${chapter.title} | NanoNovelWriter` : "章节编辑" };
}

export default async function ChapterEditorPage({ params }: Props) {
  const { novelId, chapterId } = await params;

  const [novel, chapter] = await Promise.all([
    prisma.novel.findUnique({ where: { id: novelId } }),
    prisma.chapter.findFirst({ where: { id: chapterId, novelId } }),
  ]);

  if (!novel || !chapter) notFound();

  return (
    <EditorPage
      novelId={novelId}
      novelTitle={novel.title}
      chapterId={chapterId}
      chapterTitle={chapter.title}
      initialContent={chapter.content}
      aiProvider={novel.aiProvider}
    />
  );
}
