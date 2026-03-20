export interface Novel {
  id: string;
  title: string;
  description: string | null;
  genre: string | null;
  aiProvider: string | null;
  aiModel: string | null;
  characters: string | null;
  outline: string | null;
  wordGoal: number | null;
  novelType: string | null;
  audience: string | null;
  concept: string | null;
  background: string | null;
  plotSummary: string | null;
  highlights: string | null;
  targetChapters: number | null;
  totalWordCount?: number;
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
  novelType?: string;
  audience?: string;
  concept?: string;
}

export interface UpdateNovelInput {
  title?: string;
  description?: string;
  genre?: string;
  aiProvider?: string;
  aiModel?: string;
  characters?: string;
  outline?: string;
  wordGoal?: number | null;
  background?: string;
  plotSummary?: string;
  highlights?: string;
  targetChapters?: number;
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

export type AIActionType =
  | "generate"
  | "continue"
  | "polish"
  | "outline"
  | "dialogue"
  | "wizard-background"
  | "wizard-characters"
  | "wizard-plot"
  | "wizard-highlights";

export interface AIGenerateRequest {
  action: AIActionType;
  chapterContent?: string;
  selectedText?: string;
  novelTitle?: string;
  novelDescription?: string;
  novelGenre?: string;
  chapterTitle?: string;
  chapterTitles?: string[];
  provider?: string;
  characters?: string;
  dialogueCharacters?: string[];
  novelType?: string;
  audience?: string;
  concept?: string;
  background?: string;
  plotSummary?: string;
  targetChapters?: number;
}
