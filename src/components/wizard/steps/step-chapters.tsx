"use client";

import { Input } from "@/components/ui/input";

interface StepChaptersProps {
  value: number;
  onChange: (value: number) => void;
}

export function StepChapters({ value, onChange }: StepChaptersProps) {
  return (
    <div className="space-y-6 text-center">
      <div>
        <h3 className="text-lg font-semibold">章节规划</h3>
        <p className="text-sm text-muted-foreground">
          请输入您希望本小说大概要写多少章节，这将帮助我们生成更符合预期的大纲
        </p>
      </div>
      <div className="flex justify-center">
        <Input
          type="number"
          min={10}
          max={500}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0) onChange(v);
          }}
          className="w-40 text-center text-lg border-orange-300 focus-visible:ring-orange-500"
        />
      </div>
    </div>
  );
}
