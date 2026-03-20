"use client";

import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

interface StepPlotProps {
  value: string;
  onChange: (value: string) => void;
  isStreaming: boolean;
  streamedText: string;
}

export function StepPlot({ value, onChange, isStreaming, streamedText }: StepPlotProps) {
  const displayText = isStreaming ? streamedText : value;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">故事主要情节</h3>
        <p className="text-sm text-muted-foreground">
          {isStreaming ? "AI正在为您生成故事主要情节..." : "AI已为您生成了故事主要情节，您可以查看并修改"}
        </p>
      </div>
      {isStreaming ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-orange-500">
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
              if (e.target.value.length <= 5000) onChange(e.target.value);
            }}
            rows={12}
            className="resize-none"
            placeholder="故事情节梗概..."
          />
          <p className="text-xs text-muted-foreground">
            最多5000字，当前：{displayText.length}/5000
          </p>
        </div>
      )}
    </div>
  );
}
