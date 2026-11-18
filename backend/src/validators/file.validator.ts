import fs from 'node:fs';
import { fileService } from '../services/file.service.js';
import { ValidationError } from '../utils/errors.js';

export function validateSinglePdf(file?: Express.Multer.File): Express.Multer.File {
  if (!file) {
    throw new ValidationError('No se ha recibido ningún archivo PDF.');
  }

  if (file.size === 0) {
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    throw new ValidationError('El archivo PDF está vacío (0 bytes).');
  }

  const isPdf = fileService.validatePdfMagicBytes(file.path);
  if (!isPdf) {
    try { fs.unlinkSync(file.path); } catch { /* ignore */ }
    throw new ValidationError(
      'El archivo recibido no es un PDF válido o está corrupto.'
    );
  }

  return file;
}

export function validateMultiplePdfs(files?: Express.Multer.File[]): Express.Multer.File[] {
  if (!files || files.length < 2) {
    if (files) {
      files.forEach((f) => {
        try { fs.unlinkSync(f.path); } catch { /* ignore */ }
      });
    }
    throw new ValidationError('Se requieren al menos dos archivos PDF para combinar.');
  }

  for (const file of files) {
    if (file.size === 0) {
      files.forEach((f) => { try { fs.unlinkSync(f.path); } catch { /* ignore */ } });
      throw new ValidationError(`El archivo "${file.originalname}" está vacío.`);
    }

    if (!fileService.validatePdfMagicBytes(file.path)) {
      files.forEach((f) => { try { fs.unlinkSync(f.path); } catch { /* ignore */ } });
      throw new ValidationError(
        `El archivo "${file.originalname}" no es un documento PDF válido.`
      );
    }
  }

  return files;
}

export function validateImages(files?: Express.Multer.File[]): Express.Multer.File[] {
  if (!files || files.length === 0) {
    throw new ValidationError('Debes seleccionar al menos una imagen (PNG o JPG).');
  }

  for (const file of files) {
    if (file.size === 0) {
      files.forEach((f) => { try { fs.unlinkSync(f.path); } catch { /* ignore */ } });
      throw new ValidationError(`La imagen "${file.originalname}" está vacía.`);
    }

    const type = fileService.validateImageMagicBytes(file.path);
    if (!type) {
      files.forEach((f) => { try { fs.unlinkSync(f.path); } catch { /* ignore */ } });
      throw new ValidationError(
        `El archivo "${file.originalname}" no es una imagen PNG o JPG/JPEG válida.`
      );
    }
  }

  return files;
}
