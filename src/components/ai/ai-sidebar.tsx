"use client";

import { useState } from "react";
import { useAIStream } from "@/hooks/use-ai-stream";
import { AiActionButton } from "./ai-action-button";
import { StreamingText } from "./streaming-text";
import { CharacterPanel } from "./character-panel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Download, MessageSquare } from "lucide-react";
import { AIActionType, Character } from "@/types";
import { exportAsTxt, exportAsMarkdown } from "@/lib/export";

interface Props {
  novelId: string;
  novelTitle: string;
  chapterTitle: string;
  initialCharacters: string | null;
  getContent: () => string;
  getSelectedText: () => string;
  onInsert: (text: string) => void;
  provider?: string;
}

export function AISidebar({
  novelId,
  novelTitle,
  chapterTitle,
  initialCharacters,
  getContent,
  getSelectedText,
  onInsert,
  provider,
}: Props) {
  const { isStreaming, streamedText, error, generate, reset } = useAIStream();
  const [lastAction, setLastAction] = useState<AIActionType | null>(null);
  const [characters, setCharacters] = useState<Character[]>(() => {
    try {
      return initialCharacters ? JSON.parse(initialCharacters) : [];
    } catch {
      return [];
    }
  });
  const [selectedDialogueChars, setSelectedDialogueChars] = useState<string[]>([]);
  const [showDialogueSelector, setShowDialogueSelector] = useState(false);

  const handleCharactersChange = async (newChars: Character[]) => {
    setCharacters(newChars);
    await fetch(`/api/novels/${novelId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characters: JSON.stringify(newChars) }),
    });
  };

  const toggleDialogueChar = (name: string) => {
    setSelectedDialogueChars((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handleAction = async (action: AIActionType) => {
    if (action === "dialogue" && characters.length > 0) {
      setShowDialogueSelector(true);
      return;
    }
    await runAction(action, []);
  };

  const runAction = async (action: AIActionType, dialogueChars: string[]) => {
    setLastAction(action);
    setShowDialogueSelector(false);
    reset();
    await generate({
      action,
      novelTitle,
      chapterTitle,
      chapterContent: getContent(),
      selectedText: action === "polish" ? getSelectedText() : undefined,
      provider,
      characters: characters.length > 0 ? JSON.stringify(characters) : undefined,
      dialogueCharacters: dialogueChars.length > 0 ? dialogueChars : undefined,
    });
  };

  const handleInsert = () => {
    if (streamedText) {
      onInsert(streamedText);
      reset();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-sm">AI 助手</h3>
      </div>

      <CharacterPanel characters={characters} onChange={handleCharactersChange} />

      <div className="px-3 py-3 space-y-2 border-b">
        <div className="flex flex-wrap gap-2">
          <AiActionButton
            action="generate"
            onClick={() => handleAction("generate")}
            isLoading={isStreaming && lastAction === "generate"}
            disabled={isStreaming}
          />
          <AiActionButton
            action="continue"
            onClick={() => handleAction("continue")}
            isLoading={isStreaming && lastAction === "continue"}
            disabled={isStreaming}
          />
          <AiActionButton
            action="polish"
            onClick={() => handleAction("polish")}
            isLoading={isStreaming && lastAction === "polish"}
            disabled={isStreaming}
          />
          <AiActionButton
            action="dialogue"
            onClick={() => handleAction("dialogue")}
            isLoading={isStreaming && lastAction === "dialogue"}
            disabled={isStreaming}
          />
        </div>
        {lastAction === "polish" && !showDialogueSelector && (
          <p className="text-xs text-muted-foreground">润色：选中文字后点击润色</p>
        )}

        {/* 对话角色选择器 */}
        {showDialogueSelector && (
          <div className="rounded-md border bg-muted/30 p-2.5 space-y-2">
            <p className="text-xs font-medium flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              选择对话角色（可多选）
            </p>
            <div className="flex flex-wrap gap-1.5">
              {characters.map((c) => (
                <button
                  key={c.name}
                  onClick={() => toggleDialogueChar(c.name)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                    selectedDialogueChars.includes(c.name)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 pt-0.5">
              <Button
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => runAction("dialogue", selectedDialogueChars)}
              >
                生成对话
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                onClick={() => {
                  setShowDialogueSelector(false);
                  setSelectedDialogueChars([]);
                }}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-3">
            {error}
          </div>
        )}
        <StreamingText text={streamedText} isStreaming={isStreaming} />
      </ScrollArea>

      {streamedText && !isStreaming && (
        <>
          <Separator />
          <div className="px-3 py-3 flex gap-2">
            <Button size="sm" className="flex-1 gap-1.5" onClick={handleInsert}>
              <Check className="h-3.5 w-3.5" />
              插入编辑器
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={reset}>
              <X className="h-3.5 w-3.5" />
              丢弃
            </Button>
          </div>
        </>
      )}

      <Separator />
      <div className="px-3 py-3 space-y-1.5">
        <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
          <Download className="h-3 w-3" />
          导出本章
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => exportAsTxt(novelTitle, chapterTitle, getContent())}
          >
            TXT
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
            onClick={() => exportAsMarkdown(novelTitle, chapterTitle, getContent())}
          >
            Markdown
          </Button>
        </div>
      </div>
    </div>
  );
}
