"use client";

import { cn } from "@/lib/utils";

interface StepAudienceProps {
  value: string | null;
  onChange: (value: string) => void;
}

const audiences = [
  {
    id: "male",
    title: "男频",
    tags: "玄幻 · 都市 · 历史",
    emoji: "🗡️",
  },
  {
    id: "female",
    title: "女频",
    tags: "言情 · 穿越 · 种田",
    emoji: "🌸",
  },
];

export function StepAudience({ value, onChange }: StepAudienceProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">选择目标读者</h3>
        <p className="text-sm text-muted-foreground">这将帮助AI更好地理解你的创作方向</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {audiences.map((a) => {
          const selected = value === a.id;
          return (
            <button
              key={a.id}
              onClick={() => onChange(a.id)}
              className={cn(
                "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center",
                selected
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-950/20"
                  : "border-muted hover:border-orange-300"
              )}
            >
              <span className="text-3xl">{a.emoji}</span>
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{a.tags}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
