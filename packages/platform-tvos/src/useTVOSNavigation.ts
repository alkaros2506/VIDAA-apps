import { useEffect, useCallback } from 'react';

const TVOS_KEYS = {
  MENU: 27,
  PLAY_PAUSE: 179,
  SELECT: 13,
} as const;

interface TVOSNavigationOptions {
  onMenu?: () => void;
  onPlayPause?: () => void;
}

export function useTVOSNavigation(options: TVOSNavigationOptions = {}): void {
  const { onMenu, onPlayPause } = options;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      switch (e.keyCode) {
        case TVOS_KEYS.MENU:
          e.preventDefault();
          onMenu?.();
          break;
        case TVOS_KEYS.PLAY_PAUSE:
          e.preventDefault();
          onPlayPause?.();
          break;
      }
    },
    [onMenu, onPlayPause],
  );

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handler]);
}
