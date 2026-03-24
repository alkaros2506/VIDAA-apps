# TV App Toolkit — Claude Code Guide

## Project Overview
Cookiecutter monorepo for building TV apps targeting VIDAA (Hisense), Apple tvOS, with planned support for Android TV, LG webOS, and Samsung Tizen.

## Tech Stack
- **Monorepo**: npm workspaces + Turborepo
- **Language**: TypeScript (strict mode)
- **UI Framework**: React 18 with Norigin Spatial Navigation
- **Build**: Vite (apps), tsc (packages)
- **Test**: Vitest + @testing-library/react + jsdom
- **WASM**: AssemblyScript → WebAssembly
- **CI**: GitHub Actions

## Repository Structure
```
packages/core/           — Shared React components, hooks, spatial nav, input handling
packages/platform-vidaa/ — VIDAA/Hisense platform layer
packages/platform-tvos/  — Apple tvOS platform layer (JS bridge + Swift template)
packages/wasm-engine/    — AssemblyScript WASM module + JS bridge with fallback
apps/example-app/        — Demo streaming UI app
```

## Key Commands
- `npm install` — Install all workspace dependencies
- `npm run dev` — Start example app dev server (port 5173)
- `npm test` — Run all tests via Turborepo
- `npm run test:coverage` — Tests with coverage reports
- `npm run build` — Build all packages and apps
- `npm run lint` — ESLint all packages
- `npm run typecheck` — TypeScript type checking

## Architecture Principles
1. **DOM for rendering only** — Heavy computation goes to WASM, DOM thread stays free for 60fps
2. **Spatial navigation** — All UI must be navigable with D-pad (Up/Down/Left/Right + Enter + Back)
3. **Platform abstraction** — Core package is platform-agnostic; platform packages handle specifics
4. **Graceful degradation** — WASM has JS fallbacks; platform features degrade in browser

## TV-Specific Constraints
- Target resolution: 1920x1080 (Full HD)
- No mouse/cursor — everything is D-pad navigated
- Every interactive element MUST have a visible focus state
- Back key on root screen must exit the app (VIDAA requirement)
- Memory is constrained — avoid large bundle sizes and memory leaks
- No lazy loading / code splitting — TV browsers handle single bundles better

## Key Mappings (Critical Knowledge)
- Arrow keys: 37(Left), 38(Up), 39(Right), 40(Down)
- Enter/OK: 13
- Back: 461 (VIDAA/webOS), 10009 (Tizen), 27 (tvOS/Android), 8 (fallback)
- Color buttons: 403(Red), 404(Green), 405(Yellow), 406(Blue)

## Testing Guidelines
- Every new component/hook needs unit tests
- Use `renderHook` from @testing-library/react for hook tests
- Mock `@tv-app/core` in app-level tests
- Test focus states and key event handling
- Run tests with: `npx turbo run test --filter=<package>`

## When Adding a New Platform
1. Create `packages/platform-<name>/` with the same structure as platform-vidaa
2. Add platform detection to `packages/core/src/hooks/usePlatform.tsx`
3. Add key code mappings to `packages/core/src/input/keyCodes.ts`
4. Add test matrix entry in `.github/workflows/ci.yml`
5. Create README.md and CLAUDE.md for the new package
6. Update root README.md platform support table

## When Adding New WASM Functions
1. Write the function in `packages/wasm-engine/assembly/index.ts` (AssemblyScript)
2. Add the TypeScript signature to the `WasmEngine` interface in `packages/wasm-engine/src/index.ts`
3. Add a JS fallback implementation in `jsFallback`
4. Add tests for the JS fallback
5. Run `npm run asbuild` in wasm-engine to compile
