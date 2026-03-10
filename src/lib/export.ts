import { Chapter } from "@/types";

export function exportAsFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsTxt(title: string, chapterTitle: string, text: string) {
  const content = `${title}\n${"=".repeat(title.length)}\n\n${chapterTitle}\n${"-".repeat(chapterTitle.length)}\n\n${text}`;
  exportAsFile(content, `${title}-${chapterTitle}.txt`, "text/plain;charset=utf-8");
}

export function exportAsMarkdown(title: string, chapterTitle: string, text: string) {
  const content = `# ${title}\n\n## ${chapterTitle}\n\n${text}`;
  exportAsFile(content, `${title}-${chapterTitle}.md`, "text/markdown;charset=utf-8");
}

// TipTap JSON node → plain text
function tiptapNodeToText(node: Record<string, unknown>): string {
  if (node.type === "text") return (node.text as string) ?? "";
  if (!node.content) return "";
  const children = (node.content as Record<string, unknown>[]).map(tiptapNodeToText).join("");
  const block = ["paragraph", "heading", "blockquote", "listItem", "bulletList", "orderedList"];
  return block.includes(node.type as string) ? children + "\n" : children;
}

// TipTap JSON node → Markdown
function tiptapNodeToMarkdown(node: Record<string, unknown>): string {
  if (node.type === "text") {
    let text = (node.text as string) ?? "";
    const marks = (node.marks as { type: string }[]) ?? [];
    if (marks.some((m) => m.type === "bold")) text = `**${text}**`;
    if (marks.some((m) => m.type === "italic")) text = `*${text}*`;
    return text;
  }
  if (!node.content) return "";
  const children = (node.content as Record<string, unknown>[]).map(tiptapNodeToMarkdown).join("");
  switch (node.type) {
    case "heading": {
      const level = (node.attrs as { level: number })?.level ?? 1;
      return `${"#".repeat(level)} ${children}\n\n`;
    }
    case "paragraph":
      return `${children}\n\n`;
    case "blockquote":
      return children
        .trim()
        .split("\n")
        .map((l) => `> ${l}`)
        .join("\n") + "\n\n";
    case "bulletList":
    case "orderedList":
      return children;
    case "listItem":
      return `- ${children.trim()}\n`;
    default:
      return children;
  }
}

function parseChapterContent(content: string): { toText: () => string; toMarkdown: () => string } {
  let doc: Record<string, unknown>;
  try {
    doc = JSON.parse(content);
  } catch {
    return { toText: () => content, toMarkdown: () => content };
  }
  return {
    toText: () =>
      (doc.content as Record<string, unknown>[])
        ?.map(tiptapNodeToText)
        .join("")
        .trim() ?? "",
    toMarkdown: () =>
      (doc.content as Record<string, unknown>[])
        ?.map(tiptapNodeToMarkdown)
        .join("")
        .trim() ?? "",
  };
}

export function exportNovelAsTxt(novelTitle: string, chapters: Chapter[]) {
  const separator = "\n\n" + "─".repeat(40) + "\n\n";
  const parts = [
    `${novelTitle}\n${"=".repeat(novelTitle.length)}`,
    ...chapters.map((ch) => {
      const text = parseChapterContent(ch.content).toText();
      return `${ch.title}\n${"-".repeat(ch.title.length)}\n\n${text}`;
    }),
  ];
  exportAsFile(parts.join(separator), `${novelTitle}.txt`, "text/plain;charset=utf-8");
}

export function exportNovelAsMarkdown(novelTitle: string, chapters: Chapter[]) {
  const parts = [
    `# ${novelTitle}`,
    ...chapters.map((ch) => {
      const md = parseChapterContent(ch.content).toMarkdown();
      return `## ${ch.title}\n\n${md}`;
    }),
  ];
  exportAsFile(parts.join("\n\n---\n\n"), `${novelTitle}.md`, "text/markdown;charset=utf-8");
}
