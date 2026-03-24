import { describe, it, expect } from 'vitest';
import { jsFallback } from '../index';

describe('jsFallback', () => {
  describe('fastSearch', () => {
    it('finds substring', () => {
      expect(jsFallback.fastSearch('hello world', 'world')).toBe(6);
    });

    it('returns -1 when not found', () => {
      expect(jsFallback.fastSearch('hello', 'xyz')).toBe(-1);
    });

    it('handles empty needle', () => {
      expect(jsFallback.fastSearch('hello', '')).toBe(0);
    });
  });

  describe('quickSort', () => {
    it('sorts array in place', () => {
      const arr = new Float64Array([5, 3, 8, 1, 9, 2]);
      jsFallback.quickSort(arr, 0, arr.length - 1);
      expect(Array.from(arr)).toEqual([1, 2, 3, 5, 8, 9]);
    });

    it('handles already sorted array', () => {
      const arr = new Float64Array([1, 2, 3]);
      jsFallback.quickSort(arr, 0, 2);
      expect(Array.from(arr)).toEqual([1, 2, 3]);
    });

    it('handles single element', () => {
      const arr = new Float64Array([42]);
      jsFallback.quickSort(arr, 0, 0);
      expect(Array.from(arr)).toEqual([42]);
    });
  });

  describe('easeOutCubic', () => {
    it('returns correct number of steps', () => {
      const result = jsFallback.easeOutCubic(10);
      expect(result.length).toBe(10);
    });

    it('starts at 0 and ends at 1', () => {
      const result = jsFallback.easeOutCubic(100);
      expect(result[0]).toBeCloseTo(0, 5);
      expect(result[99]).toBeCloseTo(1, 5);
    });

    it('values are monotonically increasing', () => {
      const result = jsFallback.easeOutCubic(50);
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThanOrEqual(result[i - 1]);
      }
    });
  });

  describe('levenshtein', () => {
    it('returns 0 for identical strings', () => {
      expect(jsFallback.levenshtein('hello', 'hello')).toBe(0);
    });

    it('returns length for empty comparison', () => {
      expect(jsFallback.levenshtein('hello', '')).toBe(5);
      expect(jsFallback.levenshtein('', 'hello')).toBe(5);
    });

    it('computes correct edit distance', () => {
      expect(jsFallback.levenshtein('kitten', 'sitting')).toBe(3);
      expect(jsFallback.levenshtein('saturday', 'sunday')).toBe(3);
    });

    it('handles single character difference', () => {
      expect(jsFallback.levenshtein('cat', 'car')).toBe(1);
    });
  });
});
