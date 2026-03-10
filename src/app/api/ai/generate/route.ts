import { NextRequest, NextResponse } from "next/server";
import { getAIProvider } from "@/lib/ai/factory";
import { AIGenerateRequest } from "@/types";

function buildPrompts(body: AIGenerateRequest): {
  systemPrompt: string;
  userPrompt: string;
} {
  const novelTitle = body.novelTitle ?? "未命名小说";
  const chapterTitle = body.chapterTitle ?? "未命名章节";

  let characterContext = "";
  if (body.characters) {
    try {
      const chars = JSON.parse(body.characters);
      if (Array.isArray(chars) && chars.length > 0) {
        const lines = chars.map((c: { name: string; role: string; description: string }) =>
          `- ${c.name}（${c.role}）：${c.description}`
        );
        characterContext = `\n\n主要角色：\n${lines.join("\n")}`;
      }
    } catch {
      // ignore parse error
    }
  }

  switch (body.action) {
    case "generate":
      return {
        systemPrompt: `你是小说创作助手，书名《${novelTitle}》。${characterContext}只输出正文，不要任何解释或标题。`,
        userPrompt: `为章节《${chapterTitle}》写一段精彩的开头，约300字。`,
      };
    case "continue": {
      const last500 = body.chapterContent?.slice(-500) ?? "";
      return {
        systemPrompt: `你是小说创作助手，书名《${novelTitle}》。${characterContext}只输出正文，不要任何解释。`,
        userPrompt: `续写以下内容的后续，保持风格一致，约300字：\n\n${last500}`,
      };
    }
    case "polish":
      return {
        systemPrompt: `你是文字编辑，改善表达和节奏，不改变含义。只输出润色后的文字。`,
        userPrompt: `润色这段文字：\n\n${body.selectedText ?? ""}`,
      };
    default:
      throw new Error(`Unknown action: ${body.action}`);
  }
}

export async function POST(request: NextRequest) {
  const body: AIGenerateRequest = await request.json();

  const provider = getAIProvider(body.provider);
  const { systemPrompt, userPrompt } = buildPrompts(body);

  let stream: ReadableStream<string>;
  try {
    stream = await provider.generateStream({ systemPrompt, userPrompt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      const reader = stream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            break;
          }
          controller.enqueue(encoder.encode(`data: ${value}\n\n`));
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        controller.enqueue(encoder.encode(`data: [ERROR] ${message}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
