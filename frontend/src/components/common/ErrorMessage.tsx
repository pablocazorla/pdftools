import React from "react";
import { AlertCircle, X } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";

interface ErrorMessageProps {
  message: string;
  code?: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  code,
  onDismiss,
}) => {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 shadow-sm animate-in fade-in duration-200"
    >
      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1 text-sm">
        <p className="font-medium text-rose-200">{message}</p>
        {code && (
          <p className="text-xs text-rose-400/80 mt-1 font-mono">
            {t.errors.errorCode} {code}
          </p>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-400 hover:text-rose-200 p-1 rounded-lg hover:bg-rose-500/20 transition-colors cursor-pointer"
          aria-label={t.errors.dismiss}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
