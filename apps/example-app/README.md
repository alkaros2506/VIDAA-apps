# Example TV App

A demo streaming-style TV application built with the TV App Toolkit. Shows how to use `@tv-app/core` for spatial navigation, `@tv-app/platform-vidaa` for Hisense TV deployment, and standard React patterns adapted for TV UIs.

---

## What It Demonstrates

- **Hero banner** with a featured content area and focusable Play/More Info buttons
- **Content rows** with horizontally scrollable cards (Trending, New Releases, Popular)
- **Spatial navigation** across all interactive elements using D-pad/arrow keys
- **Focus states** with scaling, borders, and glow effects for clear visual feedback
- **Back button handling** to dismiss the detail overlay
- **VIDAA platform initialization** with safe area CSS and back key behavior

---

## Features

| Feature | Implementation |
|---------|---------------|
| Spatial navigation | `FocusableItem` and `useFocusable` from `@tv-app/core` |
| Remote control input | `useRemoteControl` from `@tv-app/core` |
| Platform initialization | `VidaaApp()` from `@tv-app/platform-vidaa` |
| Focus containers | `FocusContext.Provider` from Norigin for scoped row navigation |
| Detail overlay | Triggered on card select, dismissed on Back |
| TV-safe layout | `.tv-safe-area` class with 5% padding from screen edges |

---

## Running

### From the monorepo root (recommended)

```bash
npm install
npm run dev
```

This uses Turborepo to start the Vite dev server for the example app.

### Standalone

```bash
cd apps/example-app
npx vite
```

Open **http://localhost:5173** in your browser.

---

## Keyboard Controls for Browser Testing

| Key | Action |
|-----|--------|
| Arrow Up | Move focus up |
| Arrow Down | Move focus down |
| Arrow Left | Move focus left |
| Arrow Right | Move focus right |
| Enter | Select focused item |
| Backspace | Go back / dismiss overlay |

These keys map directly to TV remote D-pad buttons. On actual TV hardware, the remote's physical buttons send the same key codes.

---

## Project Structure

```
apps/example-app/
├── src/
│   ├── main.tsx                # Entry point: VidaaApp init + TVApp wrapper
│   ├── App.tsx                 # Main layout: hero + rows + detail overlay
│   ├── components/
│   │   ├── HeroBanner.tsx      # Featured content with Play/Info buttons
│   │   ├── ContentRow.tsx      # Horizontal row with FocusContext scoping
│   │   └── ContentCard.tsx     # Individual card with focus styling
│   ├── data.ts                 # Mock data (replace with real API calls)
│   ├── styles.css              # TV-optimized styles (1920x1080, safe area)
│   └── __tests__/
│       ├── setup.ts            # Test setup
│       ├── App.test.tsx        # App component tests
│       └── ContentCard.test.tsx # Card component tests
├── index.html                  # Entry HTML (1920px viewport)
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

---

## How to Customize

### Adding a New Screen

1. Create a new component in `src/components/`:
   ```tsx
   import { FocusableItem, useRemoteControl } from '@tv-app/core';

   export function SettingsScreen({ onBack }: { onBack: () => void }) {
     useRemoteControl({ onBack });

     return (
       <div className="tv-safe-area">
         <h1>Settings</h1>
         <FocusableItem onEnterPress={() => console.log('toggle')}>
           {({ ref, focused }) => (
             <div ref={ref} className={focused ? 'focused' : ''}>
               Subtitles: On
             </div>
           )}
         </FocusableItem>
       </div>
     );
   }
   ```

2. Add navigation logic in `App.tsx` to switch between screens based on state.

3. Update `window.__setRootScreen()` to signal when you are on the root screen (for VIDAA Back button behavior).

### Changing Styles

Edit `src/styles.css`. Key considerations for TV:

- Design for **1920x1080** (Full HD). All TVs support this resolution.
- Use **large text** (minimum 24px body, 32px+ for titles). Viewers sit 6-10 feet from the screen.
- Make **focus states obvious** -- scale transforms, bright borders, and glow/shadow effects.
- Keep the **safe area** padding (5% from edges) to avoid content being cut off by overscan.
- Avoid small touch targets. Focused items should be at least 100x100px.

### Connecting Real APIs

Replace the mock data in `src/data.ts` with actual API calls:

```tsx
// src/data.ts
export async function fetchContent() {
  const response = await fetch('https://api.example.com/content');
  return response.json();
}
```

Then load the data in `App.tsx` using `useEffect` and `useState`, or your preferred data fetching library.

Keep in mind:
- TV browsers may have stricter CORS policies.
- Network requests on TV hardware can be slower than on desktop.
- Always show loading states -- users notice blank screens on a 55-inch display.

---

## Testing on a TV

### Local Network Testing

1. Start the dev server so it is accessible on the network:
   ```bash
   npm run dev
   ```
   Vite serves on `0.0.0.0:5173` by default.

2. Find your development machine's local IP address (e.g., `192.168.1.100`).

3. On the TV browser, navigate to `http://192.168.1.100:5173`.

4. Use the TV remote to interact. Arrow keys navigate, Enter selects, Back (keyCode 461 on VIDAA) goes back.

### Production Build Testing

For a more realistic test:

```bash
cd apps/example-app
npx vite build
npx vite preview
```

This builds the optimized production bundle and serves it locally. Test this on the TV to verify that production builds work correctly (tree-shaking, minification, and asset loading).

---

## Testing

```bash
# From the monorepo root
npx turbo run test --filter=example-app

# With coverage
npx turbo run test:coverage --filter=example-app
```

Tests use jsdom with `@testing-library/react`. The `@tv-app/core` library is used directly (not mocked) so that spatial navigation integration is tested end-to-end. Tests cover:

- App renders the hero banner and content rows
- Content cards display titles and respond to focus
- Detail overlay appears and dismisses correctly
