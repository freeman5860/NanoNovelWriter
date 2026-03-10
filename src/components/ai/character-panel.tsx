"use client";

import { useState } from "react";
import { Character } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  characters: Character[];
  onChange: (characters: Character[]) => void;
}

export function CharacterPanel({ characters, onChange }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onChange([...characters, { name: name.trim(), role: role.trim(), description: description.trim() }]);
    setName("");
    setRole("");
    setDescription("");
    setAddOpen(false);
  };

  const handleRemove = (index: number) => {
    onChange(characters.filter((_, i) => i !== index));
  };

  return (
    <div className="border-b">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded((v) => !v)}
      >
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          角色设定
          {characters.length > 0 && (
            <span className="text-xs text-muted-foreground">({characters.length})</span>
          )}
        </span>
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {characters.length === 0 ? (
            <p className="text-xs text-muted-foreground py-1">还没有角色，AI 生成时会更贴合设定</p>
          ) : (
            <div className="space-y-1.5">
              {characters.map((char, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md bg-muted/50 px-2 py-1.5 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {char.name}
                      {char.role && <span className="text-muted-foreground font-normal ml-1">· {char.role}</span>}
                    </p>
                    {char.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{char.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemove(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-destructive shrink-0 mt-0.5"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs h-7" onClick={() => setAddOpen(true)}>
            <Plus className="h-3 w-3" />
            添加角色
          </Button>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加角色</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">姓名 *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="角色姓名"
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">身份/职位</label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="如：主角、反派、导师"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">角色描述</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="外貌、性格、背景等"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>取消</Button>
              <Button onClick={handleAdd} disabled={!name.trim()}>添加</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
