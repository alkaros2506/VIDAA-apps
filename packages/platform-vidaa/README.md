# @tv-app/platform-vidaa

VIDAA/Hisense platform layer for the TV App Toolkit. Handles platform-specific initialization, lifecycle events, and home screen installation for Hisense smart TVs.

VIDAA TVs run a **Chromium-based browser** (often an older version). Your React app runs directly in this browser with no native wrapper required, making web deployment straightforward compared to native TV platforms.

---

## Installation

This package is part of the TV App Toolkit monorepo and depends on `@tv-app/core`:

```json
{
  "dependencies": {
    "@tv-app/platform-vidaa": "*",
    "@tv-app/core": "*"
  }
}
```

---

## Quick Start

```tsx
import { TVApp } from '@tv-app/core';
import { VidaaApp } from '@tv-app/platform-vidaa';

// Initialize VIDAA platform features (call once at app startup)
VidaaApp({
  appName: 'My TV App',
  onRootBack: 'exit',
});

createRoot(document.getElementById('root')!).render(
  <TVApp>
    <App />
  </TVApp>
);
```

`VidaaApp()` is safe to call on non-VIDAA platforms -- it injects styles and event listeners into the DOM regardless, which are harmless in a desktop browser.

---

## API Reference

### `VidaaApp(config: VidaaConfig): void`

One-time platform initialization. Call this before rendering your React app.

**What it does:**

1. **Injects VIDAA-specific CSS** -- hides cursor, disables text selection, sets safe area padding, removes focus outlines.
2. **Sets up Back key handler** -- listens for keyCode 461 (HbbTV Back) on the root screen.
3. **Disables unwanted browser features** -- prevents context menu, text selection via keyboard, and mouse wheel scrolling.

**Config options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `appName` | `string` | required | App name displayed on the VIDAA home screen tile |
| `iconUrl` | `string` | -- | App icon URL (400x400 PNG recommended) |
| `onRootBack` | `'exit' \| 'confirm' \| () => void` | `'exit'` | Behavior when Back is pressed on the root screen |

The `onRootBack` option controls what happens when the user presses the Back button and there is no further navigation history:

- `'exit'` -- calls `window.close()` to exit the app (VIDAA app store requirement for published apps)
- `'confirm'` -- does nothing, allowing your app to show a confirmation dialog via `useRemoteControl`
- A custom function -- called directly, letting you implement any exit flow

### `useVidaaLifecycle(callbacks): void`

React hook for VIDAA app lifecycle events. The VIDAA OS suspends and resumes web apps when the user presses the Home button or switches inputs.

```tsx
import { useVidaaLifecycle } from '@tv-app/platform-vidaa';

function App() {
  useVidaaLifecycle({
    onShow: () => {
      // App resumed -- restart animations, reconnect WebSocket, etc.
      console.log('App visible');
    },
    onHide: () => {
      // App suspended -- pause media, save state, etc.
      console.log('App hidden');
    },
  });

  return <MyScreen />;
}
```

**How it works:**

- On VIDAA hardware, the OS calls `window.Hisense_onAppShow()` and `window.Hisense_onAppHide()` when the app is resumed or suspended.
- As a fallback (for testing in desktop browsers), the hook also listens for the standard `visibilitychange` event.
- Callbacks are cleaned up on unmount.

### `installToHomeScreen(name, url, iconUrl): boolean`

Install the web app as a tile on the VIDAA home screen.

```tsx
import { installToHomeScreen, isInstallSupported } from '@tv-app/platform-vidaa';

if (isInstallSupported()) {
  const success = installToHomeScreen(
    'My TV App',
    'https://my-app.example.com',
    'https://my-app.example.com/icon-400x400.png'
  );
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | `string` | App name for the home screen tile |
| `url` | `string` | URL of the web app |
| `iconUrl` | `string` | URL of the app icon (400x400 PNG recommended) |

Returns `true` if installation succeeded, `false` otherwise.

### `isInstallSupported(): boolean`

Check whether the `Hisense_installApp` API is available. This API is only present on certain VIDAA firmware versions (generally 2023+). On older firmware, use the `hisense://debug` method instead.

---

## VIDAA-Specific CSS

`VidaaApp()` injects the following global styles:

```css
* { cursor: none !important; }

body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

:focus { outline: none; }

/* TV safe area -- 5% margin from edges */
.tv-safe-area {
  padding: 5vh 5vw;
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
}
```

The `.tv-safe-area` class ensures content stays within the visible area on TVs that overscan. Apply it to your app's outermost container.

---

## Back Button Behavior

The VIDAA Back button sends `keyCode 461` (HbbTV/CE-HTML standard, shared with LG webOS).

`VidaaApp()` sets up a keydown listener specifically for the root screen scenario. It exposes `window.__setRootScreen(boolean)` so your app can signal its navigation depth:

```tsx
// In your navigation logic:
window.__setRootScreen(navigationStack.length === 0);
```

When `isRootScreen` is `true` and Back is pressed, the configured `onRootBack` behavior fires. When `isRootScreen` is `false`, the Back key is left for `useRemoteControl` from `@tv-app/core` to handle.

---

## Deploying to a Real Hisense TV

### Method 1: Direct URL (Development)

The simplest approach for development and testing:

1. Start your dev server: `npm run dev` (serves on `http://0.0.0.0:5173`).
2. Find your development machine's local IP address.
3. On the VIDAA TV, open the built-in web browser.
4. Navigate to `http://<your-ip>:5173`.
5. Use the TV remote to interact with your app.

This works well for rapid iteration but requires the development machine to be running.

### Method 2: hisense://debug Install

This creates a persistent home screen tile:

1. On the VIDAA TV browser, navigate to `hisense://debug`.
2. A debug panel appears with fields for app name, URL, and icon URL.
3. Enter your app details and confirm.
4. The app now appears as a tile on the VIDAA home screen.
5. Launching the tile opens your URL in a chromeless fullscreen browser.

This method works on most VIDAA firmware versions and does not require the `Hisense_installApp` API.

### Method 3: DNS Spoofing (Production-like)

For testing production-like conditions without deploying to a real server:

1. Set up a local DNS server (e.g., dnsmasq) or configure your router's DNS.
2. Create a DNS entry pointing your production domain to your development machine's IP.
3. Serve your built app with HTTPS (required for some VIDAA APIs) on your development machine.
4. The TV resolves the domain to your local server and loads the app as if it were in production.

This is useful for testing features that depend on the production domain, such as cookies, CORS, or service workers.

---

## Known VIDAA Browser Limitations

| Limitation | Details | Workaround |
|------------|---------|------------|
| Older Chromium version | VIDAA browser often runs Chromium 69-79 | Avoid modern CSS (`:has()`, `container queries`) and JS APIs (`structuredClone`, `Array.at()`) |
| No DevTools | No built-in remote debugging | Use `hisense://debug` for console access, or proxy through a machine with Charles/mitmproxy |
| Limited memory | 512MB-1GB available to the browser | Minimize DOM nodes, lazy-load images, avoid large in-memory datasets |
| No pointer events | No mouse cursor on TV | All interaction must go through keyboard/remote events |
| `event.keyCode` only | `event.code` and `event.key` may be unreliable | Always use `event.keyCode` for remote button detection |
| Fullscreen quirks | `requestFullscreen()` may not work | The browser is already fullscreen; avoid calling fullscreen APIs |
| WebSocket limits | Some firmware versions have WebSocket connection limits | Implement reconnection logic with exponential backoff |

---

## Testing

### Unit Tests

```bash
# From the monorepo root
npx turbo run test --filter=@tv-app/platform-vidaa

# With coverage
npx turbo run test:coverage --filter=@tv-app/platform-vidaa
```

Tests run in jsdom and mock the Hisense globals (`Hisense_installApp`, `Hisense_onAppShow`, `Hisense_onAppHide`).

### Testing on Hardware vs. Emulator

There is no official VIDAA emulator. Testing must be done on real Hisense TV hardware:

- Use the **Direct URL method** for development iteration.
- Test on multiple VIDAA firmware versions if possible (2021, 2022, 2023+) since browser capabilities vary.
- Test with the actual TV remote, not just a keyboard -- some key codes behave differently.
- Monitor memory usage during extended sessions; TV browsers are more likely to crash under memory pressure than desktop browsers.
