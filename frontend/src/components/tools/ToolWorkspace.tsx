import React, { useState } from 'react';
import {
  ArrowLeft,
  Settings2,
  FileCheck,
  CheckSquare,
  Square,
  AlertTriangle,
} from 'lucide-react';
import type { ToolDefinition, TaskResponse, DetectedImage } from '../../types/index';
import { FileDropzone } from '../upload/FileDropzone';
import { SortableFileList } from '../upload/SortableFileList';
import { ProgressIndicator } from '../common/ProgressIndicator';
import { ErrorMessage } from '../common/ErrorMessage';
import { ResultPanel } from '../results/ResultPanel';
import { api, ApiError } from '../../services/api';
import { useI18n } from '../../i18n/LanguageContext';

interface ToolWorkspaceProps {
  tool: ToolDefinition;
  onBack: () => void;
}

export const ToolWorkspace: React.FC<ToolWorkspaceProps> = ({ tool, onBack }) => {
  const { t, formatText } = useI18n();
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTask, setCurrentTask] = useState<TaskResponse | null>(null);

  // Tool Specific Options
  // 1. PDF to Images: DPI
  const [dpi, setDpi] = useState<number>(300);

  // 2. Extract PDF Images: Format & Inspection
  const [imgFormat, setImgFormat] = useState<'png' | 'jpg'>('png');
  const [detectedImages, setDetectedImages] = useState<DetectedImage[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);

  // 3. Images to PDF: Page Size
  const [pageSize, setPageSize] = useState<'A4' | 'A3' | 'A5' | 'original'>('A4');

  // 5. Split PDF: Ranges
  const [ranges, setRanges] = useState<string>('1');

  const handleFilesSelected = (newFiles: File[]) => {
    setError(null);
    if (tool.multipleFiles) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles([newFiles[0]]);
      setDetectedImages([]);
      setSelectedImageIds([]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDetectedImages([]);
  };

  const handleInspectImages = async () => {
    if (files.length === 0) return;
    setError(null);
    setIsInspecting(true);
    try {
      const { taskId } = await api.extractPdfImages(files[0], { inspect: true });
      const completedTask = await api.pollTask(taskId);
      const images = (completedTask.metadata?.detectedImages as DetectedImage[]) || [];
      setDetectedImages(images);
      setSelectedImageIds(images.map((img) => img.id));
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Error inspecting PDF images';
      const code = err instanceof ApiError ? err.code : undefined;
      setError({ message: msg, code });
    } finally {
      setIsInspecting(false);
    }
  };

  const toggleSelectImage = (id: string) => {
    setSelectedImageIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedImageIds.length === detectedImages.length) {
      setSelectedImageIds([]);
    } else {
      setSelectedImageIds(detectedImages.map((img) => img.id));
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (files.length === 0) {
      setError({ message: t.workspace.selectAtLeastOne });
      return;
    }

    if (tool.minFiles && files.length < tool.minFiles) {
      setError({
        message: formatText(t.workspace.selectMinFiles, { count: tool.minFiles }),
      });
      return;
    }

    setIsProcessing(true);
    setCurrentTask(null);

    try {
      let initialTask: { taskId: string };

      switch (tool.id) {
        case 'pdf-to-images':
          initialTask = await api.pdfToImages(files[0], dpi);
          break;

        case 'extract-pdf-images':
          initialTask = await api.extractPdfImages(files[0], {
            format: imgFormat,
            selectedIds: selectedImageIds.length > 0 ? selectedImageIds : undefined,
          });
          break;

        case 'images-to-pdf':
          initialTask = await api.imagesToPdf(
            files,
            pageSize,
            files.map((f) => f.name)
          );
          break;

        case 'merge-pdf':
          initialTask = await api.mergePdf(
            files,
            files.map((f) => f.name)
          );
          break;

        case 'split-pdf':
          if (!ranges.trim()) {
            throw new ApiError(t.workspace.rangesEmptyError);
          }
          initialTask = await api.splitPdf(files[0], ranges.trim());
          break;

        case 'extract-pdf-text':
          initialTask = await api.extractPdfText(files[0]);
          break;

        case 'pdf-to-word':
          initialTask = await api.pdfToWord(files[0]);
          break;

        default:
          throw new ApiError('Tool not recognized');
      }

      // Poll until task finishes
      const finishedTask = await api.pollTask(initialTask.taskId, (liveTask) => {
        setCurrentTask(liveTask);
      });

      setCurrentTask(finishedTask);
    } catch (err: unknown) {
      const msg = err instanceof ApiError ? err.message : 'Error during processing';
      const code = err instanceof ApiError ? err.code : undefined;
      setError({ message: msg, code });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setError(null);
    setCurrentTask(null);
    setIsProcessing(false);
    setDetectedImages([]);
    setSelectedImageIds([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header and Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-400 hover:text-white transition-colors p-2 rounded-xl hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.backToTools}</span>
        </button>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          {tool.badge}
        </span>
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          {tool.title}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          {tool.description}
        </p>
      </div>

      {error && (
        <ErrorMessage
          message={error.message}
          code={error.code}
          onDismiss={() => setError(null)}
        />
      )}

      {/* When processing */}
      {isProcessing && (
        <ProgressIndicator
          progress={currentTask?.progress ?? 20}
          step={currentTask?.step ?? t.progress.defaultStep}
        />
      )}

      {/* When completed */}
      {currentTask && currentTask.status === 'completed' && (
        <ResultPanel task={currentTask} onReset={handleReset} />
      )}

      {/* Main workspace interactive form (when not processing and not showing results) */}
      {!isProcessing && (!currentTask || currentTask.status !== 'completed') && (
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          {/* File Upload Zone */}
          {files.length === 0 ? (
            <FileDropzone
              multiple={tool.multipleFiles}
              accept={tool.acceptedTypes.join(',')}
              onFilesSelected={handleFilesSelected}
            />
          ) : (
            <div className="space-y-4">
              <SortableFileList
                files={files}
                onRemove={handleRemoveFile}
                onReorder={setFiles}
                onClearAll={() => setFiles([])}
                allowReorder={tool.id === 'images-to-pdf' || tool.id === 'merge-pdf'}
              />

              {tool.multipleFiles && (
                <div className="pt-2">
                  <FileDropzone
                    multiple={true}
                    accept={tool.acceptedTypes.join(',')}
                    onFilesSelected={handleFilesSelected}
                    label={t.dropzone.addMoreLabel}
                    sublabel={t.dropzone.addMoreSublabel}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tool-specific Options & Settings */}
          {files.length > 0 && (
            <div className="p-5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <Settings2 className="w-4 h-4 text-indigo-400" />
                <span>{t.workspace.settingsTitle}</span>
              </div>

              {/* 1. PDF to Images Options */}
              {tool.id === 'pdf-to-images' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    {t.workspace.dpiLabel}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDpi(300)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        dpi === 300
                          ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm">{t.workspace.dpi300Title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.workspace.dpi300Desc}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDpi(150)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        dpi === 150
                          ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-sm'
                          : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400'
                      }`}
                    >
                      <div className="font-semibold text-xs sm:text-sm">{t.workspace.dpi150Title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.workspace.dpi150Desc}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* 2. Extract PDF Images Options */}
              {tool.id === 'extract-pdf-images' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-300">
                        {t.workspace.exportFormat}
                      </label>
                      <p className="text-[11px] text-slate-400">
                        {t.workspace.exportFormatDesc}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImgFormat('png')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          imgFormat === 'png'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t.workspace.formatPng}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImgFormat('jpg')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          imgFormat === 'jpg'
                            ? 'bg-indigo-600 text-white shadow'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t.workspace.formatJpg}
                      </button>
                    </div>
                  </div>

                  {/* Inspection Mode Button */}
                  {detectedImages.length === 0 ? (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <p className="text-xs text-slate-400">
                        {t.workspace.inspectPrompt}
                      </p>
                      <button
                        type="button"
                        onClick={handleInspectImages}
                        disabled={isInspecting}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors disabled:opacity-50"
                      >
                        {isInspecting ? t.workspace.inspecting : t.workspace.inspectButton}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">
                          {detectedImages.length} {t.workspace.detectedImagesCount}
                        </span>
                        <button
                          type="button"
                          onClick={toggleSelectAll}
                          className="text-indigo-400 hover:text-indigo-300 font-medium"
                        >
                          {selectedImageIds.length === detectedImages.length
                            ? t.workspace.deselectAll
                            : t.workspace.selectAll}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                        {detectedImages.map((img) => {
                          const isSelected = selectedImageIds.includes(img.id);
                          return (
                            <div
                              key={img.id}
                              onClick={() => toggleSelectImage(img.id)}
                              className={`relative p-2 rounded-xl border cursor-pointer transition-all flex flex-col items-center justify-between ${
                                isSelected
                                  ? 'border-indigo-500 bg-indigo-500/10'
                                  : 'border-slate-800 bg-slate-900 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <div className="absolute top-2 right-2 z-10">
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-400" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              {img.previewUrl ? (
                                <img
                                  src={img.previewUrl}
                                  alt={img.id}
                                  className="w-full h-16 object-contain mb-1 rounded"
                                />
                              ) : (
                                <div className="w-full h-16 bg-slate-950 flex items-center justify-center text-xs text-slate-500 mb-1 rounded">
                                  {img.format}
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 text-center w-full">
                                {t.results.pageLabel} {img.page} • {img.width}x{img.height}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Images to PDF Options */}
              {tool.id === 'images-to-pdf' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    {t.workspace.pageSizeLabel}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(['A4', 'A3', 'A5', 'original'] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setPageSize(size)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          pageSize === size
                            ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-400'
                        }`}
                      >
                        <div className="text-xs sm:text-sm uppercase">{size}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {size === 'original' ? t.workspace.imgSize : t.workspace.stdIso}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {t.workspace.pageSizeAutoOrient}
                  </p>
                </div>
              )}

              {/* 4. Merge PDF Info */}
              {tool.id === 'merge-pdf' && (
                <div className="text-xs text-slate-400 space-y-1">
                  <p>{t.workspace.mergeInfo1}</p>
                  <p>{t.workspace.mergeInfo2}</p>
                </div>
              )}

              {/* 5. Split PDF Options */}
              {tool.id === 'split-pdf' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">
                    {t.workspace.splitRangesLabel}
                  </label>
                  <input
                    type="text"
                    value={ranges}
                    onChange={(e) => setRanges(e.target.value)}
                    placeholder={t.workspace.splitRangesPlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <p>
                      <strong>{t.workspace.splitFormatsTitle}</strong> {t.workspace.splitFormatsDesc}
                    </p>
                    <p>{t.workspace.splitResultNote}</p>
                  </div>
                </div>
              )}

              {/* 6. Extract PDF Texts Info */}
              {tool.id === 'extract-pdf-text' && (
                <div className="text-xs text-slate-400 space-y-1">
                  <p>{t.workspace.extractTextInfo1}</p>
                  <p>{t.workspace.extractTextInfo2}</p>
                </div>
              )}

              {/* 7. Convert PDF to Word Options / Warning */}
              {tool.id === 'pdf-to-word' && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{t.workspace.wordFidelityTitle}</span>
                  </div>
                  <p className="leading-relaxed">
                    {t.workspace.wordFidelityDesc}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Main Action Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                files.length === 0 ||
                (Boolean(tool.minFiles) && files.length < (tool.minFiles ?? 1))
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25"
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {tool.id === 'pdf-to-images' && t.workspace.actionPdfToImages}
                {tool.id === 'extract-pdf-images' &&
                  (selectedImageIds.length > 0 && selectedImageIds.length < detectedImages.length
                    ? formatText(t.workspace.actionExtractSelected, {
                        count: selectedImageIds.length,
                      })
                    : t.workspace.actionExtractAll)}
                {tool.id === 'images-to-pdf' && t.workspace.actionImagesToPdf}
                {tool.id === 'merge-pdf' && t.workspace.actionMergePdf}
                {tool.id === 'split-pdf' && t.workspace.actionSplitPdf}
                {tool.id === 'extract-pdf-text' && t.workspace.actionExtractPdfText}
                {tool.id === 'pdf-to-word' && t.workspace.actionPdfToWord}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
