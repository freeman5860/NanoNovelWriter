"use client";

import { useState, useEffect } from "react";
import { Novel } from "@/types";

export function useNovels() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNovels = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/novels");
      if (!res.ok) throw new Error("Failed to fetch novels");
      const data = await res.json();
      setNovels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNovels();
  }, []);

  const createNovel = async (data: {
    title: string;
    description?: string;
    genre?: string;
  }) => {
    const res = await fetch("/api/novels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json();
      throw new Error(body.error ?? "Failed to create novel");
    }
    const novel = await res.json();
    setNovels((prev) => [novel, ...prev]);
    return novel as Novel;
  };

  const deleteNovel = async (id: string) => {
    const res = await fetch(`/api/novels/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete novel");
    setNovels((prev) => prev.filter((n) => n.id !== id));
  };

  const updateNovel = async (
    id: string,
    data: { title?: string; description?: string; genre?: string }
  ) => {
    const res = await fetch(`/api/novels/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update novel");
    const updated = await res.json();
    setNovels((prev) => prev.map((n) => (n.id === id ? { ...n, ...updated } : n)));
    return updated as Novel;
  };

  return { novels, isLoading, error, createNovel, deleteNovel, updateNovel, refetch: fetchNovels };
}
