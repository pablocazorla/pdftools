import React from "react";
import { File, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useI18n } from "../../i18n/LanguageContext";

interface SortableFileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (newFiles: File[]) => void;
  onClearAll?: () => void;
  allowReorder?: boolean;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export const SortableFileList: React.FC<SortableFileListProps> = ({
  files,
  onRemove,
  onReorder,
  onClearAll,
  allowReorder = false,
}) => {
  const { t } = useI18n();

  if (files.length === 0) return null;

  const moveUp = (index: number) => {
    if (index === 0 || !onReorder) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index - 1];
    newFiles[index - 1] = temp;
    onReorder(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1 || !onReorder) return;
    const newFiles = [...files];
    const temp = newFiles[index];
    newFiles[index] = newFiles[index + 1];
    newFiles[index + 1] = temp;
    onReorder(newFiles);
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
        <span className="font-medium text-zinc-300">
          {t.fileList.selectedFiles} ({files.length})
        </span>
        {onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
          >
            {t.fileList.removeAll}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={`${file.name}-${index}-${file.size}`}
            className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 shadow-md hover:shadow-lg transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0 pr-3">
              <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-mono flex items-center justify-center shrink-0 shadow-inner">
                {index + 1}
              </span>
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 shadow-sm">
                <File className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {allowReorder && files.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title={t.fileList.moveUp}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === files.length - 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                    title={t.fileList.moveDown}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 cursor-pointer hover:bg-rose-500/10 transition-colors ml-1"
                title={t.fileList.deleteFile}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
