# Example TV App

A streaming-style TV UI built with the TV App Toolkit. Demonstrates spatial navigation, remote control input, focus animations, and the component patterns needed to build a full TV application.

The app displays a hero banner at the top of the screen with Play and Info action buttons, followed by horizontal content rows below. As the user navigates with the D-pad, the selected card scales up with a glow effect to provide clear focus feedback. Pressing Enter on a card opens a detail overlay, and the Back key dismisses it.

---

## Features

- **Hero banner** with Play and Info buttons at the top of the screen
- **3 content rows**: Trending Now, New Releases, and Popular -- each scrollable horizontally
- **Card focus animation**: selected cards scale up with a glow border for clear visual feedback
- **Detail overlay**: pressing Enter on a card opens a detail view with title, description, and actions
- **Back key dismissal**: pressing Back (or Backspace in a browser) closes the overlay and returns to the grid
- **Spatial navigation**: fully keyboard/remote navigable with no mouse interaction required

---

## Quick Start

```bash
# From monorepo root
npm install
npm run dev

# Open http://localhost:5173
```

The dev server binds to `0.0.0.0`, so it is accessible from other devices on your local network.

---

## Browser Testing

Use your keyboard to simulate a TV remote:

| Key | Action |
|-----|--------|
| Arrow keys | Navigate between focusable items |
| Enter | Select the focused item |
| Backspace | Back (dismiss overlay, go to previous screen) |

This works in any modern desktop browser. Chrome DevTools device mode can simulate a 1920x1080 TV viewport.

---

## TV Testing

To test on a real TV:

1. Start the dev server: `npm run dev`
2. Find your development machine's local IP address (e.g., `192.168.1.100`)
3. On the TV, open the built-in browser and navigate to `http://192.168.1.100:5173`
4. Use the TV remote to interact with the app

For VIDAA (Hisense) TVs, see the [`@tv-app/platform-vidaa` README](../../packages/platform-vidaa/README.md) for additional deployment methods including home screen installation.

---

## Project Structure

| File | Description |
|------|-------------|
| `src/main.tsx` | Entry point -- initializes the platform and renders the React app |
| `src/App.tsx` | Root component -- sets up `TVApp`, renders hero banner and content rows |
| `src/data.ts` | Mock content data (titles, descriptions, image URLs) |
| `src/styles.css` | Global styles, TV safe area, focus animations, and theming |
| `src/components/HeroBanner.tsx` | Hero banner with background image, title, and action buttons |
| `src/components/ContentRow.tsx` | Horizontal scrolling row of content cards with focus context |
| `src/components/ContentCard.tsx` | Individual content card with focus scale and glow animation |

---

## Customization Guide

### Adding New Screens / Routes

The example app uses a single-screen layout. To add routing:

1. Install a router (e.g., `react-router-dom`).
2. Wrap your app in a `<BrowserRouter>` inside the `<TVApp>` wrapper.
3. Create new screen components under `src/components/` or `src/screens/`.
4. Use `useRemoteControl({ onBack })` from `@tv-app/core` to handle Back navigation between routes.

### Connecting Real APIs

The app uses static mock data from `src/data.ts`. To connect to a real API:

1. Replace the data arrays in `data.ts` with `fetch()` calls to your content API.
2. Add loading states to `ContentRow` and `HeroBanner` while data is being fetched.
3. Consider caching responses locally -- TV apps should minimize network requests since Wi-Fi can be unreliable.

### Theming

Modify `src/styles.css` to change the visual design:

- **Colors**: update CSS custom properties or hardcoded color values
- **Focus style**: adjust the `transform: scale()` and `box-shadow` values on focused cards
- **TV safe area**: the `.tv-safe-area` class applies 5% padding from screen edges to avoid overscan clipping -- adjust this if your target TVs have different overscan behavior
- **Typography**: TV UIs typically use larger font sizes (18px minimum) for readability at viewing distance

### Adding WASM Features

To use the WebAssembly engine for heavy computation:

```typescript
import { loadEngineWithFallback } from '@tv-app/wasm-engine';

const engine = await loadEngineWithFallback(
  new URL('@tv-app/wasm-engine/build/release.wasm', import.meta.url).href
);

// Example: fuzzy search across content titles
const distance = engine.levenshtein(searchQuery, item.title);
```

See the [`@tv-app/wasm-engine` README](../../packages/wasm-engine/README.md) for the full API.

---

## Key Patterns Used

### FocusableItem

Each interactive element (card, button) is wrapped in `FocusableItem` from `@tv-app/core`. The render callback provides a `ref` (for position tracking) and a `focused` boolean (for visual state).

```tsx
<FocusableItem onEnterPress={() => openDetail(item)}>
  {({ ref, focused }) => (
    <div ref={ref} className={focused ? 'card focused' : 'card'}>
      {item.title}
    </div>
  )}
</FocusableItem>
```

### FocusContext.Provider for Rows

Each `ContentRow` creates a focus context using `useFocusable()` and `FocusContext.Provider`. This groups the cards within a row so that Left/Right navigation stays within the row, while Up/Down moves between rows.

```tsx
const { ref, focusKey } = useFocusable();

<FocusContext.Provider value={focusKey}>
  <div ref={ref} className="row">
    {items.map(item => <ContentCard key={item.id} item={item} />)}
  </div>
</FocusContext.Provider>
```

### useRemoteControl for Back

The `useRemoteControl` hook from `@tv-app/core` handles the Back button across all platforms (VIDAA keyCode 461, tvOS keyCode 27, browser Backspace):

```tsx
useRemoteControl({
  onBack: () => {
    if (overlayVisible) {
      setOverlayVisible(false);
    }
  },
});
```

---

## Testing

```bash
# From the monorepo root
npx turbo run test --filter=example-app

# With coverage
npx turbo run test:coverage --filter=example-app
```

Tests run in a jsdom environment with `@testing-library/react`. The test suite covers component rendering, focus behavior, and keyboard event handling.
