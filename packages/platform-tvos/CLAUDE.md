# @tv-app/platform-tvos — Claude Code Guide

## Purpose
Apple tvOS platform layer. Bridges the React web app (in WKWebView) with the native Swift shell.

## Key Files
- `src/TVOSBridge.ts` — JS ↔ Swift message bridge (postMessage for JS→Swift, __tvos_receive for Swift→JS)
- `src/useTVOSNavigation.ts` — Siri Remote key handling (Menu=27, Play/Pause=179)
- `src/types.ts` — TVOSMessage interface + Window type augmentation for webkit.messageHandlers
- `native/TVAppShell/TVAppShell.swift` — Template Swift view controller for the WKWebView wrapper

## Architecture
```
[React App] ←→ [WKWebView] ←→ [Swift TVAppViewController]
     JS→Swift: webkit.messageHandlers.tvApp.postMessage(msg)
     Swift→JS: webView.evaluateJavaScript("window.__tvos_receive(json)")
```

## Important Notes
- `window.__TVOS_BRIDGE__` is set by the Swift wrapper at document start — used for platform detection
- The Menu button on Siri Remote maps to Escape (keyCode 27) — same as Android TV Back
- The Siri Remote touchpad generates standard arrow key events in WKWebView
- Swift template is NOT compiled by the JS build — it's a reference for the Xcode project
- Native AVPlayer should be used for video playback (better DRM + performance than HTML5 video)

## Testing
```bash
npx turbo run test --filter=@tv-app/platform-tvos
```
Tests mock window.webkit and window.__TVOS_BRIDGE__.
