"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StepChaptersProps {
  value: number;
  onChange: (value: number) => void;
}

export function StepChapters({ value, onChange }: StepChaptersProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">章节规划</h3>
        <p className="text-sm text-muted-foreground">设定目标章节数，AI将据此规划故事节奏</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="chapters">目标章节数</Label>
        <Input
          id="chapters"
          type="number"
          min={10}
          max={500}
          value={value}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v > 0) onChange(v);
          }}
          className="w-40"
        />
        <p className="text-xs text-muted-foreground">建议长篇小说 50-200 章</p>
      </div>
    </div>
  );
}
