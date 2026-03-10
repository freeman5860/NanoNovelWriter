"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, BookOpen, FileText, Loader2 } from "lucide-react";
import type { SearchResult } from "@/app/api/search/route";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data: SearchResult[] = await res.json();
      setResults(data);
      setActiveIndex(0);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const navigate = useCallback(
    (result: SearchResult) => {
      onOpenChange(false);
      if (result.type === "chapter") {
        router.push(`/novels/${result.novelId}/chapters/${result.chapterId}`);
      } else {
        router.push(`/novels/${result.novelId}`);
      }
    },
    [router, onOpenChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      navigate(results[activeIndex]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  };

  const novelResults = results.filter((r) => r.type === "novel");
  const chapterResults = results.filter((r) => r.type === "chapter");

  // Compute flat index for keyboard nav
  const flatResults = [...novelResults, ...chapterResults];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg p-0 gap-0 overflow-hidden"
      >
        {/* Search Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b">
          {isSearching ? (
            <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="搜索小说标题、章节内容..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 hidden sm:block">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {query.trim() === "" && (
            <p className="text-xs text-muted-foreground text-center py-8">
              输入关键词搜索小说或章节
            </p>
          )}

          {query.trim() !== "" && !isSearching && results.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8">
              未找到与「{query}」相关的内容
            </p>
          )}

          {novelResults.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                小说
              </p>
              {novelResults.map((r) => {
                const idx = flatResults.indexOf(r);
                return (
                  <button
                    key={r.novelId}
                    onClick={() => navigate(r)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      activeIndex === idx ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate">{r.novelTitle}</span>
                  </button>
                );
              })}
            </div>
          )}

          {chapterResults.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                章节
              </p>
              {chapterResults.map((r) => {
                const idx = flatResults.indexOf(r);
                return (
                  <button
                    key={r.chapterId}
                    onClick={() => navigate(r)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full flex items-start gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      activeIndex === idx ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                  >
                    <FileText className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium truncate">{r.chapterTitle}</span>
                        <span className="text-xs text-muted-foreground shrink-0 truncate">
                          {r.novelTitle}
                        </span>
                      </div>
                      {r.excerpt && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {r.excerpt}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="border-t px-4 py-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span><kbd className="border rounded px-1">↑↓</kbd> 导航</span>
            <span><kbd className="border rounded px-1">Enter</kbd> 跳转</span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
