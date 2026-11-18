import { ValidationError } from '../utils/errors.js';

export interface ParsedRange {
  start: number;
  end: number;
  label: string;
}

/**
 * Validates and parses page range expressions like:
 * "1-3, 5, 8-10"
 */
export function parseAndValidateRanges(
  rangeInput: string,
  totalPages?: number
): ParsedRange[] {
  if (!rangeInput || typeof rangeInput !== 'string') {
    throw new ValidationError(
      'Debes ingresar uno o más rangos de páginas (ejemplo: 1-3, 5, 8-10).'
    );
  }

  const trimmed = rangeInput.trim();
  if (trimmed.length === 0) {
    throw new ValidationError('El campo de rangos de páginas no puede estar vacío.');
  }

  const segments = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
  if (segments.length === 0) {
    throw new ValidationError(
      'No se detectaron rangos válidos. Utiliza el formato: 1-3, 5, 8-10.'
    );
  }

  const result: ParsedRange[] = [];
  const claimedPages = new Set<number>();

  for (const seg of segments) {
    // Single page: e.g. "5"
    if (/^\d+$/.test(seg)) {
      const page = parseInt(seg, 10);
      if (page <= 0) {
        throw new ValidationError(`La página ${page} es inválida. La numeración inicia en 1.`);
      }
      if (totalPages !== undefined && page > totalPages) {
        throw new ValidationError(
          `La página ${page} supera el total de páginas del documento (${totalPages}).`
        );
      }
      if (claimedPages.has(page)) {
        throw new ValidationError(
          `La página ${page} está repetida en múltiples rangos. Especifica rangos sin solapamiento.`
        );
      }
      claimedPages.add(page);
      result.push({
        start: page,
        end: page,
        label: `pag-${page}`,
      });
      continue;
    }

    // Range: e.g. "2-5"
    const match = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    if (match) {
      const start = parseInt(match[1], 10);
      const end = parseInt(match[2], 10);

      if (start <= 0 || end <= 0) {
        throw new ValidationError('Los números de página deben ser mayores que 0.');
      }
      if (start > end) {
        throw new ValidationError(
          `El rango "${seg}" está invertido (${start} > ${end}). El inicio no puede ser mayor que el fin.`
        );
      }
      if (totalPages !== undefined && end > totalPages) {
        throw new ValidationError(
          `El rango "${seg}" excede el total de páginas del documento (${totalPages}).`
        );
      }

      for (let p = start; p <= end; p++) {
        if (claimedPages.has(p)) {
          throw new ValidationError(
            `La página ${p} del rango "${seg}" se solapa con otro rango ya definido.`
          );
        }
        claimedPages.add(p);
      }

      result.push({
        start,
        end,
        label: `pag-${start}-${end}`,
      });
      continue;
    }

    throw new ValidationError(
      `Formato de rango no reconocido: "${seg}". Utiliza números separados por comas o guiones (ejemplo: 1-3, 5, 8-10).`
    );
  }

  return result;
}
