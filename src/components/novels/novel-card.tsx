import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Novel } from "@/types";
import { BookOpen, Calendar } from "lucide-react";

interface Props {
  novel: Novel & { _count?: { chapters: number } };
  onDelete: (id: string) => void;
}

export function NovelCard({ novel, onDelete }: Props) {
  const chapterCount = novel._count?.chapters ?? novel.chapters?.length ?? 0;

  return (
    <Link href={`/novels/${novel.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full group">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {novel.title}
          </CardTitle>
          {novel.genre && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-fit">
              {novel.genre}
            </span>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {novel.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">{novel.description}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              <span>{chapterCount} 章节</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(novel.updatedAt).toLocaleDateString("zh-CN")}</span>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (confirm(`确认删除《${novel.title}》？此操作不可撤销。`)) {
                onDelete(novel.id);
              }
            }}
            className="text-xs text-destructive opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
          >
            删除
          </button>
        </CardContent>
      </Card>
    </Link>
  );
}
