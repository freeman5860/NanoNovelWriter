"use client";

import { useState, useRef, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { EditorToolbar } from "./editor-toolbar";
import { ChapterSidebar } from "@/components/chapters/chapter-sidebar";
import { AISidebar } from "@/components/ai/ai-sidebar";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import Link from "next/link";

interface Props {
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterTitle: string;
  initialContent: string;
  aiProvider?: string | null;
  initialCharacters?: string | null;
}

export function EditorPage({
  novelId,
  novelTitle,
  chapterId,
  chapterTitle,
  initialContent,
  aiProvider,
  initialCharacters,
}: Props) {
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "开始写作..." }),
      CharacterCount,
    ],
    content: initialContent ? JSON.parse(initialContent) : undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[calc(100vh-8rem)] focus:outline-none px-8 py-6 text-base leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      setSaveStatus("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          const json = JSON.stringify(editor.getJSON());
          const wordCount = editor.storage.characterCount.words();
          const res = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: json, wordCount }),
          });
          if (!res.ok) throw new Error("保存失败");
          setSaveStatus("saved");
        } catch {
          setSaveStatus("idle");
          toast.error("自动保存失败，请检查网络");
        }
      }, 1500);
    },
  });

  const getContent = useCallback(() => {
    if (!editor) return "";
    return editor.getText();
  }, [editor]);

  const getSelectedText = useCallback(() => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to, " ");
  }, [editor]);

  const handleInsert = useCallback(
    (text: string) => {
      if (!editor) return;
      editor.chain().focus().insertContent(text).run();
    },
    [editor]
  );

  const wordCount = editor?.storage.characterCount.words() ?? 0;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chapter sidebar */}
      <aside className="w-56 border-r flex flex-col shrink-0 hidden md:flex">
        <div className="px-3 py-2 border-b">
          <Link href={`/novels/${novelId}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← 返回小说
          </Link>
        </div>
        <ChapterSidebar
          novelId={novelId}
          novelTitle={novelTitle}
          activeChapterId={chapterId}
        />
      </aside>

      {/* Main editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="border-b">
          <EditorToolbar editor={editor} />
        </div>

        {/* Chapter title + status */}
        <div className="flex items-center justify-between px-8 py-2 border-b bg-muted/30">
          <h1 className="text-sm font-medium truncate">{chapterTitle}</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
            <span>{wordCount} 字</span>
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                保存中
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-green-600">
                <Check className="h-3 w-3" />
                已保存
              </span>
            )}
          </div>
        </div>

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* AI sidebar */}
      <aside className="w-64 border-l flex flex-col shrink-0">
        <AISidebar
          novelId={novelId}
          novelTitle={novelTitle}
          chapterTitle={chapterTitle}
          initialCharacters={initialCharacters ?? null}
          getContent={getContent}
          getSelectedText={getSelectedText}
          onInsert={handleInsert}
          provider={aiProvider ?? undefined}
        />
      </aside>
    </div>
  );
}
