"use client";

interface Props {
  text: string;
  isStreaming: boolean;
}

export function StreamingText({ text, isStreaming }: Props) {
  if (!text && !isStreaming) return null;

  return (
    <div className="rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground whitespace-pre-wrap">
      {text}
      {isStreaming && (
        <span className="inline-block h-4 w-0.5 bg-foreground ml-0.5 animate-pulse" />
      )}
    </div>
  );
}
