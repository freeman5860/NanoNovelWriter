"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { AIActionType } from "@/types";
import { cn } from "@/lib/utils";

const ACTION_LABELS: Record<AIActionType, string> = {
  generate: "生成开头",
  continue: "续写",
  polish: "润色",
};

interface Props {
  action: AIActionType;
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AiActionButton({ action, onClick, isLoading, disabled, className }: Props) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn("gap-1.5", className)}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5" />
      )}
      {ACTION_LABELS[action]}
    </Button>
  );
}
