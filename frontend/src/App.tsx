import { useState, useMemo } from 'react';
import {
  FileText,
  ShieldCheck,
  Zap,
  Sparkles,
  Lock,
} from 'lucide-react';
import type { ToolDefinition, ToolType } from './types/index';
import { Navbar } from './components/common/Navbar';
import { ToolCard } from './components/tools/ToolCard';
import { ToolWorkspace } from './components/tools/ToolWorkspace';
import { LanguageProvider, useI18n } from './i18n/LanguageContext';

function AppContent() {
  const { t } = useI18n();
  const [activeToolId, setActiveToolId] = useState<ToolType | null>(null);

  const tools: ToolDefinition[] = useMemo(
    () => [
      {
        id: 'pdf-to-images',
        title: t.tools.pdfToImages.title,
        badge: t.tools.pdfToImages.badge,
        description: t.tools.pdfToImages.description,
        acceptedTypes: ['.pdf', 'application/pdf'],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: 'extract-pdf-images',
        title: t.tools.extractPdfImages.title,
        badge: t.tools.extractPdfImages.badge,
        description: t.tools.extractPdfImages.description,
        acceptedTypes: ['.pdf', 'application/pdf'],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: 'images-to-pdf',
        title: t.tools.imagesToPdf.title,
        badge: t.tools.imagesToPdf.badge,
        description: t.tools.imagesToPdf.description,
        acceptedTypes: ['.png', '.jpg', '.jpeg', 'image/png', 'image/jpeg'],
        multipleFiles: true,
        minFiles: 1,
      },
      {
        id: 'merge-pdf',
        title: t.tools.mergePdf.title,
        badge: t.tools.mergePdf.badge,
        description: t.tools.mergePdf.description,
        acceptedTypes: ['.pdf', 'application/pdf'],
        multipleFiles: true,
        minFiles: 2,
      },
      {
        id: 'split-pdf',
        title: t.tools.splitPdf.title,
        badge: t.tools.splitPdf.badge,
        description: t.tools.splitPdf.description,
        acceptedTypes: ['.pdf', 'application/pdf'],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: 'extract-pdf-text',
        title: t.tools.extractPdfText.title,
        badge: t.tools.extractPdfText.badge,
        description: t.tools.extractPdfText.description,
        acceptedTypes: ['.pdf', 'application/pdf'],
        multipleFiles: false,
        minFiles: 1,
      },
      {
        id: 'pdf-to-word',
        title: t.tools.pdfToWord.title,
        badge: t.tools.pdfToWord.badge,
        description: t.tools.pdfToWord.description,
        acceptedTypes: ['.pdf', 'application/pdf'],
        multipleFiles: false,
        minFiles: 1,
      },
    ],
    [t]
  );

  const activeTool = tools.find((tItem) => tItem.id === activeToolId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        onGoHome={() => setActiveToolId(null)}
        activeToolTitle={activeTool?.title}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {activeTool ? (
          <ToolWorkspace tool={activeTool} onBack={() => setActiveToolId(null)} />
        ) : (
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center max-w-3xl mx-auto space-y-4 pt-4 sm:pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                {t.heroTitle}
              </h1>

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
                {t.heroSubtitle}
              </p>

              {/* Feature pills */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.featurePrivate}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>{t.featureQuality}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <Lock className="w-4 h-4 text-indigo-400" />
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
                <span className="text-xs text-slate-400">
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
      <footer className="border-t border-slate-800 bg-slate-900/60 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">{t.appName}</span>
            <span>• {t.footerText}</span>
          </div>
          <p className="text-center sm:text-right">
            {t.footerPrivacy}
          </p>
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
