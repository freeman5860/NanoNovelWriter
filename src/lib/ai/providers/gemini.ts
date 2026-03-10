import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider, GenerateParams } from "../types";

export class GeminiProvider implements AIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    const masked = apiKey.slice(0, 4) + "****" + apiKey.slice(-4);
    console.log("[GeminiProvider] GEMINI_API_KEY:", masked);
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generateStream(params: GenerateParams): Promise<ReadableStream<string>> {
    const model = this.client.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: params.systemPrompt,
    });

    const result = await model.generateContentStream(params.userPrompt);

    return new ReadableStream<string>({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) controller.enqueue(text);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
  }
}
