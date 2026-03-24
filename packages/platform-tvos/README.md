# @tv-app/platform-tvos

Apple tvOS platform layer for the TV App Toolkit. This package provides the bridge between your React web app and a native Swift application that hosts it inside a `WKWebView` on Apple TV.

---

## Architecture

```
┌─────────────────────────────────┐
│  Native Swift App (tvOS)        │
│  TVAppViewController            │
│  ┌───────────────────────────┐  │
│  │  WKWebView                │  │
│  │  ┌─────────────────────┐  │  │
│  │  │  React App           │  │  │
│  │  │  (@tv-app/core)      │  │  │
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
│  AVPlayer (native media)        │
│  Top Shelf extension            │
└─────────────────────────────────┘
```

The React app runs as a standard web application inside `WKWebView`. The native Swift shell handles things the web cannot: Siri Remote gesture processing, native media playback via AVPlayer, Top Shelf content integration, and tvOS focus engine interaction.

Communication between JavaScript and Swift happens through a bidirectional message bridge:

- **JS to Swift:** `webkit.messageHandlers.tvApp.postMessage(message)`
- **Swift to JS:** `webView.evaluateJavaScript("window.__tvos_receive(json)")`

---

## Installation

This package is part of the TV App Toolkit monorepo:

```json
{
  "dependencies": {
    "@tv-app/platform-tvos": "*",
    "@tv-app/core": "*"
  }
}
```

---

## API Reference

### `TVOSBridge`

Class that manages communication between the web app and the native Swift shell.

```tsx
import { TVOSBridge } from '@tv-app/platform-tvos';

// Check if running inside the tvOS native wrapper
if (TVOSBridge.isAvailable()) {
  const bridge = new TVOSBridge();

  // Send a message to Swift
  bridge.send({ type: 'navigate', payload: { screen: 'details', id: '123' } });

  // Play media via native AVPlayer
  bridge.playMedia('https://example.com/video.m3u8', 'Episode Title');

  // Update Top Shelf content
  bridge.updateTopShelf([
    { title: 'Show 1', imageUrl: 'https://...', id: 'show-1' },
    { title: 'Show 2', imageUrl: 'https://...', id: 'show-2' },
  ]);

  // Listen for messages from Swift
  const unsubscribe = bridge.on('lifecycle', (payload) => {
    console.log('Lifecycle event:', payload);
  });

  // Clean up
  unsubscribe();
}
```

**Static methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `TVOSBridge.isAvailable()` | `boolean` | `true` if `window.__TVOS_BRIDGE__` is defined (set by the Swift wrapper) |

**Instance methods:**

| Method | Parameters | Description |
|--------|------------|-------------|
| `send(message)` | `TVOSMessage` | Send a message to the native Swift shell |
| `playMedia(url, title?)` | `string, string?` | Tell Swift to play media via AVPlayer |
| `updateTopShelf(items)` | `Array<{title, imageUrl, id}>` | Update the tvOS Top Shelf with content items |
| `on(type, callback)` | `string, function` | Listen for messages from Swift; returns an unsubscribe function |

**Message types (`TVOSMessage`):**

| Type | Direction | Description |
|------|-----------|-------------|
| `'navigate'` | JS to Swift | Request native navigation |
| `'playMedia'` | JS to Swift | Play a media URL via AVPlayer |
| `'topShelf'` | JS to Swift | Update Top Shelf content |
| `'focusEngine'` | Either | Focus engine coordination |
| `'lifecycle'` | Swift to JS | App lifecycle events (foreground, background) |

### `useTVOSNavigation(options): void`

React hook for handling Siri Remote buttons that are not covered by the standard D-pad navigation.

```tsx
import { useTVOSNavigation } from '@tv-app/platform-tvos';

function MyScreen() {
  useTVOSNavigation({
    onMenu: () => {
      // Menu button pressed (Escape / keyCode 27)
      navigation.goBack();
    },
    onPlayPause: () => {
      // Play/Pause button pressed (keyCode 179)
      togglePlayback();
    },
  });

  return <MyContent />;
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `onMenu` | `() => void` | Called when the Menu button is pressed (keyCode 27 / Escape) |
| `onPlayPause` | `() => void` | Called when the Play/Pause button is pressed (keyCode 179) |

---

## JS-Swift Bridge Communication

### JS to Swift

The Swift app registers a `WKScriptMessageHandler` named `tvApp`. JavaScript sends messages through this handler:

```ts
// This is what TVOSBridge.send() does internally:
window.webkit.messageHandlers.tvApp.postMessage({
  type: 'playMedia',
  payload: { url: 'https://example.com/video.m3u8', title: 'Episode 1' }
});
```

On the Swift side, the message arrives in `userContentController(_:didReceive:)` as a dictionary with `type` and `payload` keys.

### Swift to JS

The Swift app sends messages to JavaScript by evaluating a global function:

```swift
// In TVAppViewController:
let message: [String: Any] = ["type": "lifecycle", "payload": ["state": "foreground"]]
if let jsonData = try? JSONSerialization.data(withJSONObject: message),
   let jsonString = String(data: jsonData, encoding: .utf8) {
    webView.evaluateJavaScript("window.__tvos_receive(\(jsonString))")
}
```

The `TVOSBridge` constructor registers `window.__tvos_receive` to dispatch incoming messages to listeners registered via `bridge.on()`.

### Platform Detection

The Swift wrapper injects `window.__TVOS_BRIDGE__ = true` at document start via a `WKUserScript`. The `@tv-app/core` platform detection reads this flag to identify the tvOS platform, and `TVOSBridge.isAvailable()` checks for it directly.

---

## Siri Remote Key Mapping

The Siri Remote touchpad generates standard arrow key events in WKWebView, which Norigin spatial navigation handles automatically. The following additional buttons have specific key codes:

| Siri Remote Button | keyCode | JavaScript Key | Handled By |
|--------------------|---------|----------------|------------|
| Touchpad swipe up | 38 | `ArrowUp` | Norigin (automatic) |
| Touchpad swipe down | 40 | `ArrowDown` | Norigin (automatic) |
| Touchpad swipe left | 37 | `ArrowLeft` | Norigin (automatic) |
| Touchpad swipe right | 39 | `ArrowRight` | Norigin (automatic) |
| Touchpad click (Select) | 13 | `Enter` | Norigin (automatic) |
| Menu | 27 | `Escape` | `useTVOSNavigation` |
| Play/Pause | 179 | `MediaPlayPause` | `useTVOSNavigation` |

The Menu button on the Siri Remote maps to Escape (keyCode 27), which is the same as Android TV's Back button. This means `useRemoteControl({ onBack })` from `@tv-app/core` also catches it via `KeyCode.BACK_ANDROID`.

---

## Setting Up the Xcode Project

The package includes a Swift template at `native/TVAppShell/TVAppShell.swift`. To set up a tvOS project:

1. **Create a new tvOS project** in Xcode (File > New > Project > tvOS > App).
2. **Add `TVAppShell.swift`** to the project. Copy it from `packages/platform-tvos/native/TVAppShell/TVAppShell.swift`.
3. **Set the web app URL.** In `TVAppShell.swift`, change the `webAppURL` property:
   ```swift
   private let webAppURL = URL(string: "https://your-app.example.com")!
   ```
   During development, use `http://localhost:5173` or your machine's local IP.
4. **Configure the view controller.** Set `TVAppViewController` as your root view controller in the storyboard or in `AppDelegate`.
5. **Build and run** on the Apple TV Simulator (Xcode > Destination > Apple TV) or a physical Apple TV connected via USB.

The Swift template handles:
- Creating and configuring the `WKWebView` with inline media playback enabled.
- Registering the `tvApp` message handler for JS-to-Swift communication.
- Injecting the `__TVOS_BRIDGE__` flag at document start.
- Routing incoming messages by `type` (playMedia, topShelf, etc.).
- Providing `sendToJS()` for Swift-to-JS communication.

---

## Top Shelf Integration

tvOS apps can display content on the Top Shelf (the banner area shown when the app is focused on the home screen). Use the bridge to push content to the native layer:

```ts
const bridge = new TVOSBridge();

bridge.updateTopShelf([
  { title: 'Continue Watching: Episode 5', imageUrl: 'https://...', id: 'ep-5' },
  { title: 'New: Season 2 Premiere', imageUrl: 'https://...', id: 'season-2' },
]);
```

The Swift side receives this as a `topShelf` message. You will need to implement a Top Shelf extension in your Xcode project that reads this data (e.g., from `UserDefaults` shared via an App Group) and renders the appropriate `TVTopShelfContentProvider`.

---

## Native Media Playback via AVPlayer

For video playback on tvOS, native `AVPlayer` is strongly recommended over HTML5 `<video>`:

- Better DRM support (FairPlay Streaming).
- Hardware-accelerated decoding.
- Native picture-in-picture and Siri Remote scrubbing.
- Reliable HLS playback with adaptive bitrate.

Use the bridge to hand off playback to the native layer:

```ts
const bridge = new TVOSBridge();

bridge.playMedia(
  'https://example.com/stream.m3u8',
  'Episode 1: The Beginning'
);
```

The Swift template logs the URL; in a production app you would create an `AVPlayerViewController` and present it.

---

## Testing

### Unit Tests

```bash
# From the monorepo root
npx turbo run test --filter=@tv-app/platform-tvos

# With coverage
npx turbo run test:coverage --filter=@tv-app/platform-tvos
```

Tests run in jsdom and mock `window.webkit` and `window.__TVOS_BRIDGE__`.

### Testing with Apple TV Simulator

1. Open the Xcode project with the `TVAppShell.swift` template.
2. Select an Apple TV simulator as the run destination.
3. Build and run. The simulator opens with your web app loaded in the WKWebView.
4. Use the **Siri Remote simulator** (Xcode menu: Window > Simulator > Show Apple TV Remote, or Shift+Cmd+R in the Simulator app).
5. The touchpad on the simulated remote generates arrow key events; click generates Enter.

For rapid web development, point `webAppURL` at your Vite dev server (`http://localhost:5173`). Changes to the React app hot-reload inside the simulator's WKWebView.

### Testing Without Xcode

If you do not have a Mac or Xcode, you can still develop and test the web portion:

- Run the app in a desktop browser -- spatial navigation and `useRemoteControl` work with keyboard input.
- `TVOSBridge.isAvailable()` returns `false` in a browser, and `bridge.send()` logs a warning instead of crashing.
- Use `useTVOSNavigation` freely -- it listens for standard keyboard events (Escape, MediaPlayPause) that work in any browser.
