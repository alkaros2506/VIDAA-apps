import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRemoteControl } from '../input/useRemoteControl';
import { KeyCode } from '../input/keyCodes';

function fireKeyDown(keyCode: number, key = '') {
  const event = new KeyboardEvent('keydown', { keyCode, key, bubbles: true } as KeyboardEventInit);
  document.dispatchEvent(event);
}

describe('useRemoteControl', () => {
  it('calls onBack when VIDAA back key pressed', () => {
    const onBack = vi.fn();
    renderHook(() => useRemoteControl({ onBack }));

    fireKeyDown(KeyCode.BACK_VIDAA);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onBack when Tizen back key pressed', () => {
    const onBack = vi.fn();
    renderHook(() => useRemoteControl({ onBack }));

    fireKeyDown(KeyCode.BACK_TIZEN);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('calls onColorButton with correct color', () => {
    const onColorButton = vi.fn();
    renderHook(() => useRemoteControl({ onColorButton }));

    fireKeyDown(KeyCode.RED);
    expect(onColorButton).toHaveBeenCalledWith('red');

    fireKeyDown(KeyCode.GREEN);
    expect(onColorButton).toHaveBeenCalledWith('green');
  });

  it('calls onKey for any key press', () => {
    const onKey = vi.fn();
    renderHook(() => useRemoteControl({ onKey }));

    fireKeyDown(KeyCode.UP);
    expect(onKey).toHaveBeenCalledTimes(1);
    expect(onKey.mock.calls[0][0].action).toBe('up');
  });

  it('cleans up listener on unmount', () => {
    const onKey = vi.fn();
    const { unmount } = renderHook(() => useRemoteControl({ onKey }));

    unmount();
    fireKeyDown(KeyCode.UP);
    expect(onKey).not.toHaveBeenCalled();
  });
});
