"use client";

import { useReducer, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAIStream } from "@/hooks/use-ai-stream";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WizardStepIndicator } from "./wizard-step-indicator";
import { WizardNavigation } from "./wizard-navigation";
import { StepTypeSelection } from "./steps/step-type-selection";
import { StepAudience } from "./steps/step-audience";
import { StepConcept } from "./steps/step-concept";
import { StepChapters } from "./steps/step-chapters";
import { StepBackground } from "./steps/step-background";
import { StepCharacters, WizardCharacter } from "./steps/step-characters";
import { StepPlot } from "./steps/step-plot";
import { StepHighlights } from "./steps/step-highlights";
import { Novel } from "@/types";

// --- State ---

interface WizardState {
  open: boolean;
  phase: 1 | 2;
  step: number;
  novelType: string | null;
  audience: string | null;
  concept: string;
  title: string;
  novelId: string | null;
  targetChapters: number;
  background: string;
  characters: WizardCharacter[];
  plotSummary: string;
  highlights: string;
  isSubmitting: boolean;
  error: string;
  aiTriggered: Record<string, boolean>;
}

const initialState: WizardState = {
  open: false,
  phase: 1,
  step: 0,
  novelType: null,
  audience: null,
  concept: "",
  title: "",
  novelId: null,
  targetChapters: 100,
  background: "",
  characters: [],
  plotSummary: "",
  highlights: "",
  isSubmitting: false,
  error: "",
  aiTriggered: {},
};

type Action =
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "SET_FIELD"; field: string; value: unknown }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "START_PHASE_2"; novelId: string }
  | { type: "SET_SUBMITTING"; value: boolean }
  | { type: "SET_ERROR"; value: string }
  | { type: "MARK_AI_TRIGGERED"; key: string }
  | { type: "RESET" };

function reducer(state: WizardState, action: Action): WizardState {
  switch (action.type) {
    case "OPEN":
      return { ...initialState, open: true };
    case "CLOSE":
      return { ...state, open: false };
    case "RESET":
      return initialState;
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "NEXT_STEP":
      return { ...state, step: state.step + 1 };
    case "PREV_STEP":
      return { ...state, step: Math.max(0, state.step - 1) };
    case "START_PHASE_2":
      return { ...state, phase: 2, step: 0, novelId: action.novelId };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.value };
    case "SET_ERROR":
      return { ...state, error: action.value };
    case "MARK_AI_TRIGGERED":
      return { ...state, aiTriggered: { ...state.aiTriggered, [action.key]: true } };
    default:
      return state;
  }
}

// --- Config ---

const phase1Steps = [
  { label: "类型" },
  { label: "读者" },
  { label: "构思" },
];

const phase2Steps = [
  { label: "章节" },
  { label: "背景" },
  { label: "角色" },
  { label: "情节" },
  { label: "亮点" },
];

const phase2Messages = [
  "还差4步了哦，故事即将诞生！",
  "正在快马加鞭赶来！",
  "马上就要大功告成啦！",
  "还差1步哦，马上就要大功告成！",
  "最后一步啦，确认无误后点击完成！",
];

function getProgressMessage(phase: number, step: number): string {
  if (phase === 1) {
    const remaining = 3 - step;
    if (remaining <= 1) return "最后一步啦！";
    return `还差${remaining}步，你的故事即将诞生！`;
  }
  return phase2Messages[step] || "";
}

// --- Component ---

interface CreateNovelWizardProps {
  onCreate: (data: {
    title: string;
    description?: string;
    genre?: string;
    novelType?: string;
    audience?: string;
    concept?: string;
  }) => Promise<Novel>;
}

export function CreateNovelWizard({ onCreate }: CreateNovelWizardProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const ai = useAIStream();

  // Refs to avoid stale closures in async handlers
  const stateRef = useRef(state);
  stateRef.current = state;
  const aiTriggerRef = useRef(state.aiTriggered);
  aiTriggerRef.current = state.aiTriggered;

  const derivedTitle = state.concept.slice(0, 20) || "未命名小说";

  // --- AI auto-trigger for phase 2 ---
  const triggerAI = useCallback(
    (step: number) => {
      const keys = ["background", "characters", "plot", "highlights"];
      const key = keys[step - 1];
      if (!key || aiTriggerRef.current[key] || ai.isStreaming) return;

      dispatch({ type: "MARK_AI_TRIGGERED", key });
      const s = stateRef.current;

      switch (key) {
        case "background":
          ai.reset();
          ai.generate(
            {
              action: "wizard-background",
              audience: s.audience ?? undefined,
              concept: s.concept,
              targetChapters: s.targetChapters,
            },
            undefined,
            (fullText) => dispatch({ type: "SET_FIELD", field: "background", value: fullText })
          );
          break;
        case "characters":
          ai.reset();
          ai.generate(
            {
              action: "wizard-characters",
              audience: s.audience ?? undefined,
              concept: s.concept,
              background: s.background,
            },
            undefined,
            (fullText) => {
              try {
                const parsed = JSON.parse(fullText);
                const chars: WizardCharacter[] = [
                  ...(parsed.protagonists || []).map((c: { name: string; description: string }) => ({
                    name: c.name,
                    description: c.description,
                    role: "protagonist" as const,
                  })),
                  ...(parsed.supporting || []).map((c: { name: string; description: string }) => ({
                    name: c.name,
                    description: c.description,
                    role: "supporting" as const,
                  })),
                ];
                dispatch({ type: "SET_FIELD", field: "characters", value: chars });
              } catch {
                // If JSON parsing fails, keep empty characters
              }
            }
          );
          break;
        case "plot":
          ai.reset();
          ai.generate(
            {
              action: "wizard-plot",
              concept: s.concept,
              background: s.background,
              characters: JSON.stringify(
                s.characters.map((c) => ({
                  name: c.name,
                  role: c.role === "protagonist" ? "主角" : "配角",
                  description: c.description,
                }))
              ),
              targetChapters: s.targetChapters,
            },
            undefined,
            (fullText) => dispatch({ type: "SET_FIELD", field: "plotSummary", value: fullText })
          );
          break;
        case "highlights":
          ai.reset();
          ai.generate(
            {
              action: "wizard-highlights",
              concept: s.concept,
              background: s.background,
              plotSummary: s.plotSummary,
            },
            undefined,
            (fullText) => dispatch({ type: "SET_FIELD", field: "highlights", value: fullText })
          );
          break;
      }
    },
    [ai]
  );

  // Auto-trigger AI when entering AI steps in phase 2
  useEffect(() => {
    if (state.phase === 2 && state.step >= 1) {
      triggerAI(state.step);
    }
  }, [state.phase, state.step, triggerAI]);

  // --- Handlers ---

  const handleCreateNovel = async () => {
    // Capture novelType before any async work to avoid stale closure
    const novelType = stateRef.current.novelType;
    dispatch({ type: "SET_SUBMITTING", value: true });
    dispatch({ type: "SET_ERROR", value: "" });
    try {
      const novel = await onCreate({
        title: derivedTitle,
        novelType: novelType ?? undefined,
        audience: stateRef.current.audience ?? undefined,
        concept: stateRef.current.concept || undefined,
      });
      if (novelType === "short") {
        dispatch({ type: "CLOSE" });
        router.push(`/novels/${novel.id}`);
      } else {
        dispatch({ type: "START_PHASE_2", novelId: novel.id });
      }
    } catch (err) {
      dispatch({ type: "SET_ERROR", value: err instanceof Error ? err.message : "创建失败" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const handleFinish = async () => {
    const novelId = stateRef.current.novelId;
    if (!novelId) return;
    dispatch({ type: "SET_SUBMITTING", value: true });
    dispatch({ type: "SET_ERROR", value: "" });
    try {
      const s = stateRef.current;
      const charactersJson = JSON.stringify(
        s.characters.map((c) => ({
          name: c.name,
          role: c.role === "protagonist" ? "主角" : "配角",
          description: c.description,
        }))
      );
      const res = await fetch(`/api/novels/${novelId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          background: s.background,
          plotSummary: s.plotSummary,
          highlights: s.highlights,
          targetChapters: s.targetChapters,
          characters: charactersJson,
        }),
      });
      if (!res.ok) throw new Error("保存失败");
      dispatch({ type: "CLOSE" });
      router.push(`/novels/${novelId}`);
    } catch (err) {
      dispatch({ type: "SET_ERROR", value: err instanceof Error ? err.message : "保存失败" });
    } finally {
      dispatch({ type: "SET_SUBMITTING", value: false });
    }
  };

  const handleNext = () => {
    if (state.phase === 1) {
      if (state.step === 2) {
        handleCreateNovel();
        return;
      }
      dispatch({ type: "NEXT_STEP" });
    } else {
      if (state.step === 4) {
        handleFinish();
        return;
      }
      dispatch({ type: "NEXT_STEP" });
    }
  };

  const handleBack = () => dispatch({ type: "PREV_STEP" });

  const handleSkipToManual = (field: string) => {
    dispatch({ type: "MARK_AI_TRIGGERED", key: field });
  };

  // --- Validation ---

  const isNextDisabled = (): boolean => {
    if (state.phase === 1) {
      if (state.step === 0) return !state.novelType;
      if (state.step === 1) return !state.audience;
      if (state.step === 2) return !state.concept.trim();
    }
    if (state.phase === 2) {
      if (ai.isStreaming) return true;
    }
    return false;
  };

  // --- Render steps ---

  const renderPhase1Step = () => {
    switch (state.step) {
      case 0:
        return (
          <StepTypeSelection
            value={state.novelType}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "novelType", value: v })}
          />
        );
      case 1:
        return (
          <StepAudience
            value={state.audience}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "audience", value: v })}
          />
        );
      case 2:
        return (
          <StepConcept
            value={state.concept}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "concept", value: v })}
          />
        );
      default:
        return null;
    }
  };

  const renderPhase2Step = () => {
    switch (state.step) {
      case 0:
        return (
          <StepChapters
            value={state.targetChapters}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "targetChapters", value: v })}
          />
        );
      case 1:
        return (
          <StepBackground
            value={state.background}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "background", value: v })}
            isStreaming={ai.isStreaming}
            streamedText={ai.streamedText}
          />
        );
      case 2:
        return (
          <StepCharacters
            characters={state.characters}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "characters", value: v })}
            isStreaming={ai.isStreaming}
            streamedText={ai.streamedText}
          />
        );
      case 3:
        return (
          <StepPlot
            value={state.plotSummary}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "plotSummary", value: v })}
            isStreaming={ai.isStreaming}
            streamedText={ai.streamedText}
          />
        );
      case 4:
        return (
          <StepHighlights
            value={state.highlights}
            onChange={(v) => dispatch({ type: "SET_FIELD", field: "highlights", value: v })}
            isStreaming={ai.isStreaming}
            streamedText={ai.streamedText}
          />
        );
      default:
        return null;
    }
  };

  const getNextLabel = (): string => {
    if (state.phase === 1 && state.step === 2) return "确认并生成模板";
    if (state.phase === 2) {
      switch (state.step) {
        case 0: return "下一步: 生成故事背景";
        case 1: return "下一步: 生成角色";
        case 2: return "下一步: 生成情节";
        case 3: return "下一步: 生成亮点";
        case 4: return "完成";
      }
    }
    return "下一步";
  };

  const getSkipInfo = (): { label: string; field: string } | null => {
    if (state.phase === 2) {
      if (state.step === 0) return { label: "我已有故事背景，点击直接填写", field: "background" };
      if (state.step === 1) return { label: "我已有角色，点击直接填写", field: "characters" };
      if (state.step === 2) return { label: "我已有故事情节，点击直接填写", field: "plot" };
      if (state.step === 3) return { label: "我已有亮点&简介，点击直接填写", field: "highlights" };
    }
    return null;
  };

  const steps = state.phase === 1 ? phase1Steps : phase2Steps;
  const skipInfo = getSkipInfo();

  return (
    <>
      <Button onClick={() => dispatch({ type: "OPEN" })}>
        <Plus className="mr-2 h-4 w-4" />
        新建小说
      </Button>
      <Dialog open={state.open} onOpenChange={(open) => !open && dispatch({ type: "CLOSE" })}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {state.phase === 1 ? "创建新小说" : "生成大纲"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <WizardStepIndicator
              steps={steps}
              currentStep={state.step}
              message={getProgressMessage(state.phase, state.step)}
            />

            {state.phase === 1 ? renderPhase1Step() : renderPhase2Step()}

            {state.error && <p className="text-sm text-destructive">{state.error}</p>}
            {ai.error && <p className="text-sm text-destructive">AI错误: {ai.error}</p>}

            <WizardNavigation
              onBack={state.step > 0 ? handleBack : undefined}
              onNext={handleNext}
              nextLabel={getNextLabel()}
              nextDisabled={isNextDisabled()}
              isLoading={state.isSubmitting}
              showBack={state.step > 0}
              skipLabel={skipInfo?.label}
              onSkip={skipInfo ? () => handleSkipToManual(skipInfo.field) : undefined}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
