import { describe, it, expect } from 'vitest';
import { KeyCode, classifyKey, BACK_KEYS } from '../input/keyCodes';

describe('classifyKey', () => {
  it('classifies arrow keys as directional', () => {
    expect(classifyKey(KeyCode.UP)).toBe('up');
    expect(classifyKey(KeyCode.DOWN)).toBe('down');
    expect(classifyKey(KeyCode.LEFT)).toBe('left');
    expect(classifyKey(KeyCode.RIGHT)).toBe('right');
  });

  it('classifies Enter as enter', () => {
    expect(classifyKey(KeyCode.ENTER)).toBe('enter');
  });

  it('classifies all back keys as back', () => {
    for (const key of BACK_KEYS) {
      expect(classifyKey(key)).toBe('back');
    }
  });

  it('classifies VIDAA back key (461)', () => {
    expect(classifyKey(461)).toBe('back');
  });

  it('classifies Tizen back key (10009)', () => {
    expect(classifyKey(10009)).toBe('back');
  });

  it('classifies color buttons', () => {
    expect(classifyKey(KeyCode.RED)).toBe('color');
    expect(classifyKey(KeyCode.GREEN)).toBe('color');
    expect(classifyKey(KeyCode.YELLOW)).toBe('color');
    expect(classifyKey(KeyCode.BLUE)).toBe('color');
  });

  it('classifies media buttons', () => {
    expect(classifyKey(KeyCode.PLAY)).toBe('media');
    expect(classifyKey(KeyCode.PAUSE)).toBe('media');
    expect(classifyKey(KeyCode.STOP)).toBe('media');
    expect(classifyKey(KeyCode.FAST_FORWARD)).toBe('media');
    expect(classifyKey(KeyCode.REWIND)).toBe('media');
  });

  it('classifies number keys', () => {
    for (let i = 0; i <= 9; i++) {
      expect(classifyKey(48 + i)).toBe('number');
    }
  });

  it('returns unknown for unrecognized keys', () => {
    expect(classifyKey(999)).toBe('unknown');
  });
});
