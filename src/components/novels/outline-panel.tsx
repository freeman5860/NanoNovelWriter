"use client";

import { useState, useRef, useCallback } from "react";
import { useAIStream } from "@/hooks/use-ai-stream";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sparkles, Loader2, Check, Save, Download, Target, BookOpen, BarChart2 } from "lucide-react";
import { Chapter } from "@/types";
import { exportNovelAsTxt, exportNovelAsMarkdown } from "@/lib/export";

interface Props {
  novelId: string;
  novelTitle: string;
  novelDescription?: string | null;
  novelGenre?: string | null;
  novelCharacters?: string | null;
  initialOutline?: string | null;
  chapters: Chapter[];
  aiProvider?: string | null;
  wordGoal?: number | null;
}

export function OutlinePanel({
  novelId,
  novelTitle,
  novelDescription,
  novelGenre,
  novelCharacters,
  initialOutline,
  chapters,
  aiProvider,
  wordGoal,
}: Props) {
  const [outline, setOutline] = useState(initialOutline ?? "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isStreaming, streamedText, error, generate, reset } = useAIStream();

  const saveOutline = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        await fetch(`/api/novels/${novelId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ outline: text }),
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    },
    [novelId]
  );

  const handleChange = (value: string) => {
    setOutline(value);
    setSaveStatus("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveOutline(value), 1500);
  };

  const handleGenerate = async () => {
    reset();
    await generate(
      {
        action: "outline",
        novelTitle,
        novelDescription: novelDescription ?? undefined,
        novelGenre: novelGenre ?? undefined,
        characters: novelCharacters ?? undefined,
        chapterTitles: chapters.map((c) => c.title),
        provider: aiProvider ?? undefined,
      },
      undefined,
      async (fullText) => {
        setOutline(fullText);
        await saveOutline(fullText);
      }
    );
  };

  const displayText = isStreaming ? streamedText : outline;

  const totalWords = chapters.reduce((sum, c) => sum + c.wordCount, 0);
  const progress = wordGoal && wordGoal > 0 ? Math.min(100, Math.round((totalWords / wordGoal) * 100)) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div>
          <h2 className="text-lg font-semibold">故事大纲</h2>
          <p className="text-xs text-muted-foreground mt-0.5">记录故事结构与章节规划</p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              保存中
            </span>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <Check className="h-3 w-3" />
              已保存
            </span>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={chapters.length === 0}
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              导出
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => exportNovelAsTxt(novelTitle, chapters)}>
                导出为 TXT
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => exportNovelAsMarkdown(novelTitle, chapters)}>
                导出为 Markdown
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={handleGenerate}
            disabled={isStreaming}
          >
            {isStreaming ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                AI 生成大纲
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* 写作统计 */}
      <div className="px-6 py-3 border-b bg-muted/30 flex items-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5" />
          总字数：<span className="font-medium text-foreground">{totalWords.toLocaleString()}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5" />
          章节数：<span className="font-medium text-foreground">{chapters.length}</span>
        </span>
        {wordGoal && (
          <span className="flex items-center gap-1.5 ml-auto shrink-0">
            <Target className="h-3.5 w-3.5" />
            目标：
            <span className={`font-medium ${progress === 100 ? "text-green-600" : "text-foreground"}`}>
              {progress}%
            </span>
            <span>（{wordGoal.toLocaleString()} 字）</span>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-primary"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </span>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        {isStreaming ? (
          <div className="prose prose-neutral dark:prose-invert max-w-none text-sm whitespace-pre-wrap leading-relaxed">
            {streamedText || <span className="text-muted-foreground animate-pulse">AI 正在生成大纲...</span>}
          </div>
        ) : (
          <Textarea
            value={outline}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`在这里记录你的故事大纲...\n\n例如：\n# 故事梗概\n...\n\n# 章节规划\n第1章：...\n第2章：...`}
            className="min-h-[calc(100vh-14rem)] resize-none border-0 bg-transparent p-0 text-sm leading-relaxed focus-visible:ring-0 font-mono"
          />
        )}
      </div>

      {!isStreaming && outline && (
        <div className="px-6 py-3 border-t flex justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="gap-1.5 text-xs"
            onClick={() => saveOutline(outline)}
          >
            <Save className="h-3.5 w-3.5" />
            手动保存
          </Button>
        </div>
      )}
    </div>
  );
}
