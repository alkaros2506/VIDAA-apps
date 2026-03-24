# @tv-app/wasm-engine

WebAssembly engine for offloading heavy computation from the DOM thread on resource-constrained TV hardware. Written in AssemblyScript (a TypeScript-like language) and compiled to WASM, with pure-JavaScript fallbacks for platforms where WASM is unavailable.

---

## Why WASM for TV Apps

TV hardware has limited CPU power and memory compared to desktop or mobile devices. The DOM thread must stay free for 60fps rendering and responsive input handling -- any blocking computation causes visible jank and dropped frames.

This package moves heavy tasks into a WebAssembly module:

- **Image processing** (blur effects for backgrounds)
- **String search** (filtering large content catalogs)
- **Sorting** (ordering datasets without blocking the UI)
- **Animation curves** (pre-computing easing values)
- **Fuzzy matching** (typo-tolerant search)

WASM executes at near-native speed and runs synchronously without the overhead of Web Worker message passing, making it ideal for operations that need to return results within a single frame.

---

## Installation

This package is part of the TV App Toolkit monorepo:

```json
{
  "dependencies": {
    "@tv-app/wasm-engine": "*"
  }
}
```

Run `npm install` from the repo root to resolve workspace dependencies.

---

## Available Functions

| Function | Signature | Purpose |
|----------|-----------|---------|
| `boxBlur` | `(data: Uint8ClampedArray, width: i32, height: i32, radius: i32) => Uint8ClampedArray` | Fast two-pass box blur on RGBA pixel data for background effects |
| `fastSearch` | `(haystack: string, needle: string) => i32` | String search returning index of first match, or -1 |
| `quickSort` | `(arr: Float64Array, low: i32, high: i32) => Float64Array` | In-place quicksort for sorting large datasets without blocking the UI |
| `easeOutCubic` | `(steps: i32) => Float64Array` | Pre-compute easing curve values for smooth focus animations |
| `levenshtein` | `(a: string, b: string) => i32` | Levenshtein edit distance for fuzzy search and typo tolerance |

---

## Building

```bash
cd packages/wasm-engine

# Compile AssemblyScript to WASM
npm run asbuild          # → build/release.wasm

# Full build: asbuild + TypeScript compilation
npm run build
```

The `asbuild` step compiles `assembly/index.ts` (AssemblyScript source) into `build/release.wasm`. The `build` step also compiles the TypeScript wrapper in `src/` that provides the loading logic and JS fallbacks.

---

## Usage in a Vite App

```typescript
import { loadEngineWithFallback } from '@tv-app/wasm-engine';

const engine = await loadEngineWithFallback(
  new URL('@tv-app/wasm-engine/build/release.wasm', import.meta.url).href
);

// Fuzzy search
const distance = engine.levenshtein('hello', 'helo');  // → 1

// Sort a dataset
const ratings = new Float64Array([4.2, 3.8, 4.9, 3.1, 4.5]);
engine.quickSort(ratings, 0, ratings.length - 1);

// Pre-compute animation curve
const curve = engine.easeOutCubic(60);  // 60 steps for a 1-second animation at 60fps

// Background blur
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const blurred = engine.boxBlur(imageData.data, canvas.width, canvas.height, 8);
```

---

## JavaScript Fallback

The `jsFallback` object provides pure-JavaScript implementations of every WASM function. This ensures your app works on platforms where WebAssembly is unavailable or fails to load (some older TV browsers, restricted environments).

```typescript
import { loadEngineWithFallback, jsFallback } from '@tv-app/wasm-engine';

// Automatic fallback: tries WASM first, falls back to JS if loading fails
const engine = await loadEngineWithFallback(wasmUrl);

// Or use the JS fallback directly (e.g., in tests)
const distance = jsFallback.levenshtein('hello', 'helo');
```

`loadEngineWithFallback()` is the recommended entry point. It attempts to load and instantiate the WASM module, and if that fails for any reason (network error, unsupported platform, compilation failure), it silently returns the `jsFallback` object instead. The returned engine has the same interface either way.

---

## Adding New Functions

1. **Write the function in `assembly/index.ts`** using AssemblyScript syntax:

   ```typescript
   // assembly/index.ts
   export function myFunction(input: i32): i32 {
     // AssemblyScript code here
     return input * 2;
   }
   ```

2. **Add to the `WasmEngine` interface** in `src/index.ts`:

   ```typescript
   export interface WasmEngine {
     // ... existing functions
     myFunction(input: number): number;
   }
   ```

3. **Add a JS fallback** in the `jsFallback` object in `src/index.ts`:

   ```typescript
   export const jsFallback: WasmEngine = {
     // ... existing fallbacks
     myFunction(input: number): number {
       return input * 2;
     },
   };
   ```

4. **Add tests** for the fallback implementation to ensure correctness.

5. **Rebuild** the WASM module:

   ```bash
   npm run asbuild
   ```

---

## AssemblyScript Gotchas

AssemblyScript looks like TypeScript but compiles to WebAssembly, which imposes several constraints:

| Gotcha | Details |
|--------|---------|
| **Numeric types** | Use explicit types: `i32`, `i64`, `f32`, `f64`, `u8`, `u16`, `u32`. Regular `number` maps to `f64`. |
| **No closures** | Functions cannot capture variables from their enclosing scope. Pass everything as arguments. |
| **No union types** | `string | null` is only supported for reference types. Primitive unions are not allowed. |
| **`unchecked()` for performance** | Wrap array accesses in `unchecked()` to skip bounds checking in hot loops: `unchecked(arr[i])`. Only use this when you are certain the index is valid. |
| **No dynamic objects** | No `Record`, `Map` with string keys, or arbitrary object shapes. Use typed arrays and explicit parameters. |
| **String handling** | Strings are UTF-16 encoded. Passing strings across the WASM boundary has overhead -- prefer numeric arrays for hot paths. |

Refer to the [AssemblyScript documentation](https://www.assemblyscript.org/introduction.html) for the full language reference.

---

## Project Structure

```
packages/wasm-engine/
├── assembly/
│   ├── index.ts               # AssemblyScript source (compiles to WASM)
│   └── tsconfig.json          # AssemblyScript compiler config
├── build/
│   └── release.wasm           # Compiled WASM binary (generated by asbuild)
├── src/
│   ├── index.ts               # WasmEngine interface, loader, jsFallback
│   └── __tests__/             # Unit tests
├── package.json
└── tsconfig.json
```

---

## Testing

```bash
# From the monorepo root
npx turbo run test --filter=@tv-app/wasm-engine

# With coverage
npx turbo run test:coverage --filter=@tv-app/wasm-engine
```

Tests run in a jsdom environment and primarily exercise the JavaScript fallback implementations, since WASM instantiation is not available in jsdom. The fallback tests verify that every function produces correct results, ensuring parity between the WASM and JS code paths.
