"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Chapter } from "@/types";
import { cn } from "@/lib/utils";
import { FileText, Trash2, Pencil, Check, X, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  chapter: Chapter;
  novelId: string;
  isActive?: boolean;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { title?: string }) => Promise<Chapter>;
}

export function ChapterListItem({ chapter, novelId, isActive, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chapter.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTitle(chapter.title);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === chapter.title) {
      setIsEditing(false);
      return;
    }
    try {
      await onUpdate(chapter.id, { title: trimmed });
    } catch {
      // revert on error
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(chapter.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") handleCancel();
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-1 rounded-md px-2 py-1.5 bg-accent">
        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 min-w-0 text-sm bg-transparent outline-none"
        />
        <button onClick={handleSave} className="p-0.5 hover:text-primary shrink-0">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={handleCancel} className="p-0.5 hover:text-destructive shrink-0">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent",
        isActive && "bg-accent",
        isDragging && "opacity-50"
      )}
    >
      <button
        className="shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
      <Link
        href={`/novels/${novelId}/chapters/${chapter.id}`}
        className="flex-1 min-w-0 text-sm truncate"
      >
        {chapter.title}
      </Link>
      {chapter.wordCount > 0 && (
        <span className="text-xs text-muted-foreground shrink-0 group-hover:hidden">{chapter.wordCount}</span>
      )}
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button
          onClick={handleStartEdit}
          className="p-0.5 hover:text-primary transition-colors"
          title="重命名"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm(`确认删除「${chapter.title}」？`)) {
              onDelete(chapter.id);
            }
          }}
          className="p-0.5 hover:text-destructive transition-colors"
          title="删除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
