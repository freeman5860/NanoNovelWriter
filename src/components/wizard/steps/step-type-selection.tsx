"use client";

import { cn } from "@/lib/utils";
import { BookOpen, FileText } from "lucide-react";

interface StepTypeSelectionProps {
  value: string | null;
  onChange: (value: string) => void;
}

const types = [
  {
    id: "long",
    icon: BookOpen,
    title: "长篇小说",
    description: "适合10万字以上的长篇创作，AI将辅助生成完整大纲",
  },
  {
    id: "short",
    icon: FileText,
    title: "短篇小说",
    description: "适合短篇故事创作，快速开始写作",
  },
];

export function StepTypeSelection({ value, onChange }: StepTypeSelectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">选择小说类型</h3>
        <p className="text-sm text-muted-foreground">请选择你要创作的小说类型</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {types.map((t) => {
          const Icon = t.icon;
          const selected = value === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center",
                selected
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : "border-muted hover:border-orange-300"
              )}
            >
              <Icon className={cn("h-10 w-10", selected ? "text-orange-500" : "text-muted-foreground")} />
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
