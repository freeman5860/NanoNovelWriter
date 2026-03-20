"use client";

import { Textarea } from "@/components/ui/textarea";

interface StepConceptProps {
  value: string;
  onChange: (value: string) => void;
}

export function StepConcept({ value, onChange }: StepConceptProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">创意构思</h3>
        <p className="text-sm text-muted-foreground">描述你的小说核心创意，AI将基于此生成大纲</p>
      </div>
      <div className="space-y-2">
        <Textarea
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= 2000) onChange(e.target.value);
          }}
          placeholder={"例如：一个普通大学生意外获得了一本古老的修炼功法，从此踏上了修仙之路。在这个现代社会与修仙世界交织的故事中，他需要面对来自各方势力的挑战..."}
          rows={8}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/2000
        </p>
      </div>
    </div>
  );
}
