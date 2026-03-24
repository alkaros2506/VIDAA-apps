# @tv-app/platform-tvos

Apple tvOS platform layer for the TV App Toolkit. Bridges the React web app (running in a `WKWebView`) with a native Swift app shell, enabling Siri Remote navigation, native media playback via AVPlayer, and Top Shelf integration.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Apple TV                                            │
│                                                      │
│  ┌────────────┐    WKWebView     ┌────────────────┐  │
│  │            │◄────────────────►│                │  │
│  │  React App │    JS ↔ Swift    │ Swift          │  │
│  │  (Web UI)  │    Bridge        │ TVAppView-     │  │
│  │            │                  │ Controller     │  │
│  └────────────┘                  └────────────────┘  │
│                                                      │
│  JS → Swift:                                         │
│    webkit.messageHandlers.tvApp.postMessage(msg)     │
│                                                      │
│  Swift → JS:                                         │
│    webView.evaluateJavaScript(                       │
│      "window.__tvos_receive(json)"                   │
│    )                                                 │
└──────────────────────────────────────────────────────┘
```

Your React app runs inside a `WKWebView` hosted by a native Swift tvOS application. The **TVOSBridge** class handles bidirectional communication between JavaScript and Swift, giving your web UI access to native tvOS capabilities.

---

## Installation

This package is part of the TV App Toolkit monorepo and depends on `@tv-app/core`:

```json
{
  "dependencies": {
    "@tv-app/platform-tvos": "*",
    "@tv-app/core": "*"
  }
}
```

Run `npm install` from the repo root to resolve workspace dependencies.

---

## TVOSBridge

The `TVOSBridge` class manages all communication between your React app and the native Swift shell.

### Communication Protocol

| Direction | Mechanism |
|-----------|-----------|
| JS to Swift | `webkit.messageHandlers.tvApp.postMessage(msg)` |
| Swift to JS | `webView.evaluateJavaScript("window.__tvos_receive(json)")` |

### Methods

#### `send(type: string, payload?: object): void`

Send an arbitrary message to the Swift shell.

```typescript
import { TVOSBridge } from '@tv-app/platform-tvos';

const bridge = new TVOSBridge();
bridge.send('analytics', { event: 'screen_view', screen: 'home' });
```

#### `playMedia(options: MediaOptions): void`

Hand off media playback to the native AVPlayer. Use this instead of HTML5 `<video>` for DRM-protected content and better performance on tvOS hardware.

```typescript
bridge.playMedia({
  url: 'https://stream.example.com/movie.m3u8',
  title: 'Example Movie',
  startPosition: 0,
  drmConfig: {
    type: 'fairplay',
    certificateUrl: 'https://drm.example.com/cert',
    licenseUrl: 'https://drm.example.com/license',
  },
});
```

The native AVPlayer handles HLS streaming, FairPlay DRM, and picture-in-picture automatically. When playback ends or the user exits the player, the bridge sends a `mediaEnded` event back to JavaScript.

#### `updateTopShelf(items: TopShelfItem[]): void`

Update the tvOS Top Shelf with content tiles. When the user highlights your app on the Apple TV home screen, the Top Shelf displays these items.

```typescript
bridge.updateTopShelf([
  { id: '1', title: 'New Release', imageUrl: 'https://...', deepLink: '/movie/1' },
  { id: '2', title: 'Trending Now', imageUrl: 'https://...', deepLink: '/movie/2' },
]);
```

#### `on(event: string, callback: (data: any) => void): void`

Listen for events sent from the Swift shell to JavaScript.

```typescript
bridge.on('mediaEnded', (data) => {
  console.log('Playback finished at', data.position);
});

bridge.on('deepLink', (data) => {
  router.navigate(data.path);
});
```

---

## useTVOSNavigation

React hook for handling Siri Remote-specific navigation events. This hook complements the D-pad handling provided by Norigin Spatial Navigation in `@tv-app/core`.

```typescript
import { useTVOSNavigation } from '@tv-app/platform-tvos';

function MyScreen() {
  useTVOSNavigation({
    onMenu: () => {
      // Siri Remote Menu button (keyCode 27 / Escape)
      // Acts as "Back" on tvOS
      navigation.goBack();
    },
    onPlayPause: () => {
      // Siri Remote Play/Pause button (keyCode 179)
      player.togglePlayback();
    },
  });

  return <MyContent />;
}
```

---

## Siri Remote Key Mapping

The Siri Remote touchpad generates standard arrow key events for D-pad swipes. These are handled automatically by Norigin Spatial Navigation. The remaining buttons map as follows:

| Button | keyCode | Notes |
|--------|---------|-------|
| Touchpad D-pad | 37/38/39/40 | Standard arrow keys (Left/Up/Right/Down) |
| Click/Tap | 13 | Enter -- select the focused item |
| Menu | 27 | Escape -- acts as Back on tvOS |
| Play/Pause | 179 | MediaPlayPause |

---

## Setting Up the Xcode Project

To run your React app on Apple TV hardware or the simulator:

1. **Create a new tvOS project** in Xcode (File > New > Project > tvOS > App).
2. **Copy the native Swift shell** -- add `native/TVAppShell/TVAppShell.swift` from this package into your Xcode project.
3. **Set the web app URL** -- open `TVAppShell.swift` and set the `webAppURL` property to your deployed React app URL (e.g., `https://my-app.example.com` or `http://192.168.1.100:5173` for local development).
4. **Build and run** on the Apple TV simulator (Xcode > Product > Run) or a physical Apple TV connected via USB-C.

The Swift shell creates a `WKWebView` that loads your web app, injects the `window.__TVOS_BRIDGE__` flag, and sets up the `webkit.messageHandlers.tvApp` message handler for JS-to-Swift communication.

---

## Top Shelf Integration

The tvOS Top Shelf displays content when the user highlights your app on the Apple TV home screen. Use `bridge.updateTopShelf()` to populate it with content tiles.

```typescript
const bridge = new TVOSBridge();

// Update Top Shelf with featured content
bridge.updateTopShelf([
  {
    id: 'featured-1',
    title: 'Featured Movie',
    imageUrl: 'https://cdn.example.com/topshelf/featured.jpg',
    deepLink: '/movie/featured-1',
  },
]);
```

When the user selects a Top Shelf item, the Swift shell sends a `deepLink` event to JavaScript with the associated path. Handle it with `bridge.on('deepLink', ...)` to navigate to the correct screen.

---

## Native Media Playback

Always use `bridge.playMedia()` instead of HTML5 `<video>` for media playback on tvOS. The native AVPlayer provides:

- **FairPlay DRM** -- required for protected content on Apple platforms
- **Hardware-accelerated decoding** -- significantly better performance than software decoding in WKWebView
- **System media controls** -- integrates with the Siri Remote play/pause and scrubbing gestures
- **Picture-in-Picture** -- supported automatically by the native player

HTML5 video in WKWebView has limited codec support and cannot handle FairPlay DRM.

---

## Platform Detection

The Swift wrapper injects `window.__TVOS_BRIDGE__ = true` into the WKWebView before your app loads. Use this flag to detect when your app is running inside the tvOS shell:

```typescript
if (window.__TVOS_BRIDGE__) {
  // Running on tvOS -- use native bridge features
  const bridge = new TVOSBridge();
  bridge.playMedia({ url: streamUrl });
} else {
  // Running in a browser -- use HTML5 video
  videoElement.src = streamUrl;
}
```

The `usePlatform()` hook from `@tv-app/core` checks this flag automatically and returns `'tvos'` when it is present.

---

## Project Structure

```
packages/platform-tvos/
├── src/
│   ├── TVOSBridge.ts          # JS ↔ Swift bridge class
│   ├── useTVOSNavigation.ts   # Siri Remote navigation hook
│   ├── types.ts               # TypeScript interfaces (MediaOptions, TopShelfItem, etc.)
│   ├── index.ts               # Public API exports
│   └── __tests__/             # Unit tests
├── native/
│   └── TVAppShell/
│       └── TVAppShell.swift   # Native Swift app shell template
├── package.json
└── tsconfig.json
```

---

## Testing

```bash
# From the monorepo root
npx turbo run test --filter=@tv-app/platform-tvos

# With coverage
npx turbo run test:coverage --filter=@tv-app/platform-tvos
```

Tests run in a jsdom environment. The `webkit.messageHandlers` global and `window.__TVOS_BRIDGE__` flag are mocked per test. Since there is no tvOS emulator accessible from Node.js, the tests verify bridge message formatting, event callback dispatch, and key event handling logic.

For end-to-end testing on Apple TV hardware, build the Xcode project and run it on the simulator or a physical device.
