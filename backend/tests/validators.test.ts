import { describe, it, expect } from 'vitest';
import { parseAndValidateRanges } from '../src/validators/range.validator.js';
import { ValidationError } from '../src/utils/errors.js';

describe('Range Validator', () => {
  it('parses a single page correctly', () => {
    const res = parseAndValidateRanges('3');
    expect(res).toEqual([{ start: 3, end: 3, label: 'pag-3' }]);
  });

  it('parses a page range correctly', () => {
    const res = parseAndValidateRanges('2-5');
    expect(res).toEqual([{ start: 2, end: 5, label: 'pag-2-5' }]);
  });

  it('parses multiple disjoint ranges in order', () => {
    const res = parseAndValidateRanges('1-3, 5, 8-10');
    expect(res).toEqual([
      { start: 1, end: 3, label: 'pag-1-3' },
      { start: 5, end: 5, label: 'pag-5' },
      { start: 8, end: 10, label: 'pag-8-10' },
    ]);
  });

  it('throws ValidationError for empty string', () => {
    expect(() => parseAndValidateRanges('')).toThrow(ValidationError);
    expect(() => parseAndValidateRanges('   ')).toThrow(ValidationError);
  });

  it('throws ValidationError for page 0 or negative', () => {
    expect(() => parseAndValidateRanges('0')).toThrow('La numeración inicia en 1');
    expect(() => parseAndValidateRanges('-2')).toThrow(ValidationError);
  });

  it('throws ValidationError for inverted range (5-2)', () => {
    expect(() => parseAndValidateRanges('5-2')).toThrow('está invertido');
  });

  it('throws ValidationError when page exceeds totalPages', () => {
    expect(() => parseAndValidateRanges('1-10', 5)).toThrow('excede el total de páginas');
    expect(() => parseAndValidateRanges('6', 5)).toThrow('supera el total de páginas');
  });

  it('throws ValidationError for overlapping pages in ranges', () => {
    expect(() => parseAndValidateRanges('1-4, 3-5')).toThrow('se solapa');
    expect(() => parseAndValidateRanges('2, 2')).toThrow('repetida');
  });

  it('throws ValidationError for malformed expression', () => {
    expect(() => parseAndValidateRanges('abc')).toThrow('Formato de rango no reconocido');
  });
});
