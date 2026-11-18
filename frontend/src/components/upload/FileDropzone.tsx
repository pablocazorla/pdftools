import React, { useRef, useState } from 'react';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { useI18n } from '../../i18n/LanguageContext';

interface FileDropzoneProps {
  multiple?: boolean;
  accept?: string;
  onFilesSelected: (files: File[]) => void;
  maxSizeMb?: number;
  label?: string;
  sublabel?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  multiple = false,
  accept = '.pdf,application/pdf',
  onFilesSelected,
  maxSizeMb = 300,
  label,
  sublabel,
}) => {
  const { t, formatText } = useI18n();
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayLabel =
    label ?? (multiple ? t.dropzone.multiLabel : t.dropzone.singleLabel);
  const displaySublabel =
    sublabel ?? (multiple ? t.dropzone.multiSublabel : t.dropzone.singleSublabel);

  const validateAndPass = (fileList: FileList | null) => {
    setValidationError(null);
    if (!fileList || fileList.length === 0) return;

    const filesArray = Array.from(fileList);

    // Validate size
    for (const f of filesArray) {
      if (f.size > maxSizeMb * 1024 * 1024) {
        setValidationError(
          formatText(t.dropzone.errorTooLarge, { name: f.name, max: maxSizeMb })
        );
        return;
      }
      if (f.size === 0) {
        setValidationError(formatText(t.dropzone.errorEmpty, { name: f.name }));
        return;
      }
    }

    if (!multiple && filesArray.length > 1) {
      onFilesSelected([filesArray[0]]);
    } else {
      onFilesSelected(filesArray);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    validateAndPass(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPass(e.target.files);
    // Reset input so same file can be re-selected if deleted
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-2">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-700/80 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-900'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />

        <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/50 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:text-indigo-300 transition-all shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base sm:text-lg font-semibold text-white tracking-tight mb-1">
          {displayLabel}
        </h3>
        <p className="text-sm text-slate-400 mb-3">{displaySublabel}</p>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs text-slate-400">
          <File className="w-3.5 h-3.5 text-slate-400" />
          <span>
            {t.dropzone.maxLimit} {maxSizeMb} MB •{' '}
            {multiple ? t.dropzone.multiFile : t.dropzone.singleFile}
          </span>
        </div>
      </div>

      {validationError && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};
