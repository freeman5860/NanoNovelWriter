"use client";

import { useState } from "react";
import { useAIStream } from "@/hooks/use-ai-stream";
import { AiActionButton } from "./ai-action-button";
import { StreamingText } from "./streaming-text";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X } from "lucide-react";
import { AIActionType } from "@/types";

interface Props {
  novelTitle: string;
  chapterTitle: string;
  getContent: () => string;
  getSelectedText: () => string;
  onInsert: (text: string) => void;
  provider?: string;
}

export function AISidebar({ novelTitle, chapterTitle, getContent, getSelectedText, onInsert, provider }: Props) {
  const { isStreaming, streamedText, error, generate, reset } = useAIStream();
  const [lastAction, setLastAction] = useState<AIActionType | null>(null);

  const handleAction = async (action: AIActionType) => {
    setLastAction(action);
    reset();
    await generate({
      action,
      novelTitle,
      chapterTitle,
      chapterContent: getContent(),
      selectedText: action === "polish" ? getSelectedText() : undefined,
      provider,
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
        </div>
        {lastAction === "polish" && (
          <p className="text-xs text-muted-foreground">润色：选中文字后点击润色</p>
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
    </div>
  );
}
