import { AIProvider } from "./types";
import { GeminiProvider } from "./providers/gemini";
import { ClaudeProvider } from "./providers/claude";

export function getAIProvider(name?: string): AIProvider {
  const p = name ?? process.env.AI_PROVIDER ?? "gemini";
  switch (p) {
    case "gemini":
      return new GeminiProvider();
    case "claude":
      return new ClaudeProvider();
    default:
      throw new Error(`Unknown AI provider: ${p}`);
  }
}
