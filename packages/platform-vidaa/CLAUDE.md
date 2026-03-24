# @tv-app/platform-vidaa — Claude Code Guide

## Purpose
VIDAA/Hisense-specific platform layer. Handles TV browser quirks, lifecycle, and home screen installation.

## Key Files
- `src/VidaaApp.ts` — Platform init: injects CSS (cursor:none, safe area), sets up Back handler, disables browser features
- `src/useVidaaLifecycle.ts` — React hook for app show/hide events (Hisense_onAppShow/Hide callbacks)
- `src/install.ts` — Home screen installation via Hisense_installApp API
- `src/types.ts` — VidaaConfig interface + global Window type augmentation

## Critical VIDAA Details
- Back key is keyCode 461 (HbbTV/CE-HTML standard)
- Back on root screen MUST call window.close() — VIDAA app store requirement
- Hisense_installApp may not exist on all firmware versions — always check with isInstallSupported()
- VIDAA browser is Chromium-based but often an older version — avoid bleeding-edge APIs
- The `__setRootScreen` global lets the app signal navigation depth to the back handler

## Testing
```bash
npx turbo run test --filter=@tv-app/platform-vidaa
```
Tests use jsdom. Hisense globals (Hisense_installApp, etc.) are mocked per test.
