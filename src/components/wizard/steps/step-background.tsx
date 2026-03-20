"use client";

import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface StepBackgroundProps {
  value: string;
  onChange: (value: string) => void;
  isStreaming: boolean;
  streamedText: string;
}

export function StepBackground({ value, onChange, isStreaming, streamedText }: StepBackgroundProps) {
  const displayText = isStreaming ? streamedText : value;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">故事背景</h3>
        <p className="text-sm text-muted-foreground">
          {isStreaming ? "AI正在生成故事背景..." : "你可以编辑AI生成的内容"}
        </p>
      </div>
      {isStreaming ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-orange-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">AI生成中...</span>
          </div>
          <div className="p-4 rounded-lg border bg-muted/50 min-h-[200px] whitespace-pre-wrap text-sm">
            {streamedText || "正在思考..."}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={displayText}
            onChange={(e) => {
              if (e.target.value.length <= 2000) onChange(e.target.value);
            }}
            rows={10}
            className="resize-none"
            placeholder="故事背景描述..."
          />
          <p className="text-xs text-muted-foreground text-right">
            {displayText.length}/2000
          </p>
        </div>
      )}
    </div>
  );
}
