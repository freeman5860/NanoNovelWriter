"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  label: string;
}

interface WizardStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  message?: string;
}

export function WizardStepIndicator({ steps, currentStep, message }: WizardStepIndicatorProps) {
  return (
    <div className="space-y-4">
      {message && (
        <p className="text-sm text-orange-600 font-medium text-center">{message}</p>
      )}
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors",
                    isCompleted && "bg-orange-500 border-orange-500 text-white",
                    isCurrent && "bg-orange-500 border-orange-500 text-white",
                    !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 whitespace-nowrap",
                    (isCompleted || isCurrent) ? "text-orange-600 font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 mx-1 mt-[-1rem]",
                    i < currentStep ? "bg-orange-500" : "bg-muted-foreground/20"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
