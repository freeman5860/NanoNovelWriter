"use client";

import Link from "next/link";
import { Chapter } from "@/types";
import { cn } from "@/lib/utils";
import { FileText, Trash2 } from "lucide-react";

interface Props {
  chapter: Chapter;
  novelId: string;
  isActive?: boolean;
  onDelete: (id: string) => void;
}

export function ChapterListItem({ chapter, novelId, isActive, onDelete }: Props) {
  return (
    <div className={cn("group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent", isActive && "bg-accent")}>
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Link
        href={`/novels/${novelId}/chapters/${chapter.id}`}
        className="flex-1 min-w-0 text-sm truncate"
      >
        {chapter.title}
      </Link>
      {chapter.wordCount > 0 && (
        <span className="text-xs text-muted-foreground shrink-0">{chapter.wordCount}</span>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (confirm(`确认删除「${chapter.title}」？`)) {
            onDelete(chapter.id);
          }
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
