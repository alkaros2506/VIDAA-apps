# @tv-app/wasm-engine

WebAssembly engine for the TV App Toolkit. Offloads heavy computation from the DOM thread to keep rendering and input handling smooth on constrained TV hardware.

---

## Why WASM for TV Apps

Smart TV hardware is significantly more constrained than desktop or mobile devices. Typical TV SoCs have low-power CPUs (often ARM Cortex-A53 class) and limited RAM (512MB-2GB shared between OS and apps). The browser's main thread must handle:

- React rendering and reconciliation
- Spatial navigation calculations
- User input with low latency (remote control must feel instant)

Any heavy computation on the main thread causes dropped frames and input lag, which is especially noticeable on TV because users are watching at 60fps from a couch with a slow remote.

The WASM engine moves expensive operations (image processing, sorting, string matching) into a WebAssembly module that executes at near-native speed, keeping the DOM thread free for what it does best: rendering and responding to input.

---

## AssemblyScript

The WASM module is written in [AssemblyScript](https://www.assemblyscript.org/), a TypeScript-like language that compiles to WebAssembly. AssemblyScript looks familiar to TypeScript developers but has important differences:

- Uses explicit numeric types: `i32`, `f64`, `u8` instead of `number`
- No closures, union types, or `any`/`unknown`
- Arrays are typed: `Int32Array`, `Float64Array`, `Uint8ClampedArray`
- `unchecked()` skips bounds checking for performance
- No access to DOM or Node.js APIs

The source lives in `assembly/index.ts` and compiles to `build/release.wasm`.

---

## Available Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `boxBlur` | `(data: Uint8ClampedArray, width: i32, height: i32, radius: i32) => void` | Two-pass (horizontal + vertical) box blur on RGBA pixel data. Modifies the buffer in-place. Useful for background blur effects without GPU shaders. |
| `fastSearch` | `(haystack: string, needle: string) => i32` | Fast substring search. Returns the index of the first match, or -1 if not found. Useful for filtering large content catalogs client-side. |
| `quickSort` | `(arr: Float64Array, low: i32, high: i32) => void` | In-place quicksort on a Float64Array between indices `low` and `high` (inclusive). Useful for sorting large datasets (ratings, dates, prices) without blocking the UI. |
| `easeOutCubic` | `(steps: i32) => Float64Array` | Pre-computes an easeOutCubic animation curve with the given number of steps. Returns a Float64Array of values from 0.0 to 1.0. Useful for pre-computing animation frames in WASM and applying them in JS. |
| `levenshtein` | `(a: string, b: string) => i32` | Computes the Levenshtein edit distance between two strings. Useful for fuzzy search and typo tolerance in content search UIs. |

---

## Building

```bash
# Compile AssemblyScript to WASM (release build)
npm run asbuild

# Compile + build TypeScript bridge
npm run build

# Debug build (includes source maps, no optimizations)
npm run asbuild:debug
```

The build produces:

| File | Description |
|------|-------------|
| `build/release.wasm` | Optimized WASM binary (optimize level 3, shrink level 1) |
| `build/release.wat` | Human-readable WebAssembly text format |
| `build/debug.wasm` | Debug WASM binary with source maps |
| `build/debug.wat` | Debug text format |
| `dist/index.js` | TypeScript bridge (JS loader + fallbacks) |
| `dist/index.d.ts` | Type declarations |

Build configuration is in `asconfig.json`.

---

## Loading in a Vite App

```ts
import { loadWasmEngine } from '@tv-app/wasm-engine';

// Vite resolves the URL at build time
const wasmUrl = new URL(
  '../node_modules/@tv-app/wasm-engine/build/release.wasm',
  import.meta.url
).href;

const engine = await loadWasmEngine(wasmUrl);

// Use WASM functions
const distance = engine.levenshtein('netflix', 'netflx');  // 1
const index = engine.fastSearch('The Lord of the Rings', 'Rings');  // 16
```

### API

```ts
// Load WASM module (cached after first call)
loadWasmEngine(wasmUrl: string): Promise<WasmEngine>

// Get already-loaded engine (throws if not loaded)
getWasmEngine(): WasmEngine

// Load WASM with automatic JS fallback
loadEngineWithFallback(wasmUrl: string): Promise<WasmEngine>

// Pure-JS implementations of all WASM functions
jsFallback: WasmEngine
```

---

## JS Fallback for Graceful Degradation

Every WASM function has a pure-JavaScript fallback implementation in `jsFallback`. This ensures your app works even if WASM fails to load (rare on modern TV browsers, but possible on very old firmware).

Use `loadEngineWithFallback()` in production:

```ts
import { loadEngineWithFallback } from '@tv-app/wasm-engine';

// Tries WASM first, falls back to JS if it fails
const engine = await loadEngineWithFallback(wasmUrl);
```

You can also use the fallback directly for testing:

```ts
import { jsFallback } from '@tv-app/wasm-engine';

const distance = jsFallback.levenshtein('hello', 'helo');  // 1
```

The `boxBlur` JS fallback is a no-op (logs a warning). In production, implement a JS box blur if you need this function without WASM.

---

## Adding New WASM Functions

1. **Write the function in `assembly/index.ts`** using AssemblyScript syntax:
   ```ts
   export function myFunction(input: i32): i32 {
     return input * 2;
   }
   ```

2. **Update the `WasmEngine` interface in `src/index.ts`**:
   ```ts
   export interface WasmEngine {
     // ... existing functions
     myFunction(input: number): number;
   }
   ```

3. **Add a JS fallback in `src/index.ts`**:
   ```ts
   export const jsFallback: WasmEngine = {
     // ... existing fallbacks
     myFunction(input) {
       return input * 2;
     },
   };
   ```

4. **Add tests in `src/__tests__/jsFallback.test.ts`** for the fallback implementation.

5. **Recompile**:
   ```bash
   npm run asbuild
   ```

---

## Performance Tips for TV Hardware

**Do:**
- Pre-compute values in WASM during loading or idle time, then consume the results in JS.
- Use typed arrays (`Float64Array`, `Uint8ClampedArray`) for data exchange -- they share memory efficiently with WASM.
- Batch operations. Calling WASM once with a large dataset is faster than many small calls due to the JS-WASM boundary overhead.
- Use `loadEngineWithFallback()` so your app never crashes if WASM fails.

**Avoid:**
- Frequent small WASM calls in a render loop. The JS-WASM boundary has overhead (~microseconds per call, which adds up at 60fps).
- Allocating large buffers in WASM on every frame. Reuse buffers across calls.
- Passing strings back and forth frequently -- string marshaling between JS and WASM is expensive. Pass indices or numeric data when possible.
- Blocking the main thread with synchronous WASM computation. For very large datasets, consider chunking the work across multiple frames using `requestAnimationFrame`.

---

## Testing

```bash
# From the monorepo root
npx turbo run test --filter=@tv-app/wasm-engine

# With coverage
npx turbo run test:coverage --filter=@tv-app/wasm-engine
```

Tests validate the JS fallback implementations. WASM binary tests require building first (`npm run asbuild`).
