"use client";

import { useState, useEffect } from "react";
import { Chapter } from "@/types";

export function useChapters(novelId: string) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChapters = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/novels/${novelId}/chapters`);
      if (!res.ok) throw new Error("Failed to fetch chapters");
      const data = await res.json();
      setChapters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
  }, [novelId]);

  const createChapter = async (title: string) => {
    const res = await fetch(`/api/novels/${novelId}/chapters`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to create chapter");
    }
    const chapter = await res.json();
    setChapters((prev) => [...prev, chapter]);
    return chapter as Chapter;
  };

  const deleteChapter = async (chapterId: string) => {
    const res = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete chapter");
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
  };

  return { chapters, isLoading, error, createChapter, deleteChapter, refetch: fetchChapters };
}
