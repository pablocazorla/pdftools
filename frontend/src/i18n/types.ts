export type Language = 'en' | 'es';

export interface TranslationSchema {
  // Common & Navbar
  appName: string;
  appBadge: string;
  appSubtitle: string;
  allTools: string;
  activeToolLabel: string;
  backToTools: string;
  footerText: string;
  footerPrivacy: string;
  selectLanguage: string;

  // Hero Section
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  featurePrivate: string;
  featureQuality: string;
  featureIsolated: string;
  availableTools: string;
  selectToolToStart: string;
  openTool: string;

  // Tools Metadata
  tools: {
    pdfToImages: {
      title: string;
      badge: string;
      description: string;
    };
    extractPdfImages: {
      title: string;
      badge: string;
      description: string;
    };
    imagesToPdf: {
      title: string;
      badge: string;
      description: string;
    };
    mergePdf: {
      title: string;
      badge: string;
      description: string;
    };
    splitPdf: {
      title: string;
      badge: string;
      description: string;
    };
    extractPdfText: {
      title: string;
      badge: string;
      description: string;
    };
    pdfToWord: {
      title: string;
      badge: string;
      description: string;
    };
  };

  // Dropzone
  dropzone: {
    singleLabel: string;
    singleSublabel: string;
    multiLabel: string;
    multiSublabel: string;
    addMoreLabel: string;
    addMoreSublabel: string;
    maxLimit: string;
    singleFile: string;
    multiFile: string;
    errorTooLarge: string;
    errorEmpty: string;
  };

  // File List
  fileList: {
    selectedFiles: string;
    removeAll: string;
    moveUp: string;
    moveDown: string;
    deleteFile: string;
  };

  // Progress
  progress: {
    defaultStep: string;
    waitMessage: string;
  };

  // Results
  results: {
    successTitle: string;
    filesReady: string;
    downloadZip: string;
    downloadFile: string;
    newProcess: string;
    extractedTextTitle: string;
    scanWarning: string;
    copyText: string;
    copied: string;
    visualWordNotice: string;
    individualFiles: string;
    pageLabel: string;
    download: string;
    view: string;
    close: string;
    openInNewTab: string;
  };

  // Tool Workspace Options & Actions
  workspace: {
    settingsTitle: string;
    selectAtLeastOne: string;
    selectMinFiles: string;
    
    // PDF to Images
    dpiLabel: string;
    dpi300Title: string;
    dpi300Desc: string;
    dpi150Title: string;
    dpi150Desc: string;
    actionPdfToImages: string;

    // Extract PDF Images
    exportFormat: string;
    exportFormatDesc: string;
    formatPng: string;
    formatJpg: string;
    inspectPrompt: string;
    inspectButton: string;
    inspecting: string;
    detectedImagesCount: string;
    selectAll: string;
    deselectAll: string;
    actionExtractAll: string;
    actionExtractSelected: string;

    // Images to PDF
    pageSizeLabel: string;
    pageSizeAutoOrient: string;
    stdIso: string;
    imgSize: string;
    actionImagesToPdf: string;

    // Merge PDF
    mergeInfo1: string;
    mergeInfo2: string;
    actionMergePdf: string;

    // Split PDF
    splitRangesLabel: string;
    splitRangesPlaceholder: string;
    splitFormatsTitle: string;
    splitFormatsDesc: string;
    splitResultNote: string;
    actionSplitPdf: string;
    rangesEmptyError: string;

    // Extract PDF Texts
    extractTextInfo1: string;
    extractTextInfo2: string;
    actionExtractPdfText: string;

    // Convert PDF to Word
    wordFidelityTitle: string;
    wordFidelityDesc: string;
    actionPdfToWord: string;
  };

  // Error Messages
  errors: {
    errorCode: string;
    dismiss: string;
  };
}
