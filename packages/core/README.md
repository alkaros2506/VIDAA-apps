# @tv-app/core

Shared React components and hooks for TV app development. Platform-agnostic -- works on VIDAA, tvOS, and in any desktop browser during development.

This package provides spatial navigation, remote control input handling, and platform detection. It wraps the [Norigin Spatial Navigation](https://github.com/NoriginMedia/Norigin-Spatial-Navigation) library and exposes a simplified API for TV-specific use cases.

---

## Installation

This package is part of the TV App Toolkit monorepo. If you are working within the monorepo, it is already linked via npm workspaces:

```json
{
  "dependencies": {
    "@tv-app/core": "*"
  }
}
```

Run `npm install` from the repo root to resolve workspace dependencies.

---

## Key Exports

```ts
import {
  TVApp,
  NavigationProvider,
  FocusableItem,
  useFocusable,
  useRemoteControl,
  usePlatform,
  KeyCode,
} from '@tv-app/core';
```

| Export | Type | Description |
|--------|------|-------------|
| `TVApp` | Component | Root wrapper -- sets up spatial navigation and platform detection |
| `NavigationProvider` | Component | Initializes the Norigin spatial navigation engine |
| `FocusableItem` | Component | Makes an element focusable via D-pad navigation |
| `useFocusable` | Hook | Low-level hook for custom focusable components (Norigin wrapper) |
| `useRemoteControl` | Hook | Handles Back, color buttons, media controls, and raw key events |
| `usePlatform` | Hook | Returns the detected platform (`'vidaa'`, `'tvos'`, `'browser'`, etc.) |
| `KeyCode` | Enum | Unified key code constants for all TV platforms |
| `RemoteKeyEvent` | Type | Typed key event with `keyCode`, `key`, `action`, and `originalEvent` |

---

## TVApp

The root component that every TV app should wrap its content in. It initializes spatial navigation and platform detection context.

```tsx
import { TVApp } from '@tv-app/core';

function App() {
  return (
    <TVApp debug={false}>
      <MyScreen />
    </TVApp>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | App content |
| `debug` | `boolean` | `false` | Enable spatial navigation visual debug overlay |

`TVApp` applies the following root styles: `cursor: none`, `overflow: hidden`, `width: 100vw`, `height: 100vh`. These prevent mouse cursor display and scrollbar appearance, which are standard requirements for TV UIs.

---

## FocusableItem

Makes an element navigable via D-pad. Uses a render callback pattern to provide the `ref` and `focused` state.

```tsx
import { FocusableItem } from '@tv-app/core';

<FocusableItem
  focusKey="my-button"
  onEnterPress={() => console.log('selected!')}
>
  {({ ref, focused }) => (
    <button
      ref={ref}
      className={focused ? 'focused' : ''}
    >
      Press me
    </button>
  )}
</FocusableItem>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `(props: { ref, focused }) => ReactNode` | required | Render callback |
| `onEnterPress` | `() => void` | -- | Called when Enter/Select is pressed while focused |
| `focusKey` | `string` | -- | Unique key for programmatic focus control |

The `ref` must be attached to the DOM element so that Norigin can track its position. The `focused` boolean updates whenever this element gains or loses focus.

---

## useFocusable

Low-level hook for building custom focusable containers. This is the Norigin `useFocusable` hook re-exported for convenience.

```tsx
import { useFocusable } from '@tv-app/core';
import { FocusContext } from '@noriginmedia/norigin-spatial-navigation';

function ContentRow({ children }) {
  const { ref, focusKey } = useFocusable();

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className="row">
        {children}
      </div>
    </FocusContext.Provider>
  );
}
```

Use this when you need focus containers (groups of focusable items that share a navigation context). Each `FocusContext.Provider` creates a scope -- D-pad navigation stays within the scope until the user moves past the container boundary.

---

## useRemoteControl

Hook for handling TV remote buttons beyond D-pad navigation. Norigin handles Up/Down/Left/Right/Enter automatically -- this hook covers everything else.

```tsx
import { useRemoteControl } from '@tv-app/core';

function MyScreen() {
  useRemoteControl({
    onBack: () => {
      // Handle Back button (keyCode 461 on VIDAA, 10009 on Tizen, 27 on Android, 8 fallback)
      navigation.goBack();
    },
    onColorButton: (color) => {
      // color: 'red' | 'green' | 'yellow' | 'blue'
      console.log(`${color} button pressed`);
    },
    onMediaButton: (action) => {
      // action: 'play' | 'pause' | 'stop' | 'ff' | 'rw'
      mediaPlayer.handleAction(action);
    },
    onKey: (event) => {
      // Raw key event for anything not covered above
      console.log(event.action, event.keyCode);
    },
    preventDefault: true, // Prevent default browser behavior for handled keys
  });
}
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `onBack` | `() => void` | -- | Called for any Back key (VIDAA 461, Tizen 10009, Android 27, Backspace 8) |
| `onColorButton` | `(color) => void` | -- | Called for HbbTV color buttons (Red/Green/Yellow/Blue) |
| `onMediaButton` | `(action) => void` | -- | Called for media transport controls |
| `onKey` | `(event: RemoteKeyEvent) => void` | -- | Called for every key event (in addition to specific handlers) |
| `preventDefault` | `boolean` | `true` | Prevent default browser behavior for recognized keys |

---

## usePlatform

Returns the detected platform as a string. Detection runs once on mount using the browser user agent and global flags.

```tsx
import { usePlatform } from '@tv-app/core';

function MyComponent() {
  const platform = usePlatform();
  // platform: 'vidaa' | 'tizen' | 'webos' | 'tvos' | 'android-tv' | 'browser'

  if (platform === 'vidaa') {
    // VIDAA-specific behavior
  }
}
```

**Detection logic:**

| Platform | Detection method |
|----------|-----------------|
| `vidaa` | User agent contains `hisense` or `vidaa` |
| `tizen` | User agent contains `tizen` |
| `webos` | User agent contains `webos` or `web0s` |
| `tvos` | `window.__TVOS_BRIDGE__` is defined (set by native Swift wrapper) |
| `android-tv` | User agent contains `android` and (`tv` or `aftt`) |
| `browser` | Default fallback |

The platform value is provided via React context from `TVApp` and never re-evaluates after initial detection.

---

## KeyCode Enum Reference

The `KeyCode` enum provides cross-platform key code constants. All values correspond to `event.keyCode` values (deprecated but universally supported on TV browsers).

### D-pad

| Key | Value | Constant |
|-----|-------|----------|
| Up | 38 | `KeyCode.UP` |
| Down | 40 | `KeyCode.DOWN` |
| Left | 37 | `KeyCode.LEFT` |
| Right | 39 | `KeyCode.RIGHT` |
| Enter | 13 | `KeyCode.ENTER` |

### Back

| Key | Value | Constant | Platform |
|-----|-------|----------|----------|
| Back (HbbTV) | 461 | `KeyCode.BACK_VIDAA` | VIDAA, webOS |
| Back (Samsung) | 10009 | `KeyCode.BACK_TIZEN` | Tizen |
| Escape | 27 | `KeyCode.BACK_ANDROID` | Android TV |
| Backspace | 8 | `KeyCode.BACKSPACE` | Browser fallback |

### Color Buttons

| Key | Value | Constant |
|-----|-------|----------|
| Red | 403 | `KeyCode.RED` |
| Green | 404 | `KeyCode.GREEN` |
| Yellow | 405 | `KeyCode.YELLOW` |
| Blue | 406 | `KeyCode.BLUE` |

### Media Controls

| Key | Value | Constant |
|-----|-------|----------|
| Play | 415 | `KeyCode.PLAY` |
| Pause | 19 | `KeyCode.PAUSE` |
| Stop | 413 | `KeyCode.STOP` |
| Fast Forward | 417 | `KeyCode.FAST_FORWARD` |
| Rewind | 412 | `KeyCode.REWIND` |

### Number Keys

| Key | Value | Constant |
|-----|-------|----------|
| 0-9 | 48-57 | `KeyCode.NUM_0` through `KeyCode.NUM_9` |

The helper `BACK_KEYS` array contains all four Back key codes for easy comparison. The `classifyKey(keyCode)` function maps any raw key code to a logical action string: `'up'`, `'down'`, `'left'`, `'right'`, `'enter'`, `'back'`, `'color'`, `'media'`, `'number'`, or `'unknown'`.

---

## How Spatial Navigation Works Under the Hood

The `NavigationProvider` component initializes the Norigin library exactly once (guarded by a module-level `initialized` flag). It calls `init()` with optional debug and visual debug settings, then creates a root `FocusContext.Provider`.

When a `FocusableItem` mounts, it calls the Norigin `useFocusable` hook, which registers the element's DOM node and bounding rectangle with the focus engine. On each arrow key press, the engine:

1. Gets the currently focused element's position.
2. Filters all registered focusable elements to those in the pressed direction.
3. Calculates distances using a weighted algorithm (closer elements along the primary axis are preferred).
4. Moves focus to the nearest match.

Focus containers (`FocusContext.Provider`) create scoped groups. Navigation prefers elements within the same container before crossing container boundaries. This makes horizontal rows behave naturally -- Left/Right stays within the row, while Up/Down moves between rows.

---

## Testing

```bash
# From the monorepo root
npx turbo run test --filter=@tv-app/core

# With coverage
npx turbo run test:coverage --filter=@tv-app/core
```

Tests run in a jsdom environment with `@testing-library/react`. The test suite covers:

- `keyCodes.test.ts` -- `classifyKey()` returns correct actions for all key code ranges
- `useRemoteControl.test.tsx` -- Callback dispatch for Back, color, media, and raw key events
- `usePlatform.test.tsx` -- Platform detection from various user agent strings and global flags
