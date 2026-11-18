import React from "react";
import { FileText, Globe } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";
import type { ToolType } from "../../types/index";
import { TOOL_THEMES } from "../tools/toolTheme";

interface NavbarProps {
  onGoHome?: () => void;
  activeToolTitle?: string;
  activeToolId?: ToolType | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onGoHome,
  activeToolTitle,
  activeToolId,
}) => {
  const { language, setLanguage, t } = useI18n();
  const theme = activeToolId ? TOOL_THEMES[activeToolId] : null;

  return (
    <header className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <button
          onClick={onGoHome}
          className="flex cursor-pointer items-center gap-3 group text-left transition-opacity hover:opacity-90"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:bg-orange-600 transition-all">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                {t.appName}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {t.appBadge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </button>

        {activeToolTitle && (
          <div className="hidden md:flex items-center gap-2 text-sm text-zinc-400">
            <span>{t.activeToolLabel}</span>
            <span
              className={`font-medium px-2.5 py-1 rounded-lg border shadow-sm ${
                theme
                  ? `${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`
                  : "text-zinc-200 bg-zinc-800 border-zinc-700"
              }`}
            >
              {activeToolTitle}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onGoHome}
            className="text-xs cursor-pointer sm:text-sm font-medium text-zinc-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            {t.allTools}
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            <Globe className="w-4 h-4 text-zinc-400 hidden sm:inline" />
            <div className="flex items-center rounded-lg bg-zinc-800 p-0.5 border border-zinc-700 shadow-inner">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === "en"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 cursor-pointer"
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("es")}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === "es"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200 cursor-pointer"
                }`}
                aria-label="Cambiar a Español"
              >
                ES
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
