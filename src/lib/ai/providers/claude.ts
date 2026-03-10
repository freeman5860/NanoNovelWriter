import Anthropic from "@anthropic-ai/sdk";
import { AIProvider, GenerateParams } from "../types";

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    this.client = new Anthropic({ apiKey });
  }

  async generateStream(params: GenerateParams): Promise<ReadableStream<string>> {
    const stream = await this.client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: params.maxTokens ?? 2048,
      system: params.systemPrompt,
      messages: [{ role: "user", content: params.userPrompt }],
    });

    return new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(chunk.delta.text);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  }
}
