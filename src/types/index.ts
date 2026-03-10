export interface Novel {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  characters: string | null;
  createdAt: Date;
  updatedAt: Date;
  chapters?: Chapter[];
}

export interface Chapter {
  id: string;
  novelId: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NovelWithChapters = Novel & {
  chapters: Chapter[];
};

export interface CreateNovelInput {
  title: string;
  description?: string;
  genre?: string;
  aiProvider?: string;
  aiModel?: string;
}

export interface UpdateNovelInput {
  title?: string;
  description?: string;
  genre?: string;
  aiProvider?: string;
  aiModel?: string;
  characters?: string;
}

export interface Character {
  name: string;
  role: string;
  description: string;
}

export interface CreateChapterInput {
  title: string;
}

export interface UpdateChapterInput {
  title?: string;
  content?: string;
  wordCount?: number;
}

export type AIActionType = "generate" | "continue" | "polish";

export interface AIGenerateRequest {
  action: AIActionType;
  chapterContent?: string;
  selectedText?: string;
  novelTitle?: string;
  chapterTitle?: string;
  provider?: string;
  characters?: string;
}
