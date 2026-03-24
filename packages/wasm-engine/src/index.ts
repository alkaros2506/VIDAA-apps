/**
 * WASM Engine — JavaScript bridge for the AssemblyScript WASM module.
 *
 * Loads the WASM module and exposes typed functions.
 * Heavy computation runs in WASM; results are passed back to the DOM layer.
 */

export interface WasmEngine {
  /** Apply box blur to RGBA pixel data */
  boxBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): void;
  /** Fast string search — returns index or -1 */
  fastSearch(haystack: string, needle: string): number;
  /** Quicksort a Float64Array in-place */
  quickSort(arr: Float64Array, low: number, high: number): void;
  /** Pre-compute easeOutCubic animation curve */
  easeOutCubic(steps: number): Float64Array;
  /** Levenshtein edit distance for fuzzy matching */
  levenshtein(a: string, b: string): number;
}

let engineInstance: WasmEngine | null = null;

/**
 * Load and instantiate the WASM engine.
 *
 * @param wasmUrl - URL or path to the .wasm file.
 *   In Vite, use: `new URL('../build/release.wasm', import.meta.url).href`
 */
export async function loadWasmEngine(wasmUrl: string): Promise<WasmEngine> {
  if (engineInstance) return engineInstance;

  try {
    const response = await fetch(wasmUrl);
    const wasmBuffer = await response.arrayBuffer();

    const { instance } = await WebAssembly.instantiate(wasmBuffer, {
      env: {
        abort: (_msg: number, _file: number, line: number, column: number) => {
          console.error(`WASM abort at ${line}:${column}`);
        },
      },
    });

    const exports = instance.exports as unknown as WasmEngine;

    engineInstance = exports;
    return exports;
  } catch (error) {
    console.error('Failed to load WASM engine:', error);
    throw error;
  }
}

/**
 * Get the WASM engine if already loaded.
 * @throws if engine hasn't been loaded yet
 */
export function getWasmEngine(): WasmEngine {
  if (!engineInstance) {
    throw new Error('WASM engine not loaded. Call loadWasmEngine() first.');
  }
  return engineInstance;
}

/**
 * Fallback pure-JS implementations for when WASM is unavailable.
 * TV browsers should all support WASM, but this provides graceful degradation.
 */
export const jsFallback: WasmEngine = {
  boxBlur(_data, _width, _height, _radius) {
    console.warn('boxBlur: using JS fallback — performance may be reduced');
    // No-op fallback; in production, implement a JS box blur
  },
  fastSearch(haystack, needle) {
    return haystack.indexOf(needle);
  },
  quickSort(arr, low, high) {
    // Use native sort as fallback
    const sub = Array.from(arr.slice(low, high + 1)).sort((a, b) => a - b);
    for (let i = 0; i < sub.length; i++) {
      arr[low + i] = sub[i];
    }
  },
  easeOutCubic(steps) {
    const result = new Float64Array(steps);
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      result[i] = 1 - Math.pow(1 - t, 3);
    }
    return result;
  },
  levenshtein(a, b) {
    const matrix: number[][] = [];
    for (let i = 0; i <= a.length; i++) {
      matrix[i] = [i];
      for (let j = 1; j <= b.length; j++) {
        if (i === 0) {
          matrix[i][j] = j;
        } else {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + cost,
          );
        }
      }
    }
    return matrix[a.length][b.length];
  },
};

/**
 * Load the WASM engine with automatic JS fallback.
 * Use this in production for resilience.
 */
export async function loadEngineWithFallback(wasmUrl: string): Promise<WasmEngine> {
  try {
    return await loadWasmEngine(wasmUrl);
  } catch {
    console.warn('WASM unavailable, using JS fallback engine');
    return jsFallback;
  }
}
