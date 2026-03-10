"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Novel } from "@/types";
import { BookOpen, Calendar, Pencil, Target } from "lucide-react";
import { EditNovelDialog } from "./edit-novel-dialog";

interface Props {
  novel: Novel & { _count?: { chapters: number } };
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title?: string; description?: string; genre?: string; wordGoal?: number | null }) => Promise<Novel>;
}

export function NovelCard({ novel, onDelete, onUpdate }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const chapterCount = novel._count?.chapters ?? novel.chapters?.length ?? 0;
  const totalWords = novel.totalWordCount ?? 0;
  const goal = novel.wordGoal;
  const progress = goal && goal > 0 ? Math.min(100, Math.round((totalWords / goal) * 100)) : null;

  return (
    <>
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
            {/* 字数进度 */}
            {goal ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {totalWords.toLocaleString()} / {goal.toLocaleString()} 字
                  </span>
                  <span className={progress === 100 ? "text-green-600 font-medium" : ""}>
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-primary"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : totalWords > 0 ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Target className="h-3 w-3" />
                已写 {totalWords.toLocaleString()} 字
              </p>
            ) : null}
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
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditOpen(true);
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <Pencil className="h-3 w-3" />
                编辑
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`确认删除《${novel.title}》？此操作不可撤销。`)) {
                    onDelete(novel.id);
                  }
                }}
                className="text-xs text-destructive hover:underline"
              >
                删除
              </button>
            </div>
          </CardContent>
        </Card>
      </Link>
      <EditNovelDialog
        novel={novel}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}
