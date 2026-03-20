"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardCharacter {
  name: string;
  description: string;
  role: "protagonist" | "supporting";
}

interface StepCharactersProps {
  characters: WizardCharacter[];
  onChange: (characters: WizardCharacter[]) => void;
  isStreaming: boolean;
  streamedText: string;
}

export function StepCharacters({ characters, onChange, isStreaming, streamedText }: StepCharactersProps) {
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const protagonists = characters.filter((c) => c.role === "protagonist");
  const supporting = characters.filter((c) => c.role === "supporting");

  const removeCharacter = (index: number) => {
    onChange(characters.filter((_, i) => i !== index));
  };

  const startEdit = (index: number) => {
    setEditIdx(index);
    setEditName(characters[index].name);
    setEditDesc(characters[index].description);
  };

  const saveEdit = () => {
    if (editIdx === null || !editName.trim()) return;
    const updated = [...characters];
    updated[editIdx] = { ...updated[editIdx], name: editName.trim(), description: editDesc.trim() };
    onChange(updated);
    setEditIdx(null);
  };

  const addCharacter = (role: "protagonist" | "supporting") => {
    const newChar: WizardCharacter = { name: "新角色", description: "角色描述", role };
    const updated = [...characters, newChar];
    onChange(updated);
    startEdit(updated.length - 1);
  };

  if (isStreaming) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold">角色设定</h3>
          <p className="text-sm text-muted-foreground">AI正在为您设计角色...</p>
        </div>
        <div className="flex items-center justify-center gap-2 text-orange-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">AI生成中...</span>
        </div>
        <div className="p-4 rounded-lg border bg-muted/50 min-h-[200px] whitespace-pre-wrap text-sm">
          {streamedText || "正在思考..."}
        </div>
      </div>
    );
  }

  const renderCharacterSection = (title: string, chars: WizardCharacter[], role: "protagonist" | "supporting") => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-muted-foreground">{title}</h4>
      <div className="flex flex-wrap gap-2 items-center">
        {chars.map((c) => {
          const globalIdx = characters.indexOf(c);
          if (editIdx === globalIdx) {
            return (
              <div key={globalIdx} className="flex items-center gap-1 p-1 rounded border bg-background">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-7 w-20 text-xs"
                  placeholder="名字"
                  autoFocus
                />
                <Input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="h-7 w-32 text-xs"
                  placeholder="描述"
                />
                <Button variant="ghost" size="sm" onClick={saveEdit} className="h-7 text-xs">
                  确定
                </Button>
              </div>
            );
          }
          return (
            <div
              key={globalIdx}
              onClick={() => startEdit(globalIdx)}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full border cursor-pointer transition-colors",
                "hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20",
                c.role === "protagonist" ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20" : "border-muted"
              )}
            >
              <span className="text-sm font-medium">{c.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeCharacter(globalIdx);
                }}
                className="ml-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <Button
          variant="default"
          size="sm"
          onClick={() => addCharacter(role)}
          className="h-8 rounded-full gap-1 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="h-3 w-3" /> 新增
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">角色设定</h3>
        <p className="text-sm text-muted-foreground">AI已为您生成了主角和配角，点击角色标签可以查看和修改详细信息</p>
      </div>
      {renderCharacterSection("主角", protagonists, "protagonist")}
      {renderCharacterSection("配角", supporting, "supporting")}
      {characters.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">暂无角色，请添加或等待AI生成</p>
      )}
    </div>
  );
}
