import React from "react";
import { Loader2 } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";

interface ProgressIndicatorProps {
  progress?: number;
  step?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress = 0,
  step,
}) => {
  const { t } = useI18n();
  const displayStep = step || t.progress.defaultStep;

  return (
    <div className="w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2.5 text-zinc-200 font-medium">
          <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
          <span>{displayStep}</span>
        </div>
        <span className="text-xs font-mono text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
          {progress}%
        </span>
      </div>

      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50 shadow-inner">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-300 ease-out shadow-sm"
          style={{ width: `${Math.max(5, progress)}%` }}
        />
      </div>

      <p className="text-xs text-zinc-500 text-center">
        {t.progress.waitMessage}
      </p>
    </div>
  );
};
