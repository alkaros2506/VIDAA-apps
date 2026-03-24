/**
 * Unified key code map for TV remotes.
 * Covers VIDAA (HbbTV/CE-HTML), LG webOS, Samsung Tizen, Apple TV (via JS bridge).
 */
export enum KeyCode {
  // D-pad (standard across all platforms)
  UP = 38,
  DOWN = 40,
  LEFT = 37,
  RIGHT = 39,
  ENTER = 13,

  // Back button (platform-specific)
  BACK_VIDAA = 461,       // HbbTV standard — VIDAA, webOS
  BACK_TIZEN = 10009,     // Samsung Tizen
  BACK_ANDROID = 27,      // Android TV (maps to Escape)
  BACKSPACE = 8,          // Fallback

  // Color buttons (HbbTV standard)
  RED = 403,
  GREEN = 404,
  YELLOW = 405,
  BLUE = 406,

  // Media controls
  PLAY = 415,
  PAUSE = 19,
  STOP = 413,
  FAST_FORWARD = 417,
  REWIND = 412,

  // Number keys
  NUM_0 = 48,
  NUM_1 = 49,
  NUM_2 = 50,
  NUM_3 = 51,
  NUM_4 = 52,
  NUM_5 = 53,
  NUM_6 = 54,
  NUM_7 = 55,
  NUM_8 = 56,
  NUM_9 = 57,
}

/** All keycodes that map to "Back" across platforms */
export const BACK_KEYS = [KeyCode.BACK_VIDAA, KeyCode.BACK_TIZEN, KeyCode.BACK_ANDROID, KeyCode.BACKSPACE];

export interface RemoteKeyEvent {
  keyCode: KeyCode;
  key: string;
  /** Which logical action this key maps to */
  action: 'up' | 'down' | 'left' | 'right' | 'enter' | 'back' | 'color' | 'media' | 'number' | 'unknown';
  originalEvent: KeyboardEvent;
}

/** Classify a raw keyCode into a logical action */
export function classifyKey(keyCode: number): RemoteKeyEvent['action'] {
  if (keyCode === KeyCode.UP) return 'up';
  if (keyCode === KeyCode.DOWN) return 'down';
  if (keyCode === KeyCode.LEFT) return 'left';
  if (keyCode === KeyCode.RIGHT) return 'right';
  if (keyCode === KeyCode.ENTER) return 'enter';
  if (BACK_KEYS.includes(keyCode)) return 'back';
  if (keyCode >= KeyCode.RED && keyCode <= KeyCode.BLUE) return 'color';
  if ([KeyCode.PLAY, KeyCode.PAUSE, KeyCode.STOP, KeyCode.FAST_FORWARD, KeyCode.REWIND].includes(keyCode)) return 'media';
  if (keyCode >= KeyCode.NUM_0 && keyCode <= KeyCode.NUM_9) return 'number';
  return 'unknown';
}
