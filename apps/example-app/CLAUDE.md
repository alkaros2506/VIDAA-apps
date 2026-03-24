# Example TV App — Claude Code Guide

## Purpose
Demo app showing how to use the TV App Toolkit. Streaming-style UI with hero banner and content rows.

## Key Files
- `src/main.tsx` — Entry point: initializes VidaaApp, renders TVApp wrapper
- `src/App.tsx` — Main layout: hero banner + content rows + detail overlay
- `src/components/HeroBanner.tsx` — Featured content with focusable Play/Info buttons
- `src/components/ContentRow.tsx` — Horizontal scrollable row with FocusContext
- `src/components/ContentCard.tsx` — Individual card with focus styling
- `src/data.ts` — Mock data (replace with real API calls)
- `src/styles.css` — TV-optimized styles (1920x1080, safe area, focus states)
- `index.html` — Entry HTML with 1920px viewport

## Running
```bash
npm run dev              # From monorepo root (runs example-app via Turborepo)
# or
cd apps/example-app && npx vite
```

## Key Patterns
- Every interactive element uses `FocusableItem` from @tv-app/core
- `ContentRow` creates its own `FocusContext.Provider` for scoped navigation
- Focus styles use transform: scale(1.1) + white border + box-shadow
- The detail overlay appears on card selection and dismisses on Back key
- `useRemoteControl({ onBack })` handles Back button at the app level

## Testing
```bash
npx turbo run test --filter=example-app
```
Core library is mocked in tests — tests focus on rendering and component behavior.
