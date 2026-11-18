import { useState, useMemo } from "react";
import {
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import type { ToolDefinition, ToolType } from "./types/index";
import { Navbar } from "./components/common/Navbar";
import { ToolCard } from "./components/tools/ToolCard";
import { ToolWorkspace } from "./components/tools/ToolWorkspace";
import { LanguageProvider, useI18n } from "./i18n/LanguageContext";
import { api } from "./services/api";

function AppContent() {
  const { t } = useI18n();
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(null);
  const [isCleaningStorage, setIsCleaningStorage] = useState(false);
  const [storageCleanedSuccess, setStorageCleanedSuccess] = useState(false);

  const handleCleanStorage = async () => {
    setIsCleaningStorage(true);
    try {
      await api.cleanStorage();
      setStorageCleanedSuccess(true);
      setTimeout(() => setStorageCleanedSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to clean storage:", err);
    } finally {
      setIsCleaningStorage(false);
    }
  };

  const tools: ToolDefinition[] = useMemo(
    () => [
      {
        id: "pdf-to-images",
        title: t.tools.pdfToImages.title,
        badge: t.tools.pdfToImages.badge,
        description: t.tools.pdfToImages.description,
        acceptedTypes: [".pdf", "application/pdf"],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: "extract-pdf-images",
        title: t.tools.extractPdfImages.title,
        badge: t.tools.extractPdfImages.badge,
        description: t.tools.extractPdfImages.description,
        acceptedTypes: [".pdf", "application/pdf"],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: "images-to-pdf",
        title: t.tools.imagesToPdf.title,
        badge: t.tools.imagesToPdf.badge,
        description: t.tools.imagesToPdf.description,
        acceptedTypes: [".png", ".jpg", ".jpeg", "image/png", "image/jpeg"],
        multipleFiles: true,
        minFiles: 1,
      },
      {
        id: "merge-pdf",
        title: t.tools.mergePdf.title,
        badge: t.tools.mergePdf.badge,
        description: t.tools.mergePdf.description,
        acceptedTypes: [".pdf", "application/pdf"],
        multipleFiles: true,
        minFiles: 2,
      },
      {
        id: "split-pdf",
        title: t.tools.splitPdf.title,
        badge: t.tools.splitPdf.badge,
        description: t.tools.splitPdf.description,
        acceptedTypes: [".pdf", "application/pdf"],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: "extract-pdf-text",
        title: t.tools.extractPdfText.title,
        badge: t.tools.extractPdfText.badge,
        description: t.tools.extractPdfText.description,
        acceptedTypes: [".pdf", "application/pdf"],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: "pdf-to-word",
        title: t.tools.pdfToWord.title,
        badge: t.tools.pdfToWord.badge,
        description: t.tools.pdfToWord.description,
        acceptedTypes: [".pdf", "application/pdf"],
        multipleFiles: false,
        minFiles: 1,
      },
    ],
    [t],
  );

  const activeTool = tools.find((tItem) => tItem.id === activeToolId);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <Navbar
        onGoHome={() => setActiveToolId(null)}
        activeToolTitle={activeTool?.title}
        activeToolId={activeToolId}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTool ? (
          <ToolWorkspace
            tool={activeTool}
            onBack={() => setActiveToolId(null)}
          />
        ) : (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                {t.heroSubtitle}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5 bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800 shadow-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.featurePrivate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800 shadow-md">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{t.featureQuality}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800 shadow-md">
                  <Lock className="w-4 h-4 text-orange-400" />
                  <span>{t.featureIsolated}</span>
                </div>
              </div>
            </div>

            {/* Tools Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {t.availableTools} ({tools.length})
                </h2>
                <span className="text-xs text-zinc-400">
                  {t.selectToolToStart}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {tools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    onSelect={(id) => setActiveToolId(id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-900 py-6 mt-12 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="font-semibold text-zinc-300">{t.appName}</span>
            <span>• {t.footerText}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-center md:text-right hidden sm:block">
              {t.footerPrivacy}
            </p>

            <button
              type="button"
              onClick={handleCleanStorage}
              disabled={isCleaningStorage}
              className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-rose-500/10 hover:text-rose-400 border border-zinc-700 hover:border-rose-500/30 text-xs font-medium text-zinc-300 transition-all shadow-md active:scale-95 disabled:opacity-50"
              title="/backend/storage"
            >
              {isCleaningStorage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-400" />
                  <span>{t.cleaningStorage}</span>
                </>
              ) : storageCleanedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.storageCleaned}</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.cleanStorage}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
