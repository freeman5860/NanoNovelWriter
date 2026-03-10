"use client";

import { useState, useEffect } from "react";
import { useChapters } from "@/hooks/use-chapters";
import { ChapterListItem } from "./chapter-list-item";
import { CreateChapterDialog } from "./create-chapter-dialog";
import { SearchDialog } from "@/components/search/search-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { arrayMove } from "@dnd-kit/sortable";

interface Props {
  novelId: string;
  novelTitle: string;
  activeChapterId?: string;
}

export function ChapterSidebar({ novelId, novelTitle, activeChapterId }: Props) {
  const { chapters, isLoading, createChapter, deleteChapter, updateChapter, reorderChapters } =
    useChapters(novelId);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(chapters, oldIndex, newIndex);
    reorderChapters(reordered.map((c) => c.id));
  };

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm truncate" title={novelTitle}>
            {novelTitle}
          </h2>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs text-muted-foreground">{chapters.length} 章节</p>
            <button
              onClick={() => setSearchOpen(true)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="搜索 (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          {isLoading ? (
            <div className="space-y-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 rounded" />
              ))}
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-0.5">
                  {chapters.map((chapter) => (
                    <ChapterListItem
                      key={chapter.id}
                      chapter={chapter}
                      novelId={novelId}
                      isActive={chapter.id === activeChapterId}
                      onDelete={deleteChapter}
                      onUpdate={updateChapter}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </ScrollArea>

        <div className="px-3 py-3 border-t">
          <CreateChapterDialog onCreate={createChapter} />
        </div>
      </div>
    </>
  );
}
