# @tv-app/wasm-engine — Claude Code Guide

## Purpose
WebAssembly module for offloading heavy computation from the DOM thread.
Written in AssemblyScript (TypeScript subset), compiled to WASM.

## Key Files
- `assembly/index.ts` — AssemblyScript source (compiles to WASM). Contains: boxBlur, fastSearch, quickSort, easeOutCubic, levenshtein
- `src/index.ts` — JS bridge: loadWasmEngine(), getWasmEngine(), jsFallback, loadEngineWithFallback()
- `asconfig.json` — AssemblyScript compiler config (debug + release targets)

## Build
```bash
npm run asbuild          # Compile AssemblyScript → build/release.wasm
npm run build            # asbuild + tsc
```

## Important Notes
- AssemblyScript is NOT TypeScript — it's a subset. Key differences:
  - Uses `i32`, `f64`, `u8` numeric types
  - `unchecked()` skips bounds checking for performance
  - No closures, no union types, no any/unknown
  - Arrays are typed (Int32Array, Float64Array, Uint8ClampedArray)
- The `jsFallback` object provides pure-JS implementations for every WASM function
- `loadEngineWithFallback()` tries WASM first, falls back to JS — use this in production
- WASM is loaded via fetch + WebAssembly.instantiate — needs to be served with correct MIME type
- In Vite: use `new URL('../build/release.wasm', import.meta.url).href` to get the WASM URL

## When Modifying WASM Functions
1. Edit `assembly/index.ts`
2. Update the `WasmEngine` interface in `src/index.ts`
3. Update `jsFallback` in `src/index.ts`
4. Add tests for the fallback in `src/__tests__/jsFallback.test.ts`
5. Run `npm run asbuild` to recompile
