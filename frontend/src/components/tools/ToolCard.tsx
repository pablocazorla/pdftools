import React from 'react';
import {
  FileImage,
  ImageDown,
  FilePlus2,
  Combine,
  Scissors,
  FileText,
  FileType2,
  ArrowRight,
} from 'lucide-react';
import type { ToolDefinition, ToolType } from '../../types/index';
import { useI18n } from '../../i18n/LanguageContext';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (toolId: ToolType) => void;
}

const TOOL_ICONS: Record<ToolType, React.ReactNode> = {
  'pdf-to-images': <FileImage className="w-6 h-6 text-amber-400" />,
  'extract-pdf-images': <ImageDown className="w-6 h-6 text-rose-400" />,
  'images-to-pdf': <FilePlus2 className="w-6 h-6 text-emerald-400" />,
  'merge-pdf': <Combine className="w-6 h-6 text-blue-400" />,
  'split-pdf': <Scissors className="w-6 h-6 text-purple-400" />,
  'extract-pdf-text': <FileText className="w-6 h-6 text-cyan-400" />,
  'pdf-to-word': <FileType2 className="w-6 h-6 text-indigo-400" />,
};

const TOOL_GRADIENTS: Record<ToolType, string> = {
  'pdf-to-images': 'from-amber-500/10 to-transparent border-amber-500/20 group-hover:border-amber-500/40',
  'extract-pdf-images': 'from-rose-500/10 to-transparent border-rose-500/20 group-hover:border-rose-500/40',
  'images-to-pdf': 'from-emerald-500/10 to-transparent border-emerald-500/20 group-hover:border-emerald-500/40',
  'merge-pdf': 'from-blue-500/10 to-transparent border-blue-500/20 group-hover:border-blue-500/40',
  'split-pdf': 'from-purple-500/10 to-transparent border-purple-500/20 group-hover:border-purple-500/40',
  'extract-pdf-text': 'from-cyan-500/10 to-transparent border-cyan-500/20 group-hover:border-cyan-500/40',
  'pdf-to-word': 'from-indigo-500/10 to-transparent border-indigo-500/20 group-hover:border-indigo-500/40',
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const { t } = useI18n();

  return (
    <button
      onClick={() => onSelect(tool.id)}
      className={`group relative text-left p-6 rounded-2xl bg-gradient-to-b ${TOOL_GRADIENTS[tool.id]} bg-slate-900 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between h-full`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            {TOOL_ICONS[tool.id]}
          </div>
          <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {tool.badge}
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
          {tool.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          {tool.description}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 group-hover:text-indigo-300 transition-colors pt-3 border-t border-slate-800/60">
        <span>{t.openTool}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
