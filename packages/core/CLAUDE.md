# @tv-app/core — Claude Code Guide

## Purpose
Shared React library for TV app development. Platform-agnostic — works on any target.

## Key Files
- `src/TVApp.tsx` — Root wrapper component (sets up navigation + platform context)
- `src/navigation/index.tsx` — Norigin Spatial Navigation wrapper (NavigationProvider, FocusableItem)
- `src/input/keyCodes.ts` — KeyCode enum + classifyKey() — THE source of truth for remote key mappings
- `src/input/useRemoteControl.ts` — Hook for Back/Color/Media buttons (D-pad handled by Norigin)
- `src/hooks/usePlatform.tsx` — Platform detection via user agent

## Important Notes
- Norigin Spatial Navigation handles D-pad + Enter. useRemoteControl handles everything else.
- The `init()` call to Norigin must happen exactly once — guarded by `initialized` flag
- Platform detection runs once on mount (useMemo) — never re-evaluates
- All key codes use `event.keyCode` (deprecated but universal on TV browsers)

## Testing
```bash
npx turbo run test --filter=@tv-app/core
```

Tests use jsdom environment with @testing-library/react.
