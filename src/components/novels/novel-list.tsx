"use client";

import { useState, useEffect } from "react";
import { useNovels } from "@/hooks/use-novels";
import { NovelCard } from "./novel-card";
import { CreateNovelWizard } from "@/components/wizard/create-novel-wizard";
import { SearchDialog } from "@/components/search/search-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, Search } from "lucide-react";

export function NovelList() {
  const { novels, isLoading, error, createNovel, deleteNovel, updateNovel } = useNovels();
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>加载失败: {error}</p>
      </div>
    );
  }

  return (
    <>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">我的小说</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              搜索
              <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-xs font-mono">
                ⌘K
              </kbd>
            </Button>
            <CreateNovelWizard onCreate={createNovel} />
          </div>
        </div>

        {novels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <BookOpen className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">还没有小说</p>
            <p className="text-sm mt-1">点击右上角"新建小说"开始创作</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {novels.map((novel) => (
              <NovelCard key={novel.id} novel={novel} onDelete={deleteNovel} onUpdate={updateNovel} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
