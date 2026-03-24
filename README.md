# TV App Toolkit

**Cookiecutter monorepo for building TV apps**

Build cross-platform TV applications using React and web technologies. Write your UI once, deploy to VIDAA (Hisense), Apple tvOS, and more.

| Platform | Status |
|----------|--------|
| VIDAA (Hisense) | Supported |
| Apple tvOS | Supported |
| Android TV | Planned |
| LG webOS | Planned |
| Samsung Tizen | Planned |

---

## Architecture

```
tv-app-toolkit/
├── packages/
│   ├── core/                 # Shared React components, spatial navigation, input handling
│   ├── platform-vidaa/       # VIDAA/Hisense browser-based TV platform
│   ├── platform-tvos/        # Apple tvOS (WKWebView + native Swift shell)
│   └── wasm-engine/          # WebAssembly engine for heavy computation
├── apps/
│   └── example-app/          # Demo streaming-style TV app
├── .github/workflows/        # CI pipeline
├── package.json              # Workspace root (npm workspaces + Turborepo)
├── turbo.json                # Turborepo task configuration
└── tsconfig.base.json        # Shared TypeScript config
```

The monorepo uses **npm workspaces** for dependency management and **Turborepo** for orchestrating builds, tests, and linting across packages. Each package publishes under the `@tv-app/` scope.

| Package | npm name | Purpose |
|---------|----------|---------|
| `packages/core` | `@tv-app/core` | React components and hooks: spatial navigation, remote control input, platform detection |
| `packages/platform-vidaa` | `@tv-app/platform-vidaa` | VIDAA/Hisense initialization, lifecycle hooks, home screen installation |
| `packages/platform-tvos` | `@tv-app/platform-tvos` | tvOS WKWebView bridge, Siri Remote navigation, native media playback |
| `packages/wasm-engine` | `@tv-app/wasm-engine` | AssemblyScript WASM module for offloading computation from the DOM thread |
| `apps/example-app` | `example-app` | Full demo app showing a streaming-style TV UI |

---

## Quick Start

### Prerequisites

- **Node.js 20+**
- **npm 10+** (ships with Node 20)

### Setup

```bash
git clone <repo-url> tv-app-toolkit
cd tv-app-toolkit
npm install
npm run dev
```

Open your browser at **http://localhost:5173**. Use **arrow keys** to move focus and **Enter** to select. Press **Backspace** to go back.

The dev server binds to `0.0.0.0`, so you can also open the URL from a TV browser on the same network.

---

## Spatial Navigation

TV apps do not have a mouse cursor. Users navigate with a D-pad (up/down/left/right) and a select button. This toolkit uses the [Norigin Spatial Navigation](https://github.com/NoriginMedia/Norigin-Spatial-Navigation) library to manage focus movement across focusable elements.

**How it works:**

1. `<TVApp>` initializes the Norigin spatial navigation engine at the root of the component tree.
2. `<FocusableItem>` registers elements that can receive focus. The library tracks their screen positions.
3. When a D-pad direction is pressed (arrow key), Norigin calculates which focusable element is nearest in that direction and moves focus to it.
4. The `focused` boolean in the render callback drives visual focus states (scaling, borders, glow).
5. `onEnterPress` fires when the user presses Enter/Select on a focused element.

```tsx
import { TVApp, FocusableItem } from '@tv-app/core';

function MyApp() {
  return (
    <TVApp>
      <FocusableItem onEnterPress={() => console.log('selected!')}>
        {({ ref, focused }) => (
          <div ref={ref} style={{ border: focused ? '2px solid white' : 'none' }}>
            Card
          </div>
        )}
      </FocusableItem>
    </TVApp>
  );
}
```

For grouped navigation (e.g., horizontal content rows), use `useFocusable()` with Norigin's `FocusContext.Provider` to create focus containers. See `apps/example-app/src/components/ContentRow.tsx` for a working example.

---

## Remote Control Key Mapping

TV remotes send keyboard events with platform-specific key codes. The `@tv-app/core` package normalizes these into a unified `KeyCode` enum.

### D-pad and Select

| Button | keyCode | Standard |
|--------|---------|----------|
| Up | 38 | All platforms |
| Down | 40 | All platforms |
| Left | 37 | All platforms |
| Right | 39 | All platforms |
| Enter / Select | 13 | All platforms |

### Back Button

| Platform | keyCode | Notes |
|----------|---------|-------|
| VIDAA (Hisense) | 461 | HbbTV standard |
| LG webOS | 461 | HbbTV standard |
| Samsung Tizen | 10009 | Samsung-specific |
| Android TV | 27 | Maps to Escape |
| Browser fallback | 8 | Backspace |

### Color Buttons (HbbTV Standard)

| Button | keyCode |
|--------|---------|
| Red | 403 |
| Green | 404 |
| Yellow | 405 |
| Blue | 406 |

### Media Controls

| Button | keyCode |
|--------|---------|
| Play | 415 |
| Pause | 19 |
| Stop | 413 |
| Fast Forward | 417 |
| Rewind | 412 |

### Number Keys

Number keys 0-9 map to key codes 48-57 (standard ASCII).

### Apple tvOS (Siri Remote)

The Siri Remote touchpad generates arrow key events for D-pad swipes. Additional mappings:

| Button | keyCode | Maps to |
|--------|---------|---------|
| Menu | 27 | Escape |
| Select (press) | 13 | Enter |
| Play/Pause | 179 | MediaPlayPause |

Use `useRemoteControl()` from `@tv-app/core` to handle Back, color buttons, and media controls. Spatial navigation (D-pad + Enter) is handled automatically by Norigin.

---

## WebAssembly Architecture

TV hardware is constrained -- low-power CPUs, limited RAM. The WASM engine offloads heavy computation to a WebAssembly module compiled from AssemblyScript, keeping the DOM thread free for rendering and input handling.

```
┌─────────────────────────────────────────────┐
│  DOM Thread (JavaScript)                     │
│  - React rendering                           │
│  - Spatial navigation                        │
│  - User input handling                       │
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │  WASM Engine (AssemblyScript)            │ │
│  │  - boxBlur: image processing             │ │
│  │  - fastSearch: string search             │ │
│  │  - quickSort: array sorting              │ │
│  │  - easeOutCubic: animation curves        │ │
│  │  - levenshtein: fuzzy text matching      │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Available WASM Functions

| Function | Purpose | Use case |
|----------|---------|----------|
| `boxBlur(data, width, height, radius)` | Two-pass box blur on RGBA pixel data | Background blur effects |
| `fastSearch(haystack, needle)` | String search, returns index or -1 | Content catalog filtering |
| `quickSort(arr, low, high)` | In-place quicksort on Float64Array | Sorting ratings, dates |
| `easeOutCubic(steps)` | Pre-compute easing curve values | Smooth focus animations |
| `levenshtein(a, b)` | Levenshtein edit distance | Fuzzy search / typo tolerance |

All functions have pure-JavaScript fallbacks via `jsFallback` for graceful degradation on platforms where WASM is unavailable.

### Loading the WASM Engine

```ts
import { loadWasmEngine } from '@tv-app/wasm-engine';

const engine = await loadWasmEngine(
  new URL('../node_modules/@tv-app/wasm-engine/build/release.wasm', import.meta.url).href
);

const distance = engine.levenshtein('breaking', 'breakin');
```

Or use `loadEngineWithFallback()` to automatically fall back to JavaScript implementations if WASM fails to load.

---

## Platform: VIDAA (Hisense)

VIDAA TVs run a Chromium-based browser. Your React app runs directly in this browser -- no native wrapper needed.

### Deploying to a Hisense TV

There are three methods:

**Method 1: Direct URL** (easiest for development)

1. Build your app and serve it from a machine on the same network.
2. Open the VIDAA TV browser and navigate to `http://<your-ip>:5173`.
3. Use the TV remote to interact.

**Method 2: hisense://debug install**

1. On the TV browser, navigate to `hisense://debug`.
2. Enter your app name, URL, and icon URL in the install form.
3. The app appears as a tile on the VIDAA home screen.

**Method 3: DNS spoofing** (for production-like testing)

1. Set up a local DNS server or modify your router's DNS settings.
2. Point a domain to your development machine's IP.
3. The TV resolves the domain to your local server.

See the [`@tv-app/platform-vidaa` README](packages/platform-vidaa/README.md) for details on VIDAA-specific APIs and limitations.

---

## Platform: tvOS (Apple TV)

The tvOS platform runs your React app inside a `WKWebView` hosted by a native Swift app. The Swift shell handles Siri Remote input, native media playback via AVPlayer, and Top Shelf integration.

### Setup

1. Open the Xcode project template in `packages/platform-tvos/native/TVAppShell/`.
2. Create a new tvOS app target in Xcode.
3. Add `TVAppShell.swift` to the project.
4. Set the `webAppURL` to your deployed React app URL.
5. Build and run on the Apple TV Simulator or a physical Apple TV.

The JS-Swift bridge communicates in both directions:

- **JS to Swift:** `webkit.messageHandlers.tvApp.postMessage(message)`
- **Swift to JS:** `webView.evaluateJavaScript("window.__tvos_receive(json)")`

See the [`@tv-app/platform-tvos` README](packages/platform-tvos/README.md) for the full bridge API.

---

## Testing

All packages use [Vitest](https://vitest.dev/) for testing with jsdom for DOM simulation.

```bash
# Run all tests across the monorepo
npm test

# Run tests with coverage reports
npm run test:coverage

# Run tests for a specific package
npx turbo run test --filter=@tv-app/core
npx turbo run test --filter=@tv-app/platform-vidaa
npx turbo run test --filter=example-app
```

Coverage reports are written to each package's `coverage/` directory.

---

## CI

GitHub Actions runs on every push to `main` and on pull requests. The pipeline defined in `.github/workflows/ci.yml` has three stages:

1. **Lint & Typecheck** -- runs ESLint and TypeScript `--noEmit` across all packages.
2. **Test** -- runs tests with coverage for each package in a matrix build (`packages/core`, `packages/wasm-engine`, `packages/platform-vidaa`, `packages/platform-tvos`, `apps/example-app`). Coverage artifacts are uploaded.
3. **Build** -- builds all packages and uploads the example app bundle.

A separate **Deploy Preview** workflow (`.github/workflows/deploy-preview.yml`) builds the example app on pull requests and uploads it as an artifact for preview.

---

## Creating a New App from This Template

1. Fork or clone this repository.
2. Create a new directory under `apps/`:
   ```bash
   mkdir apps/my-app
   ```
3. Add a `package.json` with dependencies on the packages you need:
   ```json
   {
     "name": "my-app",
     "private": true,
     "dependencies": {
       "@tv-app/core": "*",
       "@tv-app/platform-vidaa": "*",
       "@tv-app/wasm-engine": "*",
       "react": "^18.3.0",
       "react-dom": "^18.3.0"
     }
   }
   ```
4. Copy the Vite config from `apps/example-app/vite.config.ts` as a starting point.
5. Create your entry point wrapping your app in `<TVApp>`:
   ```tsx
   import { TVApp } from '@tv-app/core';
   import { VidaaApp } from '@tv-app/platform-vidaa';

   VidaaApp({ appName: 'My App', onRootBack: 'exit' });

   createRoot(document.getElementById('root')!).render(
     <TVApp>
       <MyApp />
     </TVApp>
   );
   ```
6. Run `npm install` from the repo root to link workspaces, then `npx turbo run dev --filter=my-app`.

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the example app dev server (localhost:5173) |
| `npm run build` | Build all packages and apps |
| `npm test` | Run all tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Lint all packages |
| `npm run typecheck` | TypeScript type checking |
| `npm run clean` | Remove dist and coverage directories |

---

## Roadmap

- **Android TV** -- React app in a WebView hosted by a Kotlin/Java shell. Android TV Leanback integration.
- **LG webOS** -- Web app running in the webOS browser. Key code 461 already supported for Back. Needs webOS-specific lifecycle hooks and app packaging (`webos-packager`).
- **Samsung Tizen** -- Web app running in the Tizen browser. Back key (10009) already mapped. Needs Tizen Studio packaging and `config.xml` manifest.

---

## License

MIT
