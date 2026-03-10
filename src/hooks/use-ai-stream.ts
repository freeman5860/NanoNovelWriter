"use client";

import { useState, useCallback } from "react";
import { AIGenerateRequest } from "@/types";

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      request: AIGenerateRequest,
      onToken?: (token: string) => void,
      onDone?: (fullText: string) => void
    ) => {
      setIsStreaming(true);
      setStreamedText("");
      setError(null);

      let accumulated = "";

      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });

        if (!res.ok) {
          const body = await res.json();
          throw new Error(body.error ?? "AI generation failed");
        }

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6);
            if (data === "[DONE]") {
              onDone?.(accumulated);
              break;
            }
            if (data.startsWith("[ERROR]")) {
              throw new Error(data.slice(8));
            }
            accumulated += data;
            setStreamedText(accumulated);
            onToken?.(data);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
      } finally {
        setIsStreaming(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStreamedText("");
    setError(null);
  }, []);

  return { isStreaming, streamedText, error, generate, reset };
}
