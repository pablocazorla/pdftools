import React, { useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileArchive,
  FileText,
  Image as ImageIcon,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Eye,
} from 'lucide-react';
import type { TaskResponse, TaskOutput } from '../../types/index';
import { formatFileSize } from '../upload/SortableFileList';
import { useI18n } from '../../i18n/LanguageContext';

interface ResultPanelProps {
  task: TaskResponse;
  onReset: () => void;
}

export const ResultPanel: React.FC<ResultPanelProps> = ({ task, onReset }) => {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const [previewFile, setPreviewFile] = useState<TaskOutput | null>(null);

  const zipOutput = task.outputs.find((o) => o.mimeType === 'application/zip');
  const nonZipOutputs = task.outputs.filter((o) => o.mimeType !== 'application/zip');

  const extractedText = task.metadata?.extractedText as string | undefined;
  const hasSelectableText = task.metadata?.hasSelectableText as boolean | undefined;

  const handleCopyText = async () => {
    if (!extractedText) return;
    try {
      await navigator.clipboard.writeText(extractedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{t.results.successTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-400">
              {task.outputs.length} {t.results.filesReady}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {zipOutput ? (
            <a
              href={zipOutput.downloadUrl}
              download={zipOutput.name}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              <FileArchive className="w-4 h-4" />
              <span>{t.results.downloadZip} ({formatFileSize(zipOutput.size)})</span>
            </a>
          ) : nonZipOutputs.length === 1 ? (
            <a
              href={nonZipOutputs[0].downloadUrl}
              download={nonZipOutputs[0].name}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              <Download className="w-4 h-4" />
              <span>{t.results.downloadFile} {nonZipOutputs[0].name}</span>
            </a>
          ) : null}

          <button
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors border border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">{t.results.newProcess}</span>
          </button>
        </div>
      </div>

      {/* Extracted Text Preview Area */}
      {extractedText && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h4 className="text-sm font-semibold text-white">{t.results.extractedTextTitle}</h4>
              {hasSelectableText === false && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {t.results.scanWarning}
                </span>
              )}
            </div>
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{t.results.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t.results.copyText}</span>
                </>
              )}
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap border border-slate-800/80">
            {extractedText}
          </div>
        </div>
      )}

      {/* Visual Word Fidelity Warning if applicable */}
      {Boolean(task.metadata?.isVisualFidelityOnly) && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs leading-relaxed">
          {t.results.visualWordNotice}
        </div>
      )}

      {/* Individual Files Grid/List */}
      {nonZipOutputs.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">
            {t.results.individualFiles} ({nonZipOutputs.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nonZipOutputs.map((file) => {
              const isImage = file.mimeType.startsWith('image/');
              return (
                <div
                  key={file.fileId}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 text-slate-300 group-hover:text-indigo-400 transition-colors">
                      {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-200 truncate" title={file.name}>
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {formatFileSize(file.size)}
                        {file.metadata?.page !== undefined
                          ? ` • ${t.results.pageLabel} ${String(file.metadata.page)}`
                          : ''}
                      </p>
                    </div>
                  </div>

                  {/* Thumbnail if preview available */}
                  {file.previewUrl && isImage && (
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="relative h-28 rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 cursor-pointer group/thumb"
                    >
                      <img
                        src={file.previewUrl}
                        alt={file.name}
                        className="w-full h-full object-contain p-1 group-hover/thumb:scale-105 transition-transform"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-xs text-white">
                        <Eye className="w-4 h-4" />
                        <span>{t.results.view}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-slate-800/60">
                    <a
                      href={file.downloadUrl}
                      download={file.name}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{t.results.download}</span>
                    </a>
                    {file.previewUrl && (
                      <a
                        href={file.previewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title={t.results.openInNewTab}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox / Preview Modal */}
      {previewFile && (
        <div
          onClick={() => setPreviewFile(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">{previewFile.name}</span>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                {t.results.close}
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950">
              <img
                src={previewFile.previewUrl}
                alt={previewFile.name}
                className="max-h-[75vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
