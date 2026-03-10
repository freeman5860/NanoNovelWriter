export interface GenerateParams {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
}

export interface AIProvider {
  generateStream(params: GenerateParams): Promise<ReadableStream<string>>;
}
