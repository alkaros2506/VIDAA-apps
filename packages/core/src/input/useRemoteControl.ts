import { useEffect, useCallback } from 'react';
import { KeyCode, classifyKey, type RemoteKeyEvent } from './keyCodes';

type KeyHandler = (event: RemoteKeyEvent) => void;

interface UseRemoteControlOptions {
  onBack?: () => void;
  onColorButton?: (color: 'red' | 'green' | 'yellow' | 'blue') => void;
  onMediaButton?: (action: 'play' | 'pause' | 'stop' | 'ff' | 'rw') => void;
  onKey?: KeyHandler;
  /** Prevent default browser behavior for handled keys */
  preventDefault?: boolean;
}

const COLOR_MAP: Record<number, 'red' | 'green' | 'yellow' | 'blue'> = {
  [KeyCode.RED]: 'red',
  [KeyCode.GREEN]: 'green',
  [KeyCode.YELLOW]: 'yellow',
  [KeyCode.BLUE]: 'blue',
};

const MEDIA_MAP: Record<number, 'play' | 'pause' | 'stop' | 'ff' | 'rw'> = {
  [KeyCode.PLAY]: 'play',
  [KeyCode.PAUSE]: 'pause',
  [KeyCode.STOP]: 'stop',
  [KeyCode.FAST_FORWARD]: 'ff',
  [KeyCode.REWIND]: 'rw',
};

/**
 * Hook for handling TV remote control input.
 * Spatial navigation (D-pad + Enter) is handled by Norigin — this hook
 * handles Back, color buttons, media controls, and raw key events.
 */
export function useRemoteControl(options: UseRemoteControlOptions = {}) {
  const { onBack, onColorButton, onMediaButton, onKey, preventDefault = true } = options;

  const handler = useCallback(
    (e: KeyboardEvent) => {
      const action = classifyKey(e.keyCode);
      const event: RemoteKeyEvent = {
        keyCode: e.keyCode as KeyCode,
        key: e.key,
        action,
        originalEvent: e,
      };

      if (preventDefault && action !== 'unknown') {
        e.preventDefault();
      }

      if (action === 'back' && onBack) {
        onBack();
      } else if (action === 'color' && onColorButton) {
        onColorButton(COLOR_MAP[e.keyCode]);
      } else if (action === 'media' && onMediaButton) {
        onMediaButton(MEDIA_MAP[e.keyCode]);
      }

      onKey?.(event);
    },
    [onBack, onColorButton, onMediaButton, onKey, preventDefault],
  );

  useEffect(() => {
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [handler]);
}
