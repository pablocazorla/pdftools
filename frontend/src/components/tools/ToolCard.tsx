import React from "react";
import {
  FileImage,
  ImageDown,
  FilePlus2,
  Combine,
  Scissors,
  FileText,
  FileType2,
  ArrowRight,
} from "lucide-react";
import type { ToolDefinition, ToolType } from "../../types/index";
import { useI18n } from "../../i18n/LanguageContext";
import { TOOL_THEMES } from "./toolTheme";

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (toolId: ToolType) => void;
}

const TOOL_ICONS: Record<ToolType, (colorClass: string) => React.ReactNode> = {
  "pdf-to-images": (c) => <FileImage className={`w-6 h-6 ${c}`} />,
  "extract-pdf-images": (c) => <ImageDown className={`w-6 h-6 ${c}`} />,
  "images-to-pdf": (c) => <FilePlus2 className={`w-6 h-6 ${c}`} />,
  "merge-pdf": (c) => <Combine className={`w-6 h-6 ${c}`} />,
  "split-pdf": (c) => <Scissors className={`w-6 h-6 ${c}`} />,
  "extract-pdf-text": (c) => <FileText className={`w-6 h-6 ${c}`} />,
  "pdf-to-word": (c) => <FileType2 className={`w-6 h-6 ${c}`} />,
};

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const { t } = useI18n();
  const theme = TOOL_THEMES[tool.id];

  return (
    <button
      onClick={() => onSelect(tool.id)}
      className={`group relative text-left p-6 rounded-2xl bg-zinc-900 border border-zinc-800 ${theme.cardHoverBorder} shadow-lg hover:shadow-2xl cursor-pointer ${theme.cardHoverShadow} transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between h-full`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl ${theme.iconBg} border ${theme.iconBorder} flex items-center justify-center shadow-md transition-colors`}
          >
            {TOOL_ICONS[tool.id](theme.iconColor)}
          </div>
          <span
            className={`text-[11px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder} shadow-sm`}
          >
            {tool.badge}
          </span>
        </div>

        <h3
          className={`text-base font-bold text-white mb-2 ${theme.textHover} transition-colors`}
        >
          {tool.title}
        </h3>
        <p className="text-xs text-zinc-400 leading-relaxed mb-4">
          {tool.description}
        </p>
      </div>

      <div
        className={`flex items-center gap-1.5 text-xs font-medium text-zinc-400 ${theme.textHover} transition-colors pt-3 border-t border-zinc-800`}
      >
        <span>{t.openTool}</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};
