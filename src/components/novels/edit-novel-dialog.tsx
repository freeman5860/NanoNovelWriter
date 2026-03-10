"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Novel } from "@/types";

interface Props {
  novel: Novel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, data: { title?: string; description?: string; genre?: string }) => Promise<Novel>;
}

export function EditNovelDialog({ novel, open, onOpenChange, onUpdate }: Props) {
  const [title, setTitle] = useState(novel.title);
  const [description, setDescription] = useState(novel.description ?? "");
  const [genre, setGenre] = useState(novel.genre ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(novel.title);
      setDescription(novel.description ?? "");
      setGenre(novel.genre ?? "");
      setError("");
    }
  }, [open, novel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("请输入小说标题");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await onUpdate(novel.id, {
        title: title.trim(),
        description: description || undefined,
        genre: genre || undefined,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新失败");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑小说</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">标题 *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="小说标题"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-genre">类型</Label>
            <Input
              id="edit-genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="如：玄幻、都市、科幻"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-description">简介</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="小说简介（可选）"
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
