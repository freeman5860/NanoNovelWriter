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
