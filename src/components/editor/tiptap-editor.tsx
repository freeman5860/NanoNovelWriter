"use client";

import { useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

interface Props {
  content: string;
  onUpdate: (json: string, wordCount: number) => void;
  className?: string;
}

export function TipTapEditor({ content, onUpdate, className }: Props) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "开始写作...",
      }),
      CharacterCount,
    ],
    content: content ? JSON.parse(content) : undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral dark:prose-invert max-w-none min-h-[calc(100vh-12rem)] focus:outline-none px-8 py-6 text-base leading-relaxed",
      },
    },
    onUpdate({ editor }) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        const json = JSON.stringify(editor.getJSON());
        const wordCount = editor.storage.characterCount.words();
        onUpdate(json, wordCount);
      }, 1500);
    },
  });

  // Append streamed text
  const appendText = useCallback(
    (text: string) => {
      if (!editor) return;
      editor.commands.insertContent(text);
    },
    [editor]
  );

  // Expose appendText via ref-style attribute on DOM
  useEffect(() => {
    if (!editor) return;
    // Store on window for AISidebar access (same page)
    (window as Window & { __tiptapAppend?: (t: string) => void }).__tiptapAppend = appendText;
    return () => {
      delete (window as Window & { __tiptapAppend?: (t: string) => void }).__tiptapAppend;
    };
  }, [editor, appendText]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div className={className}>
      <EditorContent editor={editor} />
    </div>
  );
}

export { useEditor };
export type { Editor } from "@tiptap/react";
