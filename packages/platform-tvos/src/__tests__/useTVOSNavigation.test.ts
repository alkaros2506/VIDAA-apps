import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTVOSNavigation } from '../useTVOSNavigation';

function fireKeyDown(keyCode: number) {
  document.dispatchEvent(new KeyboardEvent('keydown', { keyCode, bubbles: true } as KeyboardEventInit));
}

describe('useTVOSNavigation', () => {
  it('calls onMenu when Escape pressed', () => {
    const onMenu = vi.fn();
    renderHook(() => useTVOSNavigation({ onMenu }));
    fireKeyDown(27);
    expect(onMenu).toHaveBeenCalledTimes(1);
  });

  it('calls onPlayPause when media key pressed', () => {
    const onPlayPause = vi.fn();
    renderHook(() => useTVOSNavigation({ onPlayPause }));
    fireKeyDown(179);
    expect(onPlayPause).toHaveBeenCalledTimes(1);
  });

  it('cleans up on unmount', () => {
    const onMenu = vi.fn();
    const { unmount } = renderHook(() => useTVOSNavigation({ onMenu }));
    unmount();
    fireKeyDown(27);
    expect(onMenu).not.toHaveBeenCalled();
  });
});
