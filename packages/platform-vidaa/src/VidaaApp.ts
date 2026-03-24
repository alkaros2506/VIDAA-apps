import type { VidaaConfig } from './types';

/**
 * VIDAA-specific app initialization.
 * Call this once at app startup to configure platform-specific behavior.
 */
export function VidaaApp(config: VidaaConfig): void {
  // Inject VIDAA-specific CSS
  injectGlobalStyles();

  // Set up Back key behavior for root screen
  setupBackHandler(config.onRootBack ?? 'exit');

  // Disable unwanted browser features
  disableBrowserFeatures();
}

function injectGlobalStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    * { cursor: none !important; }
    body {
      margin: 0;
      padding: 0;
      overflow: hidden;
      -webkit-user-select: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    :focus {
      outline: none;
    }
    /* TV safe area — 5% margin from edges */
    .tv-safe-area {
      padding: 5vh 5vw;
      box-sizing: border-box;
      width: 100vw;
      height: 100vh;
    }
  `;
  document.head.appendChild(style);
}

function setupBackHandler(behavior: VidaaConfig['onRootBack']): void {
  let isRootScreen = true;

  // Expose a way for the app to signal navigation depth
  (window as unknown as Record<string, unknown>).__setRootScreen = (value: boolean) => {
    isRootScreen = value;
  };

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // VIDAA/HbbTV back key = 461
    if (e.keyCode === 461 && isRootScreen) {
      e.preventDefault();
      if (behavior === 'exit') {
        window.close();
      } else if (behavior === 'confirm') {
        // The app should handle this via the useRemoteControl hook
      } else if (typeof behavior === 'function') {
        behavior();
      }
    }
  });
}

function disableBrowserFeatures(): void {
  // Prevent context menu
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Prevent text selection via keyboard
  document.addEventListener('selectstart', (e) => e.preventDefault());

  // Prevent scrolling (TV apps should control their own scrolling)
  document.addEventListener('wheel', (e) => e.preventDefault(), { passive: false });
}
