import type { Language, TranslationSchema } from './types';

export const translations: Record<Language, TranslationSchema> = {
  en: {
    appName: 'PDF Tools',
    appBadge: 'PRO',
    appSubtitle: 'Comprehensive PDF Document Suite',
    allTools: 'All Tools',
    activeToolLabel: 'Tool:',
    backToTools: 'Back to catalog',
    footerText: 'Local and confidential processing',
    footerPrivacy: 'Processed files are automatically deleted after their temporary retention period.',
    cleanStorage: 'Clean Storage',
    cleaningStorage: 'Cleaning storage...',
    storageCleaned: 'Storage cleaned successfully!',
    selectLanguage: 'Language',

    heroBadge: 'Complete PDF Toolkit',
    heroTitle: 'All tools for your documents in one place',
    heroSubtitle:
      'Convert, merge, split, extract images, and process your PDF files with maximum speed, high fidelity, and total local privacy.',
    featurePrivate: '100% private server-side processing',
    featureQuality: '300 DPI rendering & vector preservation',
    featureIsolated: 'Secure per-task isolation',
    availableTools: 'Available Tools',
    selectToolToStart: 'Select a tool to get started',
    openTool: 'Open tool',

    tools: {
      pdfToImages: {
        title: 'PDF to Images',
        badge: 'Conversion',
        description:
          'Convert each page of your PDF into crisp PNG images with an effective resolution of 300 DPI.',
      },
      extractPdfImages: {
        title: 'Extract PDF Images',
        badge: 'Extraction',
        description:
          'Extract all embedded images inside the PDF in PNG or JPG format with transparency handling.',
      },
      imagesToPdf: {
        title: 'Images to PDF',
        badge: 'Creation',
        description:
          'Combine one or more images (PNG, JPG) into a single PDF with A3, A4, A5, or original centered size.',
      },
      mergePdf: {
        title: 'Merge PDF',
        badge: 'Organization',
        description:
          'Combine two or more PDF files in any order preserving vector text, fonts, and links without rasterization.',
      },
      splitPdf: {
        title: 'Split PDF',
        badge: 'Organization',
        description:
          'Extract individual pages or specific ranges (e.g. 1-3, 5, 8-10) into separate PDF documents.',
      },
      extractPdfText: {
        title: 'Extract PDF Texts',
        badge: 'Content',
        description:
          'Extract all structured digital text page by page to easily copy to clipboard or download as TXT.',
      },
      pdfToWord: {
        title: 'Convert PDF to Word',
        badge: 'Conversion',
        description:
          'Generate a Word document (.docx) preserving exact visual fidelity of each page as high-res images.',
      },
    },

    dropzone: {
      singleLabel: 'Drag your file here',
      singleSublabel: 'or click to browse from your device',
      multiLabel: 'Drag one or multiple files here',
      multiSublabel: 'or click to select files',
      addMoreLabel: 'Add more files',
      addMoreSublabel: 'or drag them here',
      maxLimit: 'Max',
      singleFile: 'Single file',
      multiFile: 'Multiple files allowed',
      errorTooLarge: 'The file "{name}" exceeds the maximum size of {max} MB.',
      errorEmpty: 'The file "{name}" is empty (0 bytes).',
    },

    fileList: {
      selectedFiles: 'Selected files',
      removeAll: 'Remove all',
      moveUp: 'Move up',
      moveDown: 'Move down',
      deleteFile: 'Delete file',
    },

    progress: {
      defaultStep: 'Processing file...',
      waitMessage: 'Please wait while the server securely processes your document.',
    },

    results: {
      successTitle: 'Processing completed successfully!',
      filesReady: 'files generated and ready to download.',
      downloadZip: 'Download ZIP',
      downloadFile: 'Download',
      newProcess: 'New',
      extractedTextTitle: 'Extracted text',
      scanWarning: 'Warning: Document contains no selectable text (possible scan)',
      copyText: 'Copy text',
      copied: 'Copied!',
      visualWordNotice:
        'Visual fidelity notice: This DOCX document contains the PDF pages rendered as high-resolution images to guarantee exact original layout. Content is not editable text.',
      individualFiles: 'Individual files',
      pageLabel: 'Page',
      download: 'Download',
      view: 'View',
      close: 'Close',
      openInNewTab: 'Open in new tab',
    },

    workspace: {
      settingsTitle: 'Tool Configuration',
      selectAtLeastOne: 'Please select at least one file to continue.',
      selectMinFiles: 'At least {count} files are required for this operation.',

      dpiLabel: 'Rendering Resolution (DPI)',
      dpi300Title: '300 DPI (Recommended)',
      dpi300Desc: 'High quality for crisp printing and reading.',
      dpi150Title: '150 DPI (Fast)',
      dpi150Desc: 'Smaller file size and fast rendering.',
      actionPdfToImages: 'Convert PDF to PNG images',

      exportFormat: 'Export Format',
      exportFormatDesc: 'PNG preserves transparency; JPG applies a clean white background.',
      formatPng: 'PNG (Transparency)',
      formatJpg: 'JPG (White background)',
      inspectPrompt: 'Want to preview and choose which images to extract?',
      inspectButton: 'Inspect PDF images',
      inspecting: 'Inspecting...',
      detectedImagesCount: 'embedded images detected',
      selectAll: 'Select all',
      deselectAll: 'Deselect all',
      actionExtractAll: 'Extract all images from PDF',
      actionExtractSelected: 'Extract {count} selected images',

      pageSizeLabel: 'PDF Document Page Size',
      pageSizeAutoOrient:
        'Orientation (portrait/landscape) automatically adjusts to each image aspect ratio to prevent distortion or cropping.',
      stdIso: 'ISO Standard',
      imgSize: 'Image dimensions',
      actionImagesToPdf: 'Create PDF document',

      mergeInfo1:
        '• PDFs will be combined in the exact order shown above. Use the arrows to reorder.',
      mergeInfo2:
        '• Pages are not rasterized: vector text, images, and links are fully preserved.',
      actionMergePdf: 'Merge PDF files',

      splitRangesLabel: 'Define pages or ranges to extract',
      splitRangesPlaceholder: 'Example: 1-3, 5, 8-10',
      splitFormatsTitle: 'Supported formats:',
      splitFormatsDesc:
        'Single page (e.g. 3), continuous range (e.g. 2-5), or multiple ranges separated by commas (e.g. 1-3, 5, 8-10).',
      splitResultNote:
        'Each range will generate an independent PDF document available for individual download or as a ZIP archive.',
      actionSplitPdf: 'Split PDF',
      rangesEmptyError: 'You must enter the page ranges to split (e.g. 1-3, 5).',

      extractTextInfo1:
        '• Extracts structured digital text page by page with clean separators.',
      extractTextInfo2:
        '• If the PDF is a scanned document without a digital text layer, the tool will alert you clearly.',
      actionExtractPdfText: 'Extract text from PDF',

      wordFidelityTitle: 'Guaranteed visual fidelity (Pages as images)',
      wordFidelityDesc:
        'This tool converts each PDF page into a high-resolution image and embeds it into a Word (.docx) document. The result preserves the exact visual design of the original PDF, but text is not editable.',
      actionPdfToWord: 'Convert to Word (.docx)',
    },

    errors: {
      errorCode: 'Error code:',
      dismiss: 'Dismiss alert',
    },
  },

  es: {
    appName: 'PDF Tools',
    appBadge: 'PRO',
    appSubtitle: 'Suite integral para documentos PDF',
    allTools: 'Todas las herramientas',
    activeToolLabel: 'Herramienta:',
    backToTools: 'Volver al catálogo',
    footerText: 'Procesamiento local y confidencial',
    footerPrivacy: 'Los archivos procesados se eliminan automáticamente tras su retención temporal.',
    cleanStorage: 'Limpiar almacenamiento',
    cleaningStorage: 'Limpiando almacenamiento...',
    storageCleaned: '¡Almacenamiento limpiado con éxito!',
    selectLanguage: 'Idioma',

    heroBadge: 'Suite completa de herramientas PDF',
    heroTitle: 'Todas las herramientas para tus documentos en un solo lugar',
    heroSubtitle:
      'Convierte, combina, divide, extrae imágenes y procesa tus archivos PDF con máxima velocidad, alta fidelidad y total privacidad local.',
    featurePrivate: 'Procesamiento 100% privado en servidor',
    featureQuality: 'Renderizado 300 DPI y sin rasterizar',
    featureIsolated: 'Aislamiento seguro por tarea',
    availableTools: 'Herramientas disponibles',
    selectToolToStart: 'Selecciona una herramienta para comenzar',
    openTool: 'Abrir herramienta',

    tools: {
      pdfToImages: {
        title: 'PDF to Images',
        badge: 'Conversión',
        description:
          'Convierte cada página de tu PDF en imágenes PNG nítidas con resolución efectiva de 300 DPI.',
      },
      extractPdfImages: {
        title: 'Extract PDF Images',
        badge: 'Extracción',
        description:
          'Extrae todas las imágenes incrustadas dentro del PDF en formato PNG o JPG con manejo de transparencias.',
      },
      imagesToPdf: {
        title: 'Images to PDF',
        badge: 'Creación',
        description:
          'Combina una o varias imágenes (PNG, JPG) en un único PDF con tamaño A3, A4, A5 u original centrado.',
      },
      mergePdf: {
        title: 'Merge PDF',
        badge: 'Organización',
        description:
          'Une dos o más archivos PDF en el orden que elijas conservando texto vectorial y enlaces sin rasterizar.',
      },
      splitPdf: {
        title: 'Split PDF',
        badge: 'Organización',
        description:
          'Extrae páginas individuales o rangos especificados (ej. 1-3, 5, 8-10) en documentos PDF independientes.',
      },
      extractPdfText: {
        title: 'Extract PDF Texts',
        badge: 'Contenido',
        description:
          'Extrae todo el texto digital estructurado del PDF por página para copiarlo al portapapeles o descargarlo en TXT.',
      },
      pdfToWord: {
        title: 'Convert PDF to Word',
        badge: 'Conversión',
        description:
          'Genera un documento Word (.docx) preservando la fidelidad visual exacta de cada página como imagen.',
      },
    },

    dropzone: {
      singleLabel: 'Arrastra tu archivo aquí',
      singleSublabel: 'o haz clic para explorar en tu dispositivo',
      multiLabel: 'Arrastra uno o varios archivos aquí',
      multiSublabel: 'o haz clic para seleccionar archivos',
      addMoreLabel: 'Agregar más archivos',
      addMoreSublabel: 'o arrástralos aquí',
      maxLimit: 'Máximo',
      singleFile: 'Archivo único',
      multiFile: 'Múltiples archivos permitidos',
      errorTooLarge: 'El archivo "{name}" supera el tamaño máximo de {max} MB.',
      errorEmpty: 'El archivo "{name}" está vacío (0 bytes).',
    },

    fileList: {
      selectedFiles: 'Archivos seleccionados',
      removeAll: 'Quitar todos',
      moveUp: 'Mover arriba',
      moveDown: 'Mover abajo',
      deleteFile: 'Eliminar archivo',
    },

    progress: {
      defaultStep: 'Procesando archivo...',
      waitMessage: 'Por favor espera mientras el servidor procesa el documento de forma segura.',
    },

    results: {
      successTitle: '¡Procesamiento completado con éxito!',
      filesReady: 'archivos generados listos para descargar.',
      downloadZip: 'Descargar ZIP',
      downloadFile: 'Descargar',
      newProcess: 'Nuevo',
      extractedTextTitle: 'Texto extraído',
      scanWarning: 'Advertencia: Documento sin texto seleccionable (posible escaneo)',
      copyText: 'Copiar texto',
      copied: '¡Copiado!',
      visualWordNotice:
        'Aviso de fidelidad visual: Este documento DOCX contiene las páginas del PDF renderizadas como imágenes de alta resolución para garantizar la apariencia original exacta. El contenido no es texto editable.',
      individualFiles: 'Archivos individuales',
      pageLabel: 'Pág.',
      download: 'Descargar',
      view: 'Ver',
      close: 'Cerrar',
      openInNewTab: 'Abrir en pestaña nueva',
    },

    workspace: {
      settingsTitle: 'Configuración de la herramienta',
      selectAtLeastOne: 'Por favor selecciona al menos un archivo para continuar.',
      selectMinFiles: 'Se requieren al menos {count} archivos para esta operación.',

      dpiLabel: 'Resolución de renderizado (DPI)',
      dpi300Title: '300 DPI (Recomendado)',
      dpi300Desc: 'Alta calidad para impresión y lectura nítida.',
      dpi150Title: '150 DPI (Rápido)',
      dpi150Desc: 'Menor tamaño de archivo y renderizado ágil.',
      actionPdfToImages: 'Convertir PDF a imágenes PNG',

      exportFormat: 'Formato de exportación',
      exportFormatDesc: 'PNG preserva transparencias; JPG aplica fondo blanco neutro.',
      formatPng: 'PNG (Transparencia)',
      formatJpg: 'JPG (Fondo blanco)',
      inspectPrompt: '¿Quieres previsualizar y elegir qué imágenes extraer?',
      inspectButton: 'Examinar imágenes del PDF',
      inspecting: 'Inspeccionando...',
      detectedImagesCount: 'imágenes incrustadas detectadas',
      selectAll: 'Seleccionar todas',
      deselectAll: 'Deselect all',
      actionExtractAll: 'Extraer imágenes del PDF',
      actionExtractSelected: 'Extraer {count} imágenes seleccionadas',

      pageSizeLabel: 'Tamaño de página del documento PDF',
      pageSizeAutoOrient:
        'La orientación (vertical/horizontal) se ajusta automáticamente según la proporción de cada imagen para evitar distorsiones o recortes.',
      stdIso: 'Estándar ISO',
      imgSize: 'Tamaño de imagen',
      actionImagesToPdf: 'Crear documento PDF',

      mergeInfo1:
        '• Los PDFs se combinarán en el orden exacto que aparece arriba. Usa las flechas para reordenar.',
      mergeInfo2:
        '• No se rasterizan las páginas: se conservan textos vectoriales, imágenes y enlaces.',
      actionMergePdf: 'Combinar archivos PDF',

      splitRangesLabel: 'Definir páginas o rangos a extraer',
      splitRangesPlaceholder: 'Ejemplo: 1-3, 5, 8-10',
      splitFormatsTitle: 'Formatos admitidos:',
      splitFormatsDesc:
        'Página única (ej. 3), rango continuo (ej. 2-5), o varios rangos separados por comas (ej. 1-3, 5, 8-10).',
      splitResultNote:
        'Cada rango generará un documento PDF independiente disponible para descarga individual o en ZIP.',
      actionSplitPdf: 'Dividir PDF',
      rangesEmptyError: 'Debes ingresar los rangos de páginas a dividir (ej. 1-3, 5).',

      extractTextInfo1:
        '• Extrae el texto digital estructurado página por página con separadores claros.',
      extractTextInfo2:
        '• Si el PDF es un documento escaneado sin capa de texto digital, la herramienta te lo advertirá claramente.',
      actionExtractPdfText: 'Extraer texto del PDF',

      wordFidelityTitle: 'Fidelidad visual garantizada (Páginas como imágenes)',
      wordFidelityDesc:
        'Esta herramienta convierte cada página del PDF en una imagen de alta resolución y la inserta en un documento Word (.docx). El resultado preserva el diseño visual exacto del PDF original, pero el texto no será editable.',
      actionPdfToWord: 'Convertir a Word (.docx)',
    },

    errors: {
      errorCode: 'Código de error:',
      dismiss: 'Cerrar advertencia',
    },
  },
};
