import React from 'react';
import { FileText, Globe } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

interface NavbarProps {
  onGoHome?: () => void;
  activeToolTitle?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onGoHome, activeToolTitle }) => {
  const { language, setLanguage, t } = useI18n();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 group text-left transition-opacity hover:opacity-90"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">{t.appName}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {t.appBadge}
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </button>

        {activeToolTitle && (
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-400">
            <span>{t.activeToolLabel}</span>
            <span className="font-medium text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
              {activeToolTitle}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onGoHome}
            className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            {t.allTools}
          </button>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <Globe className="w-4 h-4 text-slate-400 hidden sm:inline" />
            <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700/80">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  language === 'es'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
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
