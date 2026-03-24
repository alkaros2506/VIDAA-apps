/**
 * WASM Engine — AssemblyScript module for TV apps.
 *
 * Offload heavy computations here to keep the DOM thread free.
 * The JS thread should only handle rendering and user input.
 *
 * Exported functions are callable from JavaScript via the WASM bridge.
 */

// === Image Processing ===

/**
 * Apply a fast box blur to RGBA pixel data in-place.
 * Useful for background blur effects on TV UIs without taxing the GPU.
 *
 * @param data - Pointer to RGBA pixel buffer
 * @param width - Image width in pixels
 * @param height - Image height in pixels
 * @param radius - Blur radius (pixels)
 */
export function boxBlur(
  data: Uint8ClampedArray,
  width: i32,
  height: i32,
  radius: i32,
): void {
  if (radius <= 0) return;
  const size = width * height * 4;
  const temp = new Uint8ClampedArray(size);

  // Horizontal pass
  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      let r: i32 = 0, g: i32 = 0, b: i32 = 0, a: i32 = 0, count: i32 = 0;
      for (let dx: i32 = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          const idx = (y * width + nx) * 4;
          r += unchecked(data[idx]);
          g += unchecked(data[idx + 1]);
          b += unchecked(data[idx + 2]);
          a += unchecked(data[idx + 3]);
          count++;
        }
      }
      const outIdx = (y * width + x) * 4;
      unchecked(temp[outIdx] = <u8>(r / count));
      unchecked(temp[outIdx + 1] = <u8>(g / count));
      unchecked(temp[outIdx + 2] = <u8>(b / count));
      unchecked(temp[outIdx + 3] = <u8>(a / count));
    }
  }

  // Vertical pass
  for (let y: i32 = 0; y < height; y++) {
    for (let x: i32 = 0; x < width; x++) {
      let r: i32 = 0, g: i32 = 0, b: i32 = 0, a: i32 = 0, count: i32 = 0;
      for (let dy: i32 = -radius; dy <= radius; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          const idx = (ny * width + x) * 4;
          r += unchecked(temp[idx]);
          g += unchecked(temp[idx + 1]);
          b += unchecked(temp[idx + 2]);
          a += unchecked(temp[idx + 3]);
          count++;
        }
      }
      const outIdx = (y * width + x) * 4;
      unchecked(data[outIdx] = <u8>(r / count));
      unchecked(data[outIdx + 1] = <u8>(g / count));
      unchecked(data[outIdx + 2] = <u8>(b / count));
      unchecked(data[outIdx + 3] = <u8>(a / count));
    }
  }
}

// === Data Processing ===

/**
 * Fast string search using a simplified Rabin-Karp rolling hash.
 * Useful for filtering large content catalogs client-side on TV.
 *
 * @returns index of first match, or -1 if not found
 */
export function fastSearch(haystack: string, needle: string): i32 {
  const hLen = haystack.length;
  const nLen = needle.length;

  if (nLen === 0) return 0;
  if (nLen > hLen) return -1;

  for (let i: i32 = 0; i <= hLen - nLen; i++) {
    let match = true;
    for (let j: i32 = 0; j < nLen; j++) {
      if (haystack.charCodeAt(i + j) !== needle.charCodeAt(j)) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }

  return -1;
}

/**
 * Sort an array of f64 values using quicksort.
 * Useful for sorting large datasets (e.g., ratings, dates) without blocking the UI.
 */
export function quickSort(arr: Float64Array, low: i32, high: i32): void {
  if (low < high) {
    const pivotIdx = partition(arr, low, high);
    quickSort(arr, low, pivotIdx - 1);
    quickSort(arr, pivotIdx + 1, high);
  }
}

function partition(arr: Float64Array, low: i32, high: i32): i32 {
  const pivot = unchecked(arr[high]);
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (unchecked(arr[j]) <= pivot) {
      i++;
      const tmp = unchecked(arr[i]);
      unchecked(arr[i] = unchecked(arr[j]));
      unchecked(arr[j] = tmp);
    }
  }
  const tmp = unchecked(arr[i + 1]);
  unchecked(arr[i + 1] = unchecked(arr[high]));
  unchecked(arr[high] = tmp);
  return i + 1;
}

// === Math Utilities ===

/**
 * Compute easing curve values for smooth animations.
 * Pre-compute animation frames in WASM, apply in JS.
 *
 * @param steps - Number of animation steps
 * @returns Float64Array of eased values from 0.0 to 1.0
 */
export function easeOutCubic(steps: i32): Float64Array {
  const result = new Float64Array(steps);
  for (let i: i32 = 0; i < steps; i++) {
    const t: f64 = <f64>i / <f64>(steps - 1);
    const val: f64 = 1.0 - (1.0 - t) ** 3;
    unchecked(result[i] = val);
  }
  return result;
}

/**
 * Levenshtein distance for fuzzy search in content catalogs.
 */
export function levenshtein(a: string, b: string): i32 {
  const aLen = a.length;
  const bLen = b.length;

  if (aLen === 0) return bLen;
  if (bLen === 0) return aLen;

  const matrix = new Int32Array((aLen + 1) * (bLen + 1));
  const cols = bLen + 1;

  for (let i: i32 = 0; i <= aLen; i++) unchecked(matrix[i * cols] = i);
  for (let j: i32 = 0; j <= bLen; j++) unchecked(matrix[j] = j);

  for (let i: i32 = 1; i <= aLen; i++) {
    for (let j: i32 = 1; j <= bLen; j++) {
      const cost: i32 = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      const del = unchecked(matrix[(i - 1) * cols + j]) + 1;
      const ins = unchecked(matrix[i * cols + (j - 1)]) + 1;
      const sub = unchecked(matrix[(i - 1) * cols + (j - 1)]) + cost;
      unchecked(matrix[i * cols + j] = min(del, min(ins, sub)));
    }
  }

  return unchecked(matrix[aLen * cols + bLen]);
}

function min(a: i32, b: i32): i32 {
  return a < b ? a : b;
}
