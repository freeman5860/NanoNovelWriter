"use client";

import { Button } from "@/components/ui/button";

interface WizardNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  isLoading?: boolean;
  showBack?: boolean;
  skipLabel?: string;
  onSkip?: () => void;
}

export function WizardNavigation({
  onBack,
  onNext,
  nextLabel = "下一步",
  nextDisabled = false,
  isLoading = false,
  showBack = true,
  skipLabel,
  onSkip,
}: WizardNavigationProps) {
  return (
    <div className="flex flex-col gap-2 pt-4 border-t">
      <div className="flex justify-between items-center">
        {showBack && onBack ? (
          <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
            上一步
          </Button>
        ) : (
          <div />
        )}
        <Button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || isLoading}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {isLoading ? "处理中..." : nextLabel}
        </Button>
      </div>
      {skipLabel && onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-orange-500 hover:text-orange-600 underline text-center"
        >
          {skipLabel}
        </button>
      )}
    </div>
  );
}
